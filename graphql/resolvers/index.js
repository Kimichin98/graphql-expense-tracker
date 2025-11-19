const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Expense = require('../../models/expense');
const User = require('../../models/user');
const Category = require('../../models/category');

// generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Get all expenses by ID (to be utilized in User resolver)
const expenses = async (expenseIds) => {
  try {
    const expensesList = await Expense.find({ _id: { $in: expenseIds } })
      .populate('category')
      .populate('creator');
    
    return expensesList.map((expense) => ({
      ...expense._doc,
      _id: expense.id,
      date: new Date(expense._doc.date).toISOString(),
      creator: user.bind(this, expense.creator._id),
      category: {
        ...expense.category._doc,
        _id: expense.category.id,
      },
    }));
  } catch (err) {
    throw err;
  }
};

// Get user info (when resolving for expense.creator)
const user = async (userId) => {
  try {
    const foundUser = await User.findById(userId);
    return {
      ...foundUser._doc,
      _id: foundUser.id,
      createdExpenses: expenses.bind(this, foundUser._doc.createdExpenses),
    };
  } catch (err) {
    throw err;
  }
};

// Get categories by IDs (for user resolver)
const categories = async (categoryIds) => {
  try {
    const categoriesList = await Category.find({ _id: { $in: categoryIds } });
    return categoriesList.map((cat) => ({
      ...cat._doc,
      _id: cat.id,
      user: user.bind(this, cat.user),
    }));
  } catch (err) {
    throw err;
  }
};

//        EXPORTED RESOLVERS

module.exports = {
  // ============ QUERIES ============
  
  expenses: async (args, req) => {
    // Check auth
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    try {
      // ONLY return expenses created by the authenticated user
      const expensesList = await Expense.find({ creator: req.userId })
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
    // Check auth agane
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    try {
      // ONLY return categories created by the authenticated user
      const categoriesList = await Category.find({ user: req.userId });
      
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
    // Check auth once aganee
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    try {
      const foundUser = await User.findById(req.userId);
      if (!foundUser) {
        throw new Error('User not found');
      }

      return {
        ...foundUser._doc,
        _id: foundUser.id,
        password: null, // Never return password
        createdExpenses: expenses.bind(this, foundUser._doc.createdExpenses),
        categories: categories.bind(this, foundUser._doc.categories),
      };
    } catch (err) {
      throw err;
    }
  },

  // ============ MUTATIONS ============

  createExpense: async (args, req) => {
    // Check auth
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    try {
      // Use authenticated user ID instead of previous hardcoded value
      const userId = req.userId;

      // Check if category exists and belongs to user
      const category = await Category.findOne({
        _id: args.expenseInput.categoryId,
        user: userId,
      });
      
      if (!category) {
        throw new Error('Category not found or does not belong to you');
      }

      const expense = new Expense({
        title: args.expenseInput.title,
        category: category._id,
        description: args.expenseInput.description,
        amount: +args.expenseInput.amount,
        date: new Date(args.expenseInput.date),
        creator: userId,
      });

      const result = await expense.save();

      // Add expense to user's list
      const creator = await User.findById(userId);
      if (!creator) throw new Error('User not found');
      creator.createdExpenses.push(expense);
      await creator.save();

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
        username: args.userInput.username || args.userInput.email.split('@')[0],
        email: args.userInput.email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      });

      const result = await user.save();

      // Generate token
      const token = generateToken(result.id);

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

      const isEqual = await bcrypt.compare(args.password, user.password);
      if (!isEqual) {
        throw new Error('Invalid credentials');
      }

      // Generate token
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
    // Check auth
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    try {
      // Use authenticated user ID
      const userId = req.userId;

      const existing = await Category.findOne({
        name: args.categoryInput.name,
        user: userId,
      });

      if (existing) {
        throw new Error('Category already exists for this user');
      }

      const category = new Category({
        name: args.categoryInput.name,
        description: args.categoryInput.description,
        user: userId,
      });

      const result = await category.save();

      // Add category to user's categories list
      const foundUser = await User.findById(userId);
      if (foundUser) {
        foundUser.categories.push(result._id);
        await foundUser.save();
      }

      return {
        ...result._doc,
        _id: result.id,
        user: user.bind(this, userId),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};