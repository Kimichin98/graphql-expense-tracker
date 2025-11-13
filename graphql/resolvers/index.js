const bcrypt = require('bcryptjs');
const Expense = require('../../models/expense');
const User = require('../../models/user');
const Category = require('../../models/category')

//get all expenses by ID (for user resolver)
const expenses = async expenseIds => {
  try {
    const expenses = await Expense.find({ _id: { $in: expenseIds } })
    expenses.map(expense => {
      return {
        ...expense._doc,
        _id: expense.id,
        date: new Date(expense._doc.date).toISOString(),
        creator: user.bind(this, expense.creator),
        category: {
          ...expense.category._doc,
          _id: expense.category.id,
        },
      };
    });
  } catch (err) {
    throw err;
  }
};


//get user info (used for when resolving expense.creator)
const user = async userId => {
  try {
    const foundUser = await User.findById(userId)
    return {
      ...foundUser._doc,
      _id: foundUser.id,
      createdExpenses: expenses.bind(this, foundUser._doc.createdExpenses)
    };
  } catch (err) {
    throw err;
  }
};

//        EXPORTED RESOLVERS

module.exports = {
  //expenses
  expenses: async () => {
    try {
      const expenses = await Expense.find().populate('category').populate('creator');
      return expenses.map((expense) => ({
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

  createExpense: async (args) => {
    try {
      //Temp hcoded user - will replace later wth req.userId
      const userId = '6912af53de0770905213019a';

      //Check if category exists
      const category = await Category.findById(args.expenseInput.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      const expense = new Expense({
        title: args.expenseInput.title,
        category: category._id,
        description: args.expenseInput.description,
        amount: +args.expenseInput.amount,
        date: new Date(args.expenseInput.date),
        creator: userId,
      });

      const result = await result.save();

      //Add expense to user's list
      const creator = await User.findById(userId);
      if (!creator) throw new Error('User not found');
      creator.createdExpenses.push(expense);
      await creator.save();

      return {
        ...result._doc,
        _id: result.id,
        date: new Date(result._doc.date).toISOString,
        creator: user.bind(this, result._doc.creator),
        category: {
          ...category._doc,
          _id: category.id,
        },
      };
    } catch {
      console.error(err);
      throw (err);
    }
  },


  //users

  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('Existing user found'); //grammar?
      }

      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });

      const result = await user.save();
      return { ...result._doc, password: null, _id: result.id };

    } catch (err) {
      throw err;
    }
  },

  // categories

  categories: async () => {
    try {
      const categoriesList = await Category.find().populate('user')
      return categoriesList.map((cat) => ({
        ...cat._doc,
        _id: cat.id,
        user: user.bind(this, cat.user),
      }));
    } catch (err) {
      throw err;
    }
  },


  createCategory: async (args) => {
    try {
      // Temp hardcoded user - will replace with req.userId
      const userId = '6912af53de0770905213019a';

      const existing = await Category.findOne({
        name: args.categoryInput.name,
        user: userId,
      });

      if (existing) {
        throw new Error('Category already exists for this user');
      }

      const category = new Category({
        name: args.categoryInput.name,
        user: userId,
      });

      const result = await category.save();

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

