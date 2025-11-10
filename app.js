const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');

const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Expense = require('./models/expense');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`

      type Expense{
        _id: ID!
        title: String!
        description: String!
        amount: Float!
        date: String!      
      }

      input ExpenseInput{
        title: String!
        description: String!
        amount: Float!
        date: String!
      }

      type RootQuery{
        expenses: [Expense!]!
      }

      type RootMutation{
        createExpense(expenseInput: ExpenseInput): Expense
      }

      schema{
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      expenses: () => {
        return Expense.find()
        .then(expenses=>{
          return expenses.map(expense => {
            return {...expense._doc };
          });
        })
        .catch(err => {
          throw err;
        });
      },
      createExpense: args => {
        const expense = new Expense({
          title: args.expenseInput.title,
          description: args.expenseInput.description,
          amount: +args.expenseInput.amount,
          date: new Date(args.expenseInput.date)
        });
        return expense
        .save()
        .then(result=>{
          console.log(result);
          return {...result._doc };
        }).catch(err=>{
          console.log(err);
          throw err;
        });
        return expense;
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



