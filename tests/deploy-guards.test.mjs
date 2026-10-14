import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

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
  const inbox = sandbox(t), bin = sandbox(t);
  // Fake sudo prints the helper call and the archive it received.
  stub(bin, "sudo", 'echo "$*"; cat "$4"; cat "$4.sha256"');
  const gatePath = path.join(sandbox(t), "gate.sh");
  writeFileSync(gatePath, readFileSync(path.join(root, "ops/aurevia-ssh-gate.sh"), "utf8")
    .replace('INBOX_ROOT="/home/deploy/aurevia-incoming"', `INBOX_ROOT="${inbox}"`));
  const gate = (pinned, command) => run("bash", [gatePath, pinned], {
    input: "release-bytes",
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, SSH_ORIGINAL_COMMAND: command },
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
