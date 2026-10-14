<?php
declare(strict_types=1);
require __DIR__ . '/provider.php';
$fixture = json_decode(file_get_contents(__DIR__ . '/signature-fixture.json'), true, 512, JSON_THROW_ON_ERROR);
$run = fn(string $raw, int $now, string $operation = 'debit') => verifyCallback($fixture['example_secret'], $raw, $fixture['headers'], $operation, $fixture['expected_operator_id'], $now);
if ($run($fixture['raw_body'], $fixture['now'])['amount'] !== '2.00') throw new Exception('Fixture failed');
foreach ([[$fixture['raw_body'] . ' ', $fixture['now'], 'debit'], [$fixture['raw_body'], $fixture['now'] + 301, 'debit'], [$fixture['raw_body'], $fixture['now'], 'credit']] as $case) {
    $rejected = false;
    try { $run(...$case); } catch (RuntimeException $e) { $rejected = true; }
    if (!$rejected) throw new Exception('Invalid callback accepted');
}
echo "PHP: callback fixture, tampering, timestamp and operation checks passed.\n";
