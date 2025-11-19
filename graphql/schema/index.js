const { buildSchema } = require('graphql');

module.exports = buildSchema(`

      type Expense{
        _id: ID!
        title: String!
        category: Category!
        description: String!
        amount: Float!
        date: String!
        creator: User!      
      }

      type User{
        _id: ID!
        username: String
        email: String!
        password: String
        createdAt: String!
        createdExpenses: [Expense!]
        categories: [Category!]
      }

      type AuthPayload{
        token: String!
        user: User!
      }

      type Category{
        _id: ID!
        name: String!
        description: String
        user: User!
        expenses: [Expense!]
      }

      input ExpenseInput{
        title: String!
        categoryId: ID!
        description: String!
        amount: Float!
        date: String!
      }

      input UserInput{
        username: String
        email: String!
        password: String!
      }

      input CategoryInput{
        name: String!
        description: String
      }

      type RootQuery{
        expenses: [Expense!]!
        categories: [Category!]!
        me: User
      }

      type RootMutation{
        createExpense(expenseInput: ExpenseInput): Expense
        createUser(userInput: UserInput): AuthPayload
        login(email: String!, password: String!): AuthPayload
        createCategory(categoryInput: CategoryInput): Category
      }

      schema{
        query: RootQuery
        mutation: RootMutation
      }
    `)