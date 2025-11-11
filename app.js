const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');

const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Expense = require('./models/expense');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`

      type Expense{
        _id: ID!
        title: String!
        category: String!
        description: String!
        amount: Float!
        date: String!      
      }

      type User{
        _id: ID!
        email: String!
        password: String
      }

      input ExpenseInput{
        title: String!
        category: String!
        description: String!
        amount: Float!
        date: String!
      }

      input UserInput{
        email: String!
        password: String
      }

      type RootQuery{
        expenses: [Expense!]!
      }

      type RootMutation{
        createExpense(expenseInput: ExpenseInput): Expense
        createUser(userInput: UserInput): User
      }

      schema{
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      expenses: () => {
        return Expense.find()
          .then(expenses => {
            return expenses.map(expense => {
              return { ...expense._doc };
            });
          })
          .catch(err => {
            throw err;
          });
      },
      createExpense: args => {
        const expense = new Expense({
          title: args.expenseInput.title,
          category: args.expenseInput.category,
          description: args.expenseInput.description,
          amount: +args.expenseInput.amount,
          date: new Date(args.expenseInput.date),
          creator: '6912af53de0770905213019a' //Hardddcoded
        });
        let createdExpense;
        return expense
          .save() 
          .then(result => {
            createdExpense = { ...result._doc, password: null, _id: result.id };
            return User.findById('6912af53de0770905213019a') 
          })
          .then(user =>{
            if (!user) {
              throw new Error('User not found.')
            }
            user.createdExpenses.push(expense);
            return user.save();
          })
          .then(result =>{
            return createdExpense;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error('User exists already.')
            }
            return bcrypt
              .hash(args.userInput.password, 12)
          }).then(hashedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });
            return user.save();
          })
          .then(result => {
            return { ...result._doc, password: null, _id: result.id }
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  }));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD
  }@cluster0.n79kmle.mongodb.net/?appName=Cluster0`
).then(() => {
  app.listen(3000);
}).catch(err => {
  console.log(err);
});



