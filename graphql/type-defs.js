const {gql} = require("apollo-server");

const typeDefs = gql`
    type User {
        id: ID!
        username: String!
        email: String!
        password: String!
        createdAt: String!
        token: String!
        assignments: [Assignment]
    }

    type Assignment {
        id: ID!
        title: String!
        dueDate: String!
    }


    input RegisterInput {
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }

    type Query{
        getUsers: [User!]!
        getAssignmentsByDue(target_username: String!, target_dueDate: String!): [Assignment]!
    }

    type Mutation{
        registerUser(registerInput: RegisterInput): User!
        loginUser(username: String!, password: String!): User!
        addAssignment(title: String!, dueDate: String!): User!   #dueDate formatted as xx/xx/xxxx
    }
`;

module.exports = {typeDefs};