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
        name: String!
        email: String!
        password: String
        isEmailVerified: Boolean!
        lastLogin: String
        createdAt: String!
        updatedAt: String!
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
      }

      type MessageResponse{
        message: String!
      }

      input ExpenseInput{
        title: String!
        categoryId: ID!
        description: String!
        amount: Float!
        date: String!
      }

      input UserInput{
        name: String!
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
        requestPasswordReset(email: String!): MessageResponse
        resetPassword(token: String!, newPassword: String!): MessageResponse
        verifyEmail(token: String!): MessageResponse
        resendVerificationEmail: MessageResponse
      }

      schema{
        query: RootQuery
        mutation: RootMutation
      }
    `)