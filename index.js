const {ApolloServer} = require("apollo-server");
const {typeDefs} = require("./graphql/type-defs");
const resolvers = require("./graphql/resolvers");

const mongoose = require('mongoose');
const { MONGODB } = require('./config.js');

startApolloServer = async () => {
const server = new ApolloServer({
    //connectToDevTools: true,
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req })
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

