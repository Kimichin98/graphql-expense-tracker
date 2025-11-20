const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Expense = require('../../models/expense');
const User = require('../../models/user');
const Category = require('../../models/category');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./emailService');

const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Generate random token
const generateAuthToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Set token expiration (1 hour)
const setTokenExpiration = () => {
  return Date.now() + 3600000;
};

// Update last login timestamp
const updateLastLogin = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { 
      lastLogin: new Date(),
      loginAttempts: 0 // Reset login attempts on successful login
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Get user info (when resolving for expense.creator)
const user = async (userId) => {
  try {
    const foundUser = await User.findById(userId);
    return {
      ...foundUser._doc,
      _id: foundUser.id,
    };
  } catch (err) {
    throw err;
  }
};

//        EXPORTED RESOLVERS

module.exports = {
  // ============ QUERIES ============
  
  expenses: async (args, req) => {
    try {
      // TEMPORARY: Get all expenses since auth is disabled
      const expensesList = await Expense.find({})
        .populate('category')
        .populate('creator');
      
      return expensesList.map((expense) => ({
        ...expense._doc,
        _id: expense.id,
        date: new Date(expense._doc.date).toISOString(),
        creator: {
          ...expense.creator._doc,
          _id: expense.creator.id,
        },
        category: {
          ...expense.category._doc,
          _id: expense.category.id,
        },
      }));
    } catch (err) {
      throw err;
    }
  },

  categories: async (args, req) => {
    try {
      // TEMPORARY: Get all categories since auth is disabled
      const categoriesList = await Category.find({});
      
      return categoriesList.map((cat) => ({
        ...cat._doc,
        _id: cat.id,
        user: user.bind(this, cat.user),
      }));
    } catch (err) {
      throw err;
    }
  },

  me: async (args, req) => {
    try {
      // TEMPORARY: Get first user since auth is disabled
      const foundUser = await User.findOne({});
      if (!foundUser) {
        throw new Error('No users found');
      }

      return {
        ...foundUser._doc,
        _id: foundUser.id,
        password: null, // Never return password
      };
    } catch (err) {
      throw err;
    }
  },

  // ============ MUTATIONS ============

  createExpense: async (args, req) => {
    try {
      // Check if category exists (remove user check)
      const category = await Category.findOne({
        _id: args.expenseInput.categoryId,
      });
      
      if (!category) {
        throw new Error('Category not found');
      }

      // TEMPORARY: Use first user as creator since auth is disabled
      const defaultUser = await User.findOne({});
      if (!defaultUser) {
        throw new Error('No users found. Please create a user first.');
      }

      const expense = new Expense({
        title: args.expenseInput.title,
        category: category._id,
        description: args.expenseInput.description,
        amount: +args.expenseInput.amount,
        date: new Date(args.expenseInput.date),
        creator: defaultUser._id, // Use first user as default
      });

      const result = await expense.save();

      return {
        ...result._doc,
        _id: result.id,
        date: new Date(result._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
        category: {
          ...category._doc,
          _id: category.id,
        },
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      
      const user = new User({
        name: args.userInput.name,
        email: args.userInput.email,
        password: hashedPassword,
        
        emailVerificationToken: generateAuthToken(),
        emailVerificationExpires: setTokenExpiration(),
      });

      const result = await user.save();

      // Generate JWT token
      const token = generateToken(result.id);

      await sendVerificationEmail(result);

      return {
        token: token,
        user: {
          ...result._doc,
          password: null, // Never return password
          _id: result.id,
        },
      };
    } catch (err) {
      throw err;
    }
  },

  login: async (args) => {
    try {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed attempts');
      }

      const isEqual = await bcrypt.compare(args.password, user.password);
      if (!isEqual) {
        // Increment failed login attempts
        await User.findByIdAndUpdate(user._id, {
          $inc: { loginAttempts: 1 }
        });
        throw new Error('Invalid credentials');
      }

      // updates on successful auth
      await updateLastLogin(user.id);

      const token = generateToken(user.id);

      return {
        token: token,
        user: {
          ...user._doc,
          password: null,
          _id: user.id,
        },
      };
    } catch (err) {
      throw err;
    }
  },

  createCategory: async (args, req) => {
    try {
      // TEMPORARY: Use first user as owner since auth is disabled
      const defaultUser = await User.findOne({});
      if (!defaultUser) {
        throw new Error('No users found. Please create a user first.');
      }

      const existing = await Category.findOne({
        name: args.categoryInput.name,
      });

      if (existing) {
        throw new Error('Category already exists');
      }

      const category = new Category({
        name: args.categoryInput.name,
        description: args.categoryInput.description,
        user: defaultUser._id, // Use first user as default
      });

      const result = await category.save();

      return {
        ...result._doc,
        _id: result.id,
        user: user.bind(this, defaultUser._id),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // ========= Auth features =========

  requestPasswordReset: async (args) => {
    try {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If the email exists, a password reset link has been sent' };
      }

      const resetToken = generateAuthToken();
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = setTokenExpiration();
      await user.save();

      await sendPasswordResetEmail(user);

      return { message: 'If the email exists, a password reset link has been sent' };
    } catch (err) {
      throw err;
    }
  },

  resetPassword: async (args) => {
    try {
      const user = await User.findOne({
        passwordResetToken: args.token,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(args.newPassword, 12);
      
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0; // Reset login attempts
      user.lockUntil = undefined;
      await user.save();

      return { message: 'Password reset successful' };
    } catch (err) {
      throw err;
    }
  },

  verifyEmail: async (args) => {
    try {
      const user = await User.findOne({
        emailVerificationToken: args.token,
        emailVerificationExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return { message: 'Email verified successfully' };
    } catch (err) {
      throw err;
    }
  },

  resendVerificationEmail: async (args, req) => {
    try {
      // TEMPORARY: Use first user since auth is disabled
      const user = await User.findOne({});
      if (!user) {
        throw new Error('No users found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      user.emailVerificationToken = generateAuthToken();
      user.emailVerificationExpires = setTokenExpiration();
      await user.save();

      await sendVerificationEmail(user);
      
      return { message: 'Verification email sent' };
    } catch (err) {
      throw err;
    }
  },
};