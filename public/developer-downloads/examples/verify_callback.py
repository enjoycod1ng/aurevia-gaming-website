"""Reference verifier for playngo-callback-v1; this does not modify a wallet.

Supply the exact raw request bytes before JSON middleware parses the request.
Load `secret` from your server's secret store. Never put it in frontend code.
After this check, validate the complete callback schema and apply ownership,
durable idempotency and atomic wallet rules in INTEGRATION-GUIDE.md.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import re
import time
from typing import Mapping


def verify_callback(
    raw_body: bytes,
    headers: Mapping[str, str],
    *,
    secret: str,
    expected_operator_id: str,
    endpoint: str,
    now: int | None = None,
) -> dict:
    """Raise ValueError for invalid authentication or routing metadata."""
    normalized = {key.lower(): value for key, value in headers.items()}
    timestamp = normalized.get('x-pp-timestamp', '')
    signature = normalized.get('x-pp-signature', '')
    request_id = normalized.get('x-pp-request-id', '')
    if not secret or not expected_operator_id:
        raise ValueError('Wallet verifier is not configured')
    if not re.fullmatch(r'[0-9]{1,12}', timestamp):
        raise ValueError('Invalid timestamp')
    current_time = int(time.time()) if now is None else now
    if abs(current_time - int(timestamp)) > 300:
        raise ValueError('Stale timestamp')
    if not re.fullmatch(r'[0-9a-f]{64}', signature):
        raise ValueError('Invalid signature format')
    expected = hmac.new(
        secret.encode('utf-8'),
        timestamp.encode('ascii') + b'.' + raw_body,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise ValueError('Invalid signature')
    payload = json.loads(raw_body.decode('utf-8'))
    if not isinstance(payload, dict):
        raise ValueError('Expected JSON object')
    if not request_id or payload.get('request_id') != request_id:
        raise ValueError('Request ID mismatch')
    if payload.get('operator_id') != expected_operator_id:
        raise ValueError('Operator mismatch')
    operation = endpoint.strip('/')
    if operation not in {'balance', 'debit', 'credit', 'rollback'}:
        raise ValueError('Invalid endpoint')
    if payload.get('transaction_type') != operation:
        raise ValueError('Transaction type does not match endpoint')
    return payload
