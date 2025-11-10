const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');

const { buildSchema } = require('graphql');

const app = express();

const expenses = [];

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
        return expenses;
      },
      createExpense: (args) => {
        const expense = {
          _id: Math.random().toString(),
          title: args.title,
          description: args.description,
          amount: +args.amount,
          date: new Date().toISOString
        }
        expenses.push(expense);
      }
    },
    graphiql: true
  }));

app.listen(3000);
