const {ApolloServer} = require("apollo-server");
const {typeDefs} = require("./graphql/type-defs");
const resolvers = require("./graphql/resolvers");

const mongoose = require('mongoose');
//const uri = "mongodb+srv://jdramirez237:sweenie8@sweenieproject.2cfnznc.mongodb.net/?retryWrites=true&w=majority"
const { MONGODB } = require('./config.js');

const {GraphQLError} = require("graphql")
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('./config');

startApolloServer = async () => {
const server = new ApolloServer({
    //connectToDevTools: true,
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req })
    // context: async ({ req }) => {
    //   // get the user token from the headers
    //   const token = req.headers.authorization || '';
  
    //   // try to retrieve a user with the token
    //   const user = jwt.verify(token, SECRET_KEY);
  
    //   // optionally block the user
    //   // we could also check user roles/permissions here
    //   if (!user)
    //     // throwing a `GraphQLError` here allows us to specify an HTTP status code,
    //     // standard `Error`s will have a 500 status code by default
    //     throw new GraphQLError('User is not authenticated', {
    //       extensions: {
    //         code: 'UNAUTHENTICATED',
    //         http: { status: 401 },
    //       },
    //     });
  
    //   // add the user to the context
    //   return { user };
    // },
  });
  await server.listen().then(({url}) => {
    console.log(`YOUR API IS RUNNING AT: ${url} :)`);
});

};

mongoose
  .connect(MONGODB, {})
  .then(() => {
    console.log("\nSUCCESS: CONNECTED TO DATABASE");
    startApolloServer();
  })
  .catch((err) => {
    console.error(err);
  });

