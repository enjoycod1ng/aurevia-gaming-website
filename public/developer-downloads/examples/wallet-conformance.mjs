// Node.js 20+. Run only against a dedicated, funded sandbox player.
// The journal stores stable transaction IDs before delivery, allowing safe resume.
import {createHash, createHmac, randomUUID} from 'node:crypto';
import {readFileSync, writeFileSync, renameSync, existsSync, openSync, closeSync, unlinkSync, fsyncSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';

const [configFile, journalFile] = process.argv.slice(2);
if (!configFile || !journalFile) throw new Error('Usage: node wallet-conformance.mjs private-config.json private-journal.json');
const config = JSON.parse(readFileSync(configFile, 'utf8'));
assert.equal(config.environment, 'sandbox', 'Only sandbox funds are permitted');
assert.equal(config.dedicated_test_player, true, 'Use a player with no other wallet activity during this run');
for (const field of ['wallet_url','wallet_secret','operator_id','player_id','currency']) assert.ok(config[field], `Missing ${field}`);
const base = new URL(config.wallet_url);
assert.ok(!base.username && !base.password && !base.search && !base.hash, 'Invalid callback base URL');
assert.ok(base.protocol === 'https:' || (base.protocol === 'http:' && config.local_test_host === base.hostname),
  'HTTPS is required; local_test_host permits one explicitly named local test service');
const path = resolve(journalFile);
const lockPath = path + '.lock';
const lock = openSync(lockPath, 'wx', 0o600); // Do not run two copies against one journal.
closeSync(lock);
let state;
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b))));
const identity = createHash('sha256').update(canonical({wallet_url:base.href,operator_id:config.operator_id,
  player_id:config.player_id,currency:config.currency,game_symbol:config.game_symbol || 'wildframes'})).digest('hex');
