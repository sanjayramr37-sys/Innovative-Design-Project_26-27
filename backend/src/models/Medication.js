const mongoose = require('mongoose');

/**
 * Schedule Sub-schema representing an individual daily dose time slot
 */
const ScheduleSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: [true, 'Scheduled time is required in HH:mm 24-hour format'],
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: (props) => `${props.value} is not a valid 24-hour time format (HH:mm, e.g. 08:30 or 14:00)`,
      },
    },
    dose: {
      type: Number,
      required: [true, 'Dose quantity is required'],
      min: [1, 'Dose must be at least 1 unit/pill'],
      max: [20, 'Dose cannot exceed 20 units per dispense'],
    },
    instruction: {
      type: String,
      required: [true, 'Dose instruction is required (e.g., Before Food, After Food)'],
      trim: true,
      default: 'After Food',
    },
    taken: {
      type: Boolean,
      default: false,
    },
    takenAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true, timestamps: false }
);

const MedicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      minlength: [1, 'Medicine name cannot be empty'],
      maxlength: [120, 'Medicine name cannot exceed 120 characters'],
    },
    siloId: {
      type: Number,
      required: [true, 'Silo assignment is required'],
      enum: {
        values: [1, 2, 3, 4],
        message: 'Silo assignment must be either 1, 2, 3, or 4',
      },
    },
    // Multi-dose schedule array
    schedule: {
      type: [ScheduleSlotSchema],
      required: [true, 'At least one scheduled dose slot is required'],
      validate: {
        validator: function (slots) {
          return Array.isArray(slots) && slots.length > 0;
        },
        message: 'Medication must have at least one scheduled dose time slot',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, 'Notes cannot exceed 250 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on userId and active state
MedicationSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Medication', MedicationSchema);
