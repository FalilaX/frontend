import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { simulationEvidence } from '../src/app/utils/notification-evidence.ts';

test('legacy SIM ID identifies synthetic notification and preserves test location', () => {
  const result = simulationEvidence({ incident_id: 'SIM-legacy', context: { likely_source: 'Test site', confidence: 1 } });
  assert.deepEqual(result, { simulated: true, location: 'Test site' });
});
test('all supported provenance markers identify simulation', () => {
  for (const context of [{simulation: true}, {simulation: 'true'}, {simulation: {}},
    {data_mode: 'synthetic'}, {source_type: 'simulation'}]) {
    assert.equal(simulationEvidence({context}).simulated, true);
  }
  assert.equal(simulationEvidence({event_type: 'controlled_safety_simulation'}).simulated, true);
});
test('explicit location takes precedence over legacy source', () => {
  assert.equal(simulationEvidence({context: {simulation: true, simulation_location: 'New site', likely_source: 'Not established'}}).location, 'New site');
});
test('ordinary notification stays operational', () => {
  assert.equal(simulationEvidence({incident_id: 'incident-1', context: {simulation: false, source_type: 'sensor'}}).simulated, false);
});
test('missing location and null context remain safe', () => {
  assert.deepEqual(simulationEvidence({incident_id: 'SIM-old', context: null}), {simulated: true, location: 'Not specified'});
  assert.equal(simulationEvidence({context: {simulation: true, likely_source: 'Not established'}}).location, 'Not specified');
});
