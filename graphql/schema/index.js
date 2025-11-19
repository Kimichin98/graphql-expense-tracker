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
        email: String!
        password: String
        createdExpenses: [Expense!]
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
        email: String!
        password: String
      }

      input CategoryInput{
        name: String!
        description: String!
      }

      type RootQuery{
        expenses: [Expense!]!
        categories: [Category!]
      }

      type RootMutation{
        createExpense(expenseInput: ExpenseInput): Expense
        createUser(userInput: UserInput): User
        createCategory(categoryInput: CategoryInput): Category
      }

      schema{
        query: RootQuery
        mutation: RootMutation
      }
    `)