const minor = value => { assert.match(value, /^(0|[1-9][0-9]{0,13})\.[0-9]{2}$/); return BigInt(value.replace('.', '')); };
const money = value => `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
function save() {
  const fd = openSync(path + '.tmp', 'w', 0o600);
  try {writeFileSync(fd, JSON.stringify(state, null, 2) + '\n'); fsyncSync(fd);} finally {closeSync(fd);}
  renameSync(path + '.tmp', path);
}
function payload(kind, name, amount, round, original) {
  const value = {operator_id:config.operator_id,player_id:config.player_id,currency:config.currency,
    session_id:state.run_id,game_symbol:config.game_symbol || 'wildframes',
    transaction_id:`acceptance:${state.run_id}:${name}`,transaction_type:kind,
    action_type:({balance:'balance',debit:'spin',credit:'collect',rollback:'rollback'})[kind],amount};
  if (kind !== 'balance') Object.assign(value,{round_id:state.rounds[round],round_closed:kind !== 'debit'});
  if (original) value.original_transaction_id = `acceptance:${state.run_id}:${original}`;
  return value;
}
async function send(value, options = {}) {
  const bodyValue = {...value,request_id:randomUUID()};
  const body = JSON.stringify(bodyValue);
  const timestamp = String(Math.floor(Date.now()/1000) - (options.stale ? 600 : 0));
  const signature = createHmac('sha256',config.wallet_secret).update(timestamp + '.' + body).digest('hex');
  const started = performance.now();
  const response = await fetch(base.href.replace(/\/$/,'') + '/' + value.transaction_type, {
    method:'POST',body,redirect:'error',signal:AbortSignal.timeout(5000),
    headers:{'content-type':'application/json','x-pp-timestamp':timestamp,
      'x-pp-request-id':options.wrongRequestId ? randomUUID() : bodyValue.request_id,
      'x-pp-signature':options.invalidSignature ? '0'.repeat(64) : signature},
  });
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  while (true) {
    const {done,value:chunk} = await reader.read(); if (done) break;
    size += chunk.length; if (size > 65536) {await reader.cancel(); throw new Error('Response exceeds 64 KiB');}
    chunks.push(Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  let result; try { result = JSON.parse(raw); } catch { throw new Error(`Wallet HTTP ${response.status}: invalid JSON`); }
  return {status:response.status,body:result,latency_ms:Math.round(performance.now()-started)};
}
function success(response, value) {
  assert.equal(response.status,200); assert.equal(response.body.success,true);
  assert.equal(response.body.transaction_id,value.transaction_id); assert.equal(response.body.currency,config.currency);
  return minor(response.body.balance);
}
async function step(name, value, check, options = {}) {
  if (state.steps[name]?.done) return state.steps[name].result;
  const existing = state.steps[name];
  if (existing) assert.deepEqual(existing.payload,value,'Resume must preserve the original financial request');
  else {state.steps[name] = {payload:value,done:false}; save();}
  const responses = await Promise.all(Array.from({length:options.concurrent || 1},()=>send(value,options)));
  await check(responses, value);
  state.steps[name].done = true; state.steps[name].result = responses[0].body;
  state.steps[name].latency_ms = responses.map(x=>x.latency_ms); save();
  console.log(JSON.stringify({check:name,passed:true,latency_ms:state.steps[name].latency_ms}));
  return responses[0].body;
}
const repeated = expected => (responses,value) => {
  for (const response of responses) {
    assert.equal(success(response,value),expected,'Wallet balance differs from the expected ledger');
    assert.deepEqual(response.body,responses[0].body,'Financial retries must return the original immutable response');
  }
};
try {
  state = existsSync(path) ? JSON.parse(readFileSync(path,'utf8')) :
    {format:1,identity,run_id:randomUUID(),rounds:{a:randomUUID(),b:randomUUID(),c:randomUUID(),d:randomUUID(),e:randomUUID()},steps:{}};
  assert.equal(state.format,1); assert.equal(state.identity,identity,'Journal belongs to a different wallet or player'); save();
  if (state.passed) {console.log(JSON.stringify({passed:true,run_id:state.run_id,message:'Previously completed; use a new journal for a new run'}));}
  else {
    const first = await step('initial balance',payload('balance','initial','0.00'),(responses,value)=>success(responses[0],value));
    const initial = minor(first.balance); assert.ok(initial>=100n,'Fund this dedicated sandbox player with at least 1.00');
    for (const [name,options] of [['bad signature',{invalidSignature:true}],['expired timestamp',{stale:true}],['request ID mismatch',{wrongRequestId:true}]]) {
      await step(name,payload('balance',name.replaceAll(' ','-'),'0.00'),responses=>{
        assert.ok([400,401,403].includes(responses[0].status),'Unauthenticated/mismatched callback was accepted');
      },options);
    }
    const debitA = payload('debit','debit-a','0.01','a');
    await step('concurrent debit',debitA,repeated(initial-1n),{concurrent:5});
    await step('conflicting duplicate',{...debitA,amount:'0.02'},responses=>assert.equal(responses[0].status,409));
    await step('concurrent credit',payload('credit','credit-a','0.02','a'),repeated(initial+1n),{concurrent:5});
    // Retrying a debit after its credit must return the original post-debit balance.
    await step('immutable old debit',debitA,repeated(initial-1n));
    await step('zero-win debit',payload('debit','debit-b','0.01','b'),repeated(initial));
    await step('zero credit',payload('credit','credit-b','0.00','b'),repeated(initial),{concurrent:3});
    await step('refund debit',payload('debit','debit-c','0.01','c'),repeated(initial-1n));
    await step('concurrent rollback',payload('rollback','rollback-c','0.01','c','debit-c'),repeated(initial),{concurrent:5});
    await step('distinct rollback ID',payload('rollback','rollback-c-again','0.01','c','debit-c'),repeated(initial));
    await step('rollback before debit',payload('rollback','rollback-d','0.01','d','debit-d'),repeated(initial),{concurrent:3});
    const reject = code => (responses,value) => {
      for (const response of responses) {
        assert.equal(response.status,200); assert.equal(response.body.success,false);
        assert.equal(response.body.error,code); assert.equal(response.body.transaction_id,value.transaction_id);
      }
    };
    await step('late cancelled debit',payload('debit','debit-d','0.01','d'),reject('transaction_cancelled'),{concurrent:3});
    await step('insufficient funds',payload('debit','debit-e',money(initial+1n),'e'),reject('insufficient_funds'),{concurrent:3});
    await step('final balance',payload('balance','final','0.00'),repeated(initial));
    state.passed = true; state.completed_at = new Date().toISOString(); save();
    console.log(JSON.stringify({passed:true,run_id:state.run_id,checks:Object.keys(state.steps).length,
      final_balance:first.balance,net_change:'0.00',scope:'wallet contract; game and restart acceptance are separate'}));
  }
} catch (error) {
  console.error(JSON.stringify({passed:false,error:error.message,
    next:'Correct the wallet and rerun with the SAME config and journal. Preserve transaction IDs. Do not reset balances to hide differences.'}));
  process.exitCode = 1;
} finally { unlinkSync(lockPath); }
