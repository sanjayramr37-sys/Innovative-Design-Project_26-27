require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Medication = require('./models/Medication');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Medication.deleteMany({});

    console.log('[Seed] Creating default user: Sanjay (+91 XXXXXXXXXX)...');
    const demoUser = await User.create({
      name: 'Sanjay',
      caregiverContact: '+91 XXXXXXXXXX',
    });

    console.log(`[Seed] Default patient created: ${demoUser.name} (ID: ${demoUser._id})`);

    console.log('[Seed] Creating scheduled medications (Dolo-650 every 6h: 9am, 3pm, 9pm)...');
    const medications = [
      {
        userId: demoUser._id,
        medicineName: 'Thyronorm 50mcg (Levothyroxine)',
        siloId: 1,
        schedule: [
          {
            time: '06:30',
            dose: 1,
            instruction: 'Before Food',
            taken: true,
            takenAt: new Date(new Date().setHours(6, 35, 0)),
          },
        ],
        notes: 'Thyroid hormone replacement. Take first thing in morning on empty stomach with plain water.',
      },
      {
        userId: demoUser._id,
        medicineName: 'Glycomet-GP 1 (Metformin + Glimepiride)',
        siloId: 2,
        schedule: [
          {
            time: '08:30',
            dose: 1,
            instruction: 'Before Food',
            taken: true,
            takenAt: new Date(new Date().setHours(8, 32, 0)),
          },
          {
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
        userId: demoUser._id,
        medicineName: 'Dolo-650 (Paracetamol)',
        siloId: 1,
        schedule: [
          {
            time: '09:00',
            dose: 1,
            instruction: 'After Food',
            taken: true,
            takenAt: new Date(new Date().setHours(9, 5, 0)),
          },
          {
            time: '15:00',
            dose: 1,
            instruction: 'After Food',
            taken: false,
            takenAt: null,
          },
          {
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
        userId: demoUser._id,
        medicineName: 'Telma-AM (Telmisartan + Amlodipine)',
        siloId: 3,
        schedule: [
          {
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
        userId: demoUser._id,
        medicineName: 'Shelcal 500 (Calcium + Vitamin D3)',
        siloId: 4,
        schedule: [
          {
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

    await Medication.insertMany(medications);

    console.log(`[Seed] Successfully populated ${medications.length} medications for Sanjay!`);
    console.log(`\nDemo User ID for testing:`);
    console.log(`👉 ${demoUser._id}\n`);
    console.log(`Endpoints:`);
    console.log(`👉 GET http://localhost:5000/api/sync-matrix`);
    console.log(`👉 GET http://localhost:5000/api/users/${demoUser._id}/medications/today\n`);

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
