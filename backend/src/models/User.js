const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'User name must be at least 2 characters'],
      maxlength: [100, 'User name cannot exceed 100 characters'],
    },
    caregiverContact: {
      type: String,
      required: [true, 'Caregiver contact information is required'],
      trim: true,
      minlength: [5, 'Caregiver contact must be at least 5 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to easily query user's medications
UserSchema.virtual('medications', {
  ref: 'Medication',
  localField: '_id',
  foreignField: 'userId',
});

module.exports = mongoose.model('User', UserSchema);
