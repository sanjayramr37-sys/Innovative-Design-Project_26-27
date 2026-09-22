const { timeToMinutes } = require('./src/services/syncMatrixService');

console.log('--- Running MediGuardian Verification (Dolo 6h Schedule) ---');

// Test 1: timeToMinutes conversion
const testCases = [
  { input: '06:30', expected: 390 },
  { input: '08:30', expected: 510 },
  { input: '09:00', expected: 540 },
  { input: '09:30', expected: 570 },
  { input: '14:00', expected: 840 },
  { input: '15:00', expected: 900 },
  { input: '20:30', expected: 1230 },
  { input: '21:00', expected: 1260 },
];

let allPassed = true;
for (const tc of testCases) {
  const result = timeToMinutes(tc.input);
  if (result === tc.expected) {
    console.log(`✅ timeToMinutes("${tc.input}") = ${result} (PASSED)`);
  } else {
    console.error(`❌ timeToMinutes("${tc.input}") = ${result}, expected ${tc.expected}`);
    allPassed = false;
  }
}

// Test 2: Sanjay's Medicines with Dolo 6h Schedule
const sanjayMedicines = [
  {
    siloId: 1,
    medicineName: 'Thyronorm 50mcg (Levothyroxine)',
    schedule: [{ time: '06:30', dose: 1, instruction: 'Before Food' }],
  },
  {
    siloId: 2,
    medicineName: 'Glycomet-GP 1 (Metformin + Glimepiride)',
    schedule: [
      { time: '08:30', dose: 1, instruction: 'Before Food' },
      { time: '20:30', dose: 1, instruction: 'Before Food' },
    ],
  },
  {
    siloId: 1,
    medicineName: 'Dolo-650 (Paracetamol)',
    schedule: [
      { time: '09:00', dose: 1, instruction: 'After Food' },
      { time: '15:00', dose: 1, instruction: 'After Food' },
      { time: '21:00', dose: 1, instruction: 'After Food' },
    ],
  },
  {
    siloId: 3,
    medicineName: 'Telma-AM (Telmisartan + Amlodipine)',
    schedule: [{ time: '09:30', dose: 1, instruction: 'After Food' }],
  },
  {
    siloId: 4,
    medicineName: 'Shelcal 500 (Calcium + Vitamin D3)',
    schedule: [{ time: '14:00', dose: 1, instruction: 'After Food' }],
  },
];

// Flattening logic
const flattenedMatrix = [];
for (const med of sanjayMedicines) {
  const silo = Number(med.siloId);
  for (const slot of med.schedule) {
    flattenedMatrix.push([silo, timeToMinutes(slot.time), Number(slot.dose)]);
  }
}
flattenedMatrix.sort((a, b) => a[1] - b[1]);

const expectedMatrix = [
  [1, 390, 1],   // Thyronorm @ 06:30 (Silo 1)
  [2, 510, 1],   // Glycomet-GP @ 08:30 (Silo 2)
  [1, 540, 1],   // Dolo-650 @ 09:00 (Silo 1)
  [3, 570, 1],   // Telma-AM @ 09:30 (Silo 3)
  [4, 840, 1],   // Shelcal 500 @ 14:00 (Silo 4)
  [1, 900, 1],   // Dolo-650 @ 15:00 (Silo 1)
  [2, 1230, 1],  // Glycomet-GP @ 20:30 (Silo 2)
  [1, 1260, 1],  // Dolo-650 @ 21:00 (Silo 1)
];

console.log('Flattened Matrix:', JSON.stringify(flattenedMatrix));
console.log('Expected Matrix: ', JSON.stringify(expectedMatrix));

if (JSON.stringify(flattenedMatrix) === JSON.stringify(expectedMatrix)) {
  console.log('✅ ESP32 BLE Sync Matrix with Dolo-650 6h intervals PASSED');
} else {
  console.error('❌ Sync Matrix mismatch!');
  allPassed = false;
}

if (allPassed) {
  console.log('🎉 All checks passed for Dolo-650 6h schedule!');
  process.exit(0);
} else {
  process.exit(1);
}
