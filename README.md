GraphQL Expense Tracker API

A full-stack expense tracking application built with Node.js, Express, GraphQL, MongoDB, and JWT authentication. This API allows users to track their expenses, categorize spending, and manage their financial data through a GraphQL interface.

#Features
User Authentication - JWT-based registration, login, and secure endpoints

Expense Management - Create, read, and manage expenses with categories

Category System - Organize expenses into custom categories

GraphQL API - Flexible querying with GraphQL schema

Email Services - Verification and password reset functionality

MongoDB Integration - NoSQL database with Mongoose ODM

Security Features - Password hashing, rate limiting, and input validation

#Tech Stack
Backend: Node.js, Express.js

API: GraphQL with Express-GraphQL

Database: MongoDB with Mongoose

Authentication: JWT (JSON Web Tokens)

Security: bcryptjs for password hashing

Email: Nodemailer for transactional emails

Environment: dotenv for configuration

📁 Project Structure
graphql-expense-tracker/
├── graphql/
│   ├── resolvers/
│   │   ├── index.js          # All GraphQL resolvers
│   │   └── emailService.js   # Email sending utilities
│   └── schema/
│       └── index.js          # GraphQL type definitions
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── user.js               # User model with auth fields
│   ├── expense.js            # Expense model
│   └── category.js           # Category model
├── utils/
│   └── authUtils.js          # Authentication helper functions
├── app.js                    # Express server setup
├── package.json
└── .env                      # Environment variables

#Getting Started

Prerequisites

Node.js (v14 or higher)
MongoDB (local or Atlas)
npm or yarn

Installation

Clone the repository

bash
git clone https://github.com/Kimichin98/graphql-expense-tracker.git
cd graphql-expense-tracker
Install dependencies

bash
npm install

#Environment Configuration
Create a .env file in the root directory:

env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Optional for development)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://localhost:3000

# Server Port
PORT=3000
NODE_ENV=development
Start the development server

bash
npm start
Access GraphQL Playground
Open your browser and navigate to:

http://localhost:3000/graphql

#API Usage
Authentication Required
Most operations require JWT authentication. Include the token in your GraphQL requests:

Authorization: Bearer YOUR_JWT_TOKEN_HERE

#Core Operations

User Registration
graphql
mutation {
  createUser(userInput: {
    name: "John Doe"
    email: "john@example.com"
    password: "securepassword"
  }) {
    token
    user {
      _id
      name
      email
    }
  }
}


User Login
graphql
mutation {
  login(email: "john@example.com", password: "securepassword") {
    token
    user {
      _id
      name
      email
    }
  }
}


Create Category
graphql
mutation {
  createCategory(categoryInput: {
    name: "Groceries"
    description: "Food and household items"
  }) {
    _id
    name
    description
  }
}


Create Expense
graphql
mutation {
  createExpense(expenseInput: {
    title: "Weekly Shopping"
    categoryId: "CATEGORY_ID_HERE"
    description: "Milk, eggs, bread"
    amount: 45.50
    date: "2024-01-15"
  }) {
    _id
    title
    amount
    category {
      name
    }
  }
}


Query Expenses
graphql
query {
  expenses {
    _id
    title
    amount
    date
    category {
      name
    }
    creator {
      name
    }
  }
}


Query User Profile
graphql
query {
  me {
    _id
    name
    email
    isEmailVerified
    createdAt
  }
}


#Authentication Features
The API includes comprehensive authentication:

JWT-based authentication with 24-hour tokens

Email verification for new accounts

Password reset functionality with secure tokens

Account locking after multiple failed login attempts

Secure password hashing with bcrypt

Email Services
In development mode, email tokens are logged to the console. For production:

Configure email credentials in .env

Set up a proper email service (Gmail, SendGrid, etc.)

Update email templates in resolvers/emailService.js

#Security Implementations
Password hashing with salt rounds

JWT token expiration

Input validation and sanitization

MongoDB injection prevention

Rate limiting for authentication endpoints

Secure HTTP headers (to be implemented)

#TODO: Code Modifications Needed
To Enable Authentication:
Uncomment auth middleware in app.js:

javascript
app.use(authMiddleware);
Uncomment auth checks in resolvers (resolvers/index.js):

javascript
// Uncomment lines like:
if (!req.isAuth) {
  throw new Error('Unauthenticated!');
}

Set up email service for production:

Update email credentials in .env

Configure email transporter in emailService.js

Test email delivery

Current Development State:
✅ All core features implemented

✅ Database models optimized

✅ GraphQL schema complete

✅ Authentication system ready

🔄 Email service in development mode

🔄 Deployment preparation needed

#Future Improvements

---High Priority---

Deployment - Docker containerization and cloud deployment

API Documentation - Swagger/OpenAPI documentation

Testing Suite - Unit and integration tests

Rate Limiting - Implement request rate limiting

---Medium Priority---

Data Export - CSV/PDF expense reports

Frontend Application - React/Vue.js client interface

Advanced Filtering - Date range, amount filters

Budget Features - Category budgets and alerts

Recurring Expenses - Automated recurring expense creation

Data Analytics - Spending insights and charts

---Low Priority---

Multi-currency Support - International expense tracking

Receipt Upload - Image attachment support

Collaborative Features - Shared expense tracking

Mobile App - React Native/iOS/Android application

Webhooks - Integration with other services

#Known Issues

Authentication temporarily disabled for testing purposes

Email service runs in development mode (logs to console)

No input rate limiting implemented yet

Error handling could be more comprehensive

---🚧 This project is not yet deployed 🚧---

#Contributing

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

#Author
Kimichin98

GitHub: @Kimichin98

#Acknowledgments
GraphQL community for excellent documentation

MongoDB for robust database solutions

JWT for secure authentication standards

Express.js team for the fantastic web framework

Note: This project is in active development. Features and documentation may change as the project evolves.