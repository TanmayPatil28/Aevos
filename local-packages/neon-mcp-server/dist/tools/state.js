const migrationsState = new Map();
const tuningState = new Map();
export function getMigrationFromMemory(migrationId) {
    return migrationsState.get(migrationId);
}
export function persistMigrationToMemory(migrationId, migrationDetails) {
    migrationsState.set(migrationId, migrationDetails);
}
export function getTuningFromMemory(tuningId) {
    return tuningState.get(tuningId);
}
export function persistTuningToMemory(tuningId, tuningDetails) {
    tuningState.set(tuningId, tuningDetails);
}
export function updateTuningInMemory(tuningId, updates) {
    const existing = tuningState.get(tuningId);
    if (existing) {
        tuningState.set(tuningId, { ...existing, ...updates });
    }
}
