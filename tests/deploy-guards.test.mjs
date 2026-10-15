import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
const skip = process.platform === "win32" && "deployment guards run on the Linux runners and VPS";
const revision = "a".repeat(40);
const checksum = "b".repeat(64);

function sandbox(t) {
  const dir = mkdtempSync(path.join(tmpdir(), "aurevia-guard-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function stub(dir, name, body) {
  const file = path.join(dir, name);
  writeFileSync(file, `#!/usr/bin/env bash\n${body}\n`);
  chmodSync(file, 0o755);
}
function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: "utf8", ...options });
}
function git(cwd, ...args) {
  const result = run("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...args], { cwd });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
// A minimal ustar writer, so tests choose entry names and types that tar itself
// would refuse to create. Type "0" is a file, "1" a hard link, "2" a symlink, "5" a directory.
function tarball(entries) {
  const blocks = [];
  for (const { name, type = "0", body = "", link = "" } of entries) {
    const header = Buffer.alloc(512);
    const content = Buffer.from(body);
    header.write(name, 0, 100);
    header.write(type === "5" ? "0000755\0" : "0000644\0", 100);
    header.write("0000000\0", 108);
    header.write("0000000\0", 116);
    header.write(`${content.length.toString(8).padStart(11, "0")}\0`, 124);
    header.write("00000000000\0", 136);
    header.write(type, 156);
    header.write(link, 157, 100);
    header.write("ustar\u000000", 257);
    header.fill(" ", 148, 156);
    const sum = header.reduce((total, byte) => total + byte, 0);
    header.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148);
    blocks.push(header, content, Buffer.alloc((512 - (content.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks));
}
// Runs `script` after sourcing the root deploy helper, which then only defines its guards.
function helper(script, ...args) {
  return run("bash", ["-c", `source "$1"; shift; ${script}`, "helper", path.join(root, "ops/deploy-release.sh"), ...args]);
}

test("production deploys only a master merge commit identical to a staged dev commit", { skip }, (t) => {
  const repo = sandbox(t), bin = sandbox(t);
  stub(bin, "gh", 'echo "${FAKE_STATUS:-missing}"');
  git(repo, "init", "-q", "-b", "master");
  writeFileSync(path.join(repo, "site.txt"), "v1\n");
  git(repo, "add", "."); git(repo, "commit", "-qm", "base");
  git(repo, "checkout", "-qb", "dev");
  writeFileSync(path.join(repo, "site.txt"), "v2\n");
  git(repo, "commit", "-qam", "feature");
  git(repo, "checkout", "-q", "master");
  git(repo, "merge", "-q", "--no-ff", "dev", "-m", "promote");
  const promoted = git(repo, "rev-parse", "HEAD");
  git(repo, "commit", "-q", "--allow-empty", "-m", "direct push");
  const direct = git(repo, "rev-parse", "HEAD");
  git(repo, "checkout", "-q", "dev");
  writeFileSync(path.join(repo, "site.txt"), "v3\n");
  git(repo, "commit", "-qam", "staged");
  git(repo, "checkout", "-q", "master");
  writeFileSync(path.join(repo, "hotfix.txt"), "unstaged\n");
  git(repo, "add", "."); git(repo, "commit", "-qm", "hotfix");
  git(repo, "merge", "-q", "--no-ff", "dev", "-m", "promote with extra master change");
  const drifted = git(repo, "rev-parse", "HEAD");

  const verify = (sha, status) => run("bash", [path.join(root, "scripts/verify-promotion.sh"), sha], {
    cwd: repo,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, GITHUB_REPOSITORY: "owner/repo", FAKE_STATUS: status },
  });
  assert.equal(verify(promoted, "success").status, 0);
  assert.match(verify(promoted, "missing").stderr, /no successful policy\/dev-to-master/);
  assert.match(verify(direct, "success").stderr, /not a promotion merge commit/);
  assert.match(verify(drifted, "success").stderr, /differs from the staged dev commit/);
});

test("deploy keys can only deploy the environment pinned on the VPS", { skip }, (t) => {
  const home = sandbox(t), bin = sandbox(t);
  const inbox = path.join(home, "aurevia-incoming");
  // Fake sudo prints the helper call and the archive it received.
  stub(bin, "sudo", 'echo "$*"; cat "$4"; cat "$4.sha256"');
  const gate = (pinned, command) => run("bash", [path.join(root, "ops/aurevia-ssh-gate.sh"), pinned], {
    input: "release-bytes",
    env: { ...process.env, HOME: home, PATH: `${bin}:${process.env.PATH}`, SSH_ORIGINAL_COMMAND: command },
  });

  const refused = gate("staging", `production ${revision} ${checksum}`);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /may only deploy staging/);
  for (const command of ["", `staging ${revision}`, `staging ${revision} ${checksum} extra`, `staging ${revision.toUpperCase()} ${checksum}`, `staging;id ${revision} ${checksum}`]) {
    assert.match(gate("staging", command).stderr, /Usage:/, command);
  }
  assert.match(gate("qa", `staging ${revision} ${checksum}`).stderr, /misconfigured/);

  const accepted = gate("production", `production ${revision} ${checksum}`);
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.match(accepted.stdout, new RegExp(`^-n /usr/local/sbin/aurevia-deploy production ${inbox}/production-\\S+-${revision}\\.tar\\.gz ${revision}\\n`));
  assert.match(accepted.stdout, new RegExp(`release-bytes${checksum}  production-\\S+-${revision}\\.tar\\.gz\\n$`));
});

test("the root deploy helper unpacks only plain files and directories at safe paths", { skip }, (t) => {
  const dir = sandbox(t);
  let count = 0;
  const check = (entries) => {
    const archive = path.join(dir, `release-${count++}.tar.gz`);
    writeFileSync(archive, tarball(entries));
    return helper('check_release_archive "$1"', archive);
  };

  const safe = check([{ name: "./", type: "5" }, { name: "./server.js", body: "ok" }, { name: "./.next/", type: "5" }]);
  assert.equal(safe.status, 0, safe.stderr);

  // A planted .revision -> /etc/sudoers.d/... link would have been written through by root.
  const links = [
    [{ name: "./.revision", type: "2", link: "/etc/sudoers.d/aurevia-deploy" }],
    [{ name: "./.next/", type: "5" }, { name: "./.next/cache", type: "2", link: "/home/deploy/.ssh" }],
    [{ name: "./server.js", body: "ok" }, { name: "./.environment", type: "1", link: "./server.js" }],
    [{ name: "./fifo", type: "6" }],
  ];
  for (const entries of links) {
    const result = check(entries);
    assert.equal(result.status, 1, JSON.stringify(entries));
    assert.match(result.stderr, /may only contain regular files and directories/);
  }

  for (const name of ["../escape", "./a/../../escape", "/etc/cron.d/aurevia", "a/.."]) {
    const result = check([{ name, body: "x" }]);
    assert.equal(result.status, 1, name);
    assert.match(result.stderr, /unsafe path/, name);
  }

  assert.match(check([]).stderr, /empty/);
});

test("the root deploy helper checks free space before unpacking", { skip }, (t) => {
  const dir = sandbox(t);
  const archive = path.join(dir, "release.tar.gz");
  writeFileSync(archive, tarball([{ name: "./server.js", body: "x".repeat(4096) }]));

  const fits = helper('FREE_SPACE_MARGIN_KB=0; check_free_space "$1" "$2"', archive, dir);
  assert.equal(fits.status, 0, fits.stderr);
  const full = helper('FREE_SPACE_MARGIN_KB=$((1 << 50)); check_free_space "$1" "$2"', archive, dir);
  assert.equal(full.status, 1);
  assert.match(full.stderr, /Not enough free space/);
});

test("the root deploy helper starts PM2 only with options PM2 7 accepts", () => {
  // An unknown option fails the restart and the rollback's restart alike; an
  // earlier helper passed --exec-mode and left staging down.
  const code = readFileSync(path.join(root, "ops/deploy-release.sh"), "utf8")
    .split("\n").filter((line) => !line.trimStart().startsWith("#")).join("\n");
  const start = code.match(/run_pm2 "\$revision" start (.+?)\|\| return 1/s)?.[1];
  assert.ok(start, "restart_release starts the site with pm2 start");
  assert.deepEqual([...start.matchAll(/(?:^|\s)--([a-z-]+)/g)].map(([, option]) => option), ["name", "cwd", "node-args", "time"]);
  assert.doesNotMatch(code, /--exec-mode|--instances/);
});

test("release retention never prunes the live or previous release", { skip }, (t) => {
  const releases = sandbox(t);
  // Oldest first: releases from before and after the switch to mktemp names.
  const names = [
    "20260101-000000-aaaaaaaaaaaa",
    "20260102-000000-bbbbbbbbbbbb",
    "20260103-000000-cccccccccccc",
    "20260104-000000-dddddddddddd.Q1w2E3",
    "20260105-000000-eeeeeeeeeeee.R4t5Y6",
    "20260106-000000-ffffffffffff.U7i8O9",
    "20260107-000000-000000000000.P0a1S2",
  ];
  for (const name of [...names, "lost+found", "manual-backup"]) mkdirSync(path.join(releases, name));
  writeFileSync(path.join(releases, "20260108-000000-not-a-directory"), "");

  const prunable = (...protectedReleases) => {
    const result = helper('prunable_releases "$@"', releases, "3", ...protectedReleases);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.split("\n").filter(Boolean);
  };

  assert.deepEqual(prunable(), [names[3], names[2], names[1], names[0]]);
  // After repeated failures the live release and the rollback target can be the oldest.
  assert.deepEqual(prunable(path.join(releases, names[6]), path.join(releases, names[0]), ""), [names[3], names[2], names[1]]);
  assert.deepEqual(prunable(path.join(releases, names[1]), path.join(releases, names[2])), [names[3], names[0]]);
});

test("CI deploys only through the pinned gate", { skip }, (t) => {
  const bin = sandbox(t), work = sandbox(t);
  const log = path.join(work, "ssh.log");
  stub(bin, "ssh", 'printf "ssh %s\n" "$*" >> "$SSH_LOG"; cat > /dev/null; exit "${SSH_STATUS:-0}"');
  stub(bin, "scp", 'printf "scp %s\n" "$*" >> "$SSH_LOG"');
  const archive = path.join(work, "release.tar.gz");
  writeFileSync(archive, "release-bytes");
  writeFileSync(`${archive}.sha256`, `${checksum}  release.tar.gz\n`);

  const deploy = (environment) => {
    rmSync(log, { force: true });
    const result = run("bash", [path.join(root, "scripts/deploy-vps.sh"), "staging", archive, revision], {
      env: {
        ...process.env, PATH: `${bin}:${process.env.PATH}`, RUNNER_TEMP: work, SSH_LOG: log,
        VPS_HOST: "origin.example", VPS_USER: "deploy", VPS_SSH_KEY: "key", VPS_KNOWN_HOSTS: "origin.example ssh-ed25519 AAAA",
        SSH_STATUS: "0", ...environment,
      },
    });
    return { ...result, calls: existsSync(log) ? readFileSync(log, "utf8") : "" };
  };
  const gatedCall = new RegExp(`^ssh .*-o ServerAliveInterval=15 .*deploy@origin\\.example staging ${revision} ${checksum}\\n$`);

  const gated = deploy({});
  assert.equal(gated.status, 0, gated.stderr);
  assert.match(gated.calls, gatedCall);

  // A leftover variable from before the cutover cannot bring back scp and a shell.
  const leftover = deploy({ VPS_DEPLOY_PROTOCOL: "legacy" });
  assert.equal(leftover.status, 0, leftover.stderr);
  assert.match(leftover.calls, gatedCall);

  const unpinned = deploy({ SSH_STATUS: "127" });
  assert.equal(unpinned.status, 127);
  assert.match(unpinned.stderr, /not pinned to aurevia-ssh-gate/);
  assert.doesNotMatch(unpinned.stderr, /legacy/);
  assert.doesNotMatch(unpinned.calls, /scp|sudo/);
});

// The jobs of a workflow, without comment lines. Each job starts with a key
// indented by two spaces under `jobs:`.
function workflowJobs(name) {
  const text = readFileSync(path.join(root, ".github/workflows", name), "utf8").replaceAll("\r\n", "\n")
    .split("\n").filter((line) => !line.trimStart().startsWith("#")).join("\n");
  const jobs = text.split(/^jobs:\n/m)[1] ?? "";
  return Object.fromEntries(jobs.split(/^(?=  [a-z][a-z-]*:\n)/m)
    .map((job) => [job.match(/^  ([a-z][a-z-]*):\n/)?.[1], job]).filter(([key]) => key));
}

test("deploy workflows install npm packages only in a job without secrets", () => {
  for (const name of ["deploy-staging.yml", "deploy-production.yml"]) {
    const jobs = workflowJobs(name);
    const { build, deploy } = jobs;
    assert.ok(build && deploy, `${name} has build and deploy jobs`);

    assert.match(build, /run: npm ci$/m, name);
    assert.doesNotMatch(build, /^ {4}environment:/m, name);
    assert.match(deploy, /^ {4}environment:/m, name);
    assert.match(deploy, /^ {4}needs: build$/m, name);
    assert.match(deploy, /secrets\.VPS_SSH_KEY/, name);
    assert.doesNotMatch(deploy, /\bnpm\b|setup-node/, name);
    assert.match(deploy, /sha256sum --check --strict/, name);
    for (const [job, body] of Object.entries(jobs)) {
      if (job !== "deploy") assert.doesNotMatch(body, /secrets\./, `${name}: ${job}`);
    }
  }

  // The master ruleset requires this check, and only a staged commit may be promoted.
  const staging = workflowJobs("deploy-staging.yml");
  assert.match(staging.deploy, /^ {4}name: Deploy staging$/m);
  assert.match(staging.promote, /^ {4}needs: deploy$/m);
  assert.match(staging.promote, /context='policy\/dev-to-master'/);

  // Production checks the promotion before any dependency code runs and again
  // in the job that holds the deploy key, before it deploys.
  const production = workflowJobs("deploy-production.yml");
  const before = (job, first, second) => {
    const a = job.indexOf(first), b = job.indexOf(second);
    return a >= 0 && b >= 0 && a < b;
  };
  assert.ok(before(production.build, "bash scripts/verify-promotion.sh", "npm ci"));
  assert.ok(before(production.deploy, "bash scripts/verify-promotion.sh", "bash scripts/deploy-vps.sh"));
});

test("workflows pin every action to a full commit SHA", () => {
  for (const name of ["ci.yml", "deploy-staging.yml", "deploy-production.yml"]) {
    const workflow = readFileSync(path.join(root, ".github/workflows", name), "utf8");
    const actions = [...workflow.matchAll(/^ *(?:- )?uses: (\S+)/gm)].map(([, action]) => action);
    assert.ok(actions.length > 0, name);
    for (const action of actions) assert.match(action, /^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/, `${name}: ${action}`);
  }
});

// The deploy workflows never run on pull requests, so the required Verify check
// is the only place their mistakes can be caught before merge.
test("the required CI check lints the workflows with checksum-pinned tools", () => {
  const { verify } = workflowJobs("ci.yml");
  assert.ok(verify, "ci.yml has a verify job");
  assert.match(verify, /^ {4}name: Verify$/m);
  assert.match(verify, /^ {10}ACTIONLINT_SHA256: [0-9a-f]{64}$/m);
  assert.match(verify, /^ {10}SHELLCHECK_SHA256: [0-9a-f]{64}$/m);
  assert.match(verify, /sha256sum --check --strict/);
  assert.match(verify, /"\$tools\/actionlint" .*-shellcheck "\$tools\/shellcheck"/);
});

test("a Cloudflare range update that Nginx rejects restores the previous include", { skip }, (t) => {
  const dir = sandbox(t), bin = sandbox(t);
  const nginx = path.join(dir, "nginx");
  const target = path.join(nginx, "conf.d/aurevia-cloudflare.conf");
  const systemctl = path.join(dir, "systemctl.log");
  mkdirSync(path.dirname(target), { recursive: true });
  const script = path.join(dir, "update-cloudflare-ips.sh");
  writeFileSync(script, readFileSync(path.join(root, "ops/update-cloudflare-ips.sh"), "utf8").replaceAll("/etc/nginx/", `${nginx}/`));
  stub(bin, "curl", `case "$*" in
  *ips-v4*) printf '173.245.48.0/20\n103.21.244.0/22\n103.22.200.0/22\n103.31.4.0/22\n141.101.64.0/18\n' ;;
  *) printf '2400:cb00::/32\n2606:4700::/32\n2803:f800::/32\n' ;;
esac`);
  stub(bin, "nginx", 'exit "$NGINX_STATUS"');
  stub(bin, "systemctl", `echo "$*" >> "${systemctl}"`);
  const update = (status) => run("bash", [script], {
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, NGINX_STATUS: status },
  });

  writeFileSync(target, "# previous ranges\n");
  const rejected = update("1");
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /Restored the previous/);
  assert.equal(readFileSync(target, "utf8"), "# previous ranges\n");

  rmSync(target);
  assert.equal(update("1").status, 1);
  assert.equal(existsSync(target), false);
  assert.equal(existsSync(systemctl), false);

  const accepted = update("0");
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.match(readFileSync(target, "utf8"), /^set_real_ip_from 173\.245\.48\.0\/20;$/m);
  assert.equal(readFileSync(systemctl, "utf8"), "reload nginx\n");
});

