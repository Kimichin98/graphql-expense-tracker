const mongoose = require('mongoose');
const { description } = require('../graphql/schema');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required:false
  },
  creator:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {timestamps: true});

categorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);