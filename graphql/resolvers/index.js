const usersResolvers = require('./users');
const clubsResolvers = require('./clubs');

module.exports = {
  Query: {
    ...usersResolvers.Query,
    ...clubsResolvers.Query
  },
  Mutation: {
    ...usersResolvers.Mutation,  // works when clubsResolvers stuff is blocked out
    ...clubsResolvers.Mutation
  }
};