test("the public health check excuses only consecutive Cloudflare challenges", { skip }, (t) => {
  const dir = sandbox(t);
  const bin = path.join(dir, "bin");
  mkdirSync(bin);
  // Each line of $RESPONSES is "status|header|body", one per request; the last repeats.
  stub(bin, "curl", `output= headers=
while (($#)); do
  case "$1" in
    --output) output="$2"; shift ;;
    --dump-header) headers="$2"; shift ;;
  esac
  shift
done
count=$(( $(cat "$COUNTER" 2>/dev/null || echo 0) + 1 ))
echo "$count" >"$COUNTER"
line="$(sed -n "\${count}p" "$RESPONSES")"
[[ -n "$line" ]] || line="$(tail -n 1 "$RESPONSES")"
IFS='|' read -r code header body <<<"$line"
printf 'HTTP/2 %s\r\n%s\r\n\r\n' "$code" "$header" >"$headers"
printf '%s' "$body" >"$output"
printf '%s' "$code"`);
  stub(bin, "sleep", "exit 0");
  const health = (sha) => `{"status":"ok","service":"aurevia-gaming","environment":"staging","revision":"${sha}"}`;
  const challenge = "403|cf-mitigated: challenge|<title>Just a moment...</title>";
  const check = (...responses) => {
    writeFileSync(path.join(dir, "responses"), `${responses.join("\n")}\n`);
    rmSync(path.join(dir, "count"), { force: true });
    return run("bash", [path.join(root, "scripts/verify-public-health.sh"), "https://staging.aureviagaming.com", "staging", revision], {
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, RESPONSES: path.join(dir, "responses"), COUNTER: path.join(dir, "count") },
    });
  };

  assert.equal(check(`200|content-type: application/json|${health(revision)}`).status, 0);
  const challenged = check(challenge);
  assert.equal(challenged.status, 0, challenged.stderr);
  assert.match(challenged.stdout, /::warning::Cloudflare challenged this runner/);
  // A WAF block rule or an Nginx deny is not a bot challenge.
  assert.equal(check("403|server: cloudflare|Forbidden").status, 1);
  // Any other answer between challenges restarts the count.
  assert.equal(check(challenge, challenge, "502|server: cloudflare|Bad gateway", challenge, challenge, "502|server: cloudflare|").status, 1);
  // The app serving another revision is never excused by later challenges.
  const stale = check(`200|content-type: application/json|${health("c".repeat(40))}`, challenge);
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /The app answered with: .*"revision":"c{40}"/);
});
