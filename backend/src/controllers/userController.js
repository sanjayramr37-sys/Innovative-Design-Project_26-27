const User = require('../models/User');

/**
 * @route   GET /api/users
 * @desc    Fetch all users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:userId
 * @desc    Fetch user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with ID: ${userId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users
 * @desc    Create a new user/patient profile
 */
const createUser = async (req, res, next) => {
  try {
    const { name, caregiverContact } = req.body;

    const user = await User.create({
      name,
      caregiverContact,
    });

    return res.status(201).json({
      success: true,
      message: 'User profile created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
