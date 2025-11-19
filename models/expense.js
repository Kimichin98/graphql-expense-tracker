const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01 // Ensure positive amount --- Need to review this as it's an EXPENSE tracker
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  }
}, { timestamps: true });

// Optional: Add index for better query performance
expenseSchema.index({ creator: 1, date: -1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);