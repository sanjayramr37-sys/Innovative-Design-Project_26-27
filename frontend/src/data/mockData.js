/**
 * Mock data for MediGuardian standalone demonstration & offline fallback.
 * Patient: Sanjay (+91 XXXXXXXXXX)
 * Active Medications: Dolo-650 (every 6h: 9am, 3pm, 9pm), Glycomet-GP, Telma-AM, Thyronorm, Shelcal 500
 */

export const DEFAULT_USER = {
  _id: '65f1234567890123456789ab',
  name: 'Sanjay',
  caregiverContact: '+91 XXXXXXXXXX',
  age: 48,
  bloodGroup: 'B+',
};

export const INITIAL_MOCK_MEDICATIONS = [
  {
    _id: 'med-001',
    userId: '65f1234567890123456789ab',
    medicineName: 'Thyronorm 50mcg (Levothyroxine)',
    siloId: 1,
    schedule: [
      {
        _id: 'slot-101',
        time: '06:30',
        dose: 1,
        instruction: 'Before Food',
        taken: true,
        takenAt: '2026-09-21T06:35:00.000Z',
      },
    ],
    notes: 'Thyroid hormone replacement. Take first thing in morning on empty stomach with plain water.',
  },
  {
    _id: 'med-002',
    userId: '65f1234567890123456789ab',
    medicineName: 'Glycomet-GP 1 (Metformin + Glimepiride)',
    siloId: 2,
    schedule: [
      {
        _id: 'slot-201',
        time: '08:30',
        dose: 1,
        instruction: 'Before Food',
        taken: true,
        takenAt: '2026-09-21T08:32:00.000Z',
      },
      {
        _id: 'slot-202',
        time: '20:30',
        dose: 1,
        instruction: 'Before Food',
        taken: false,
        takenAt: null,
      },
    ],
    notes: 'Type 2 diabetes blood glucose management. Take before breakfast and dinner.',
  },
  {
    _id: 'med-003',
    userId: '65f1234567890123456789ab',
    medicineName: 'Dolo-650 (Paracetamol)',
    siloId: 1,
    schedule: [
      {
        _id: 'slot-301',
        time: '09:00',
        dose: 1,
        instruction: 'After Food',
        taken: true,
        takenAt: '2026-09-21T09:05:00.000Z',
      },
      {
        _id: 'slot-302',
        time: '15:00',
        dose: 1,
        instruction: 'After Food',
        taken: false,
        takenAt: null,
      },
      {
        _id: 'slot-303',
        time: '21:00',
        dose: 1,
        instruction: 'After Food',
        taken: false,
        takenAt: null,
      },
    ],
    notes: 'Pain & fever relief taken every 6 hours starting at 9:00 AM till 9:00 PM (09:00, 15:00, 21:00).',
  },
  {
    _id: 'med-004',
    userId: '65f1234567890123456789ab',
    medicineName: 'Telma-AM (Telmisartan + Amlodipine)',
    siloId: 3,
    schedule: [
      {
        _id: 'slot-401',
        time: '09:30',
        dose: 1,
        instruction: 'After Food',
        taken: false,
        takenAt: null,
      },
    ],
    notes: 'Daily hypertension control to maintain blood pressure and reduce cardiovascular strain.',
  },
  {
    _id: 'med-005',
    userId: '65f1234567890123456789ab',
    medicineName: 'Shelcal 500 (Calcium + Vitamin D3)',
    siloId: 4,
    schedule: [
      {
        _id: 'slot-501',
        time: '14:00',
        dose: 1,
        instruction: 'After Food',
        taken: false,
        takenAt: null,
      },
    ],
    notes: 'Calcium and Vitamin D3 supplement for bone mineral density. Take after lunch.',
  },
];

const LOCAL_STORAGE_KEY = 'mediguardian_medications_v4_cache';

export const getStoredMedications = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].schedule)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read from localStorage:', err);
  }
  return INITIAL_MOCK_MEDICATIONS;
};

export const saveStoredMedications = (meds) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meds));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
};
