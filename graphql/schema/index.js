const {buildSchema} = require('graphql');

module.exports = buildSchema(`

      type Expense{
        _id: ID!
        title: String!
        category: String!
        description: String!
        amount: Float!
        date: String!
        creator: User!      
      }

      type User{
        _id: ID!
        email: String!
        password: String
        createdExpenses: [Expense!]
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
    `)