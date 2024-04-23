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
        description: String!
        dueDate: String!
        category: String!
    }

    type Event {
        id: ID!
        title: String!
        description: String!
        date: String!
    }

        # (1) make the Club a separate entity or (2) make it a user with extra privileges?
        type Club{
            id: ID!
            username: String!
            email: String!
            password: String!
            token: String!
            events: [Event]
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
        
        getClubs: [Club!]!
        getEventsByDue(target_username: String!, target_dueDate: String!): [Event]!
    }

    type Mutation{
        registerUser(registerInput: RegisterInput): User!
        loginUser(username: String!, password: String!): User!
        addAssignment(username: String!, title: String!, description: String!, dueDate: String!, category: String!): User!   #dueDate formatted as xx/xx/xxxx
        
        registerClub(registerInput: RegisterInput): Club!
        loginClub(username: String!, password: String!): Club!
        addEvent(title: String!, description: String!, dueDate: String!, category: String!): Club!
    }
`;

module.exports = {typeDefs};