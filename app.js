const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
require('dotenv').config(); 

const authMiddleware = require('./middleware/auth');
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

//Auth middleware extracts JWT and adds req.isAuth & req.userId
//Disabled temporarily for testing ###app.use(authMiddleware);###

//GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP((req) => ({
    schema: graphQlSchema,           
    rootValue: graphQlResolvers,     
    graphiql: true,                  // GraphQL playground - dev env only
    context: req,                     
    customFormatErrorFn: (err) => {
      // Log errors for debugging
      console.error('GraphQL Error:', err.message);
      return {
        message: err.message,
        locations: err.locations,
        path: err.path,
      };
    },
  }))
);

//Connect to MongoDB and start server
mongoose
  .connect(
    process.env.MONGODB_URI
  )
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
      console.log(`GraphQL playground: http://localhost:${process.env.PORT || 3000}/graphql`);
    });
  })
  .catch((err) => {
    console.error('X MongoDB connection error:', err);
  });