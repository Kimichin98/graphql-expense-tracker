const bcrypt = require('bcryptjs');

const Expense = require('../../models/expense');
const User = require('../../models/user');

const expenses = async expenseIds => {
  try {
    const expenses = await Expense.find({ _id: { $in: expenseIds } })
    expenses.map(expense => {
      return {
        ...expense._doc,
        _id: expense.id,
        date: new Date(expense._doc.date).toISOString(),
        creator: user.bind(this, expense.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

  const user = async userId => {
    try {
      const user = await User.findById(userId)
      return {
        ...user._doc,
        _id: user.id,
        createdExpenses: expenses.bind(this, user._doc.createdExpenses)
      };
    } catch (err) {
      throw err;
    }
  };

module.exports = {
  expenses: async () => {
    try {
      const expenses = await Expense.find()
      return expenses.map(expense => {
        return {
          ...expense._doc,
          _id: expense.id,
          date: new Date(expense._doc.date).toISOString(),
          creator: user.bind(this, expense._doc.creator)
        };
      })
    } catch (err) {
      throw err;
    }
  },
  createExpense: async args => {
    const expense = new Expense({
      title: args.expenseInput.title,
      category: args.expenseInput.category,
      description: args.expenseInput.description,
      amount: +args.expenseInput.amount,
      date: new Date(args.expenseInput.date),
      creator: '6912af53de0770905213019a' //Hardddcoded
    });
    let createdExpense;
    try {
      const result = await expense
        .save()
      createdExpense = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(expense._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await User.findById('69143b24c32deb36bede4a64')
      if (!creator) {
        throw new Error('User not found.')
      }
      creator.createdExpenses.push(expense);
      await creator.save();
      return createdExpense;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email })

      if (existingUser) {
        throw new Error('User exists already.')
      }
      const hashedPassword = await bcrypt
        .hash(args.userInput.password, 12)

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      })

      const result = await user.save();


      return { ...result._doc, password: null, _id: result.id }
    } catch (err) {
      throw err;
    }
  }
}