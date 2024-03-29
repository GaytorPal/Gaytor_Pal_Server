const {gql} = require("apollo-server");

const typeDefs = gql`
    type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    createdAt: String!
    token: String!
    }


    input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    }

    type Query{
        getUsers: [User!]!
    }

    type Mutation{
        registerUser(registerInput: RegisterInput): User!
        loginUser(username: String!, password: String!): User!
    }
`;

module.exports = {typeDefs};