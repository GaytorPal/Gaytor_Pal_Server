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
        followingClubs: [Club]
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

    type Club{
        id: ID!
        username: String!
        email: String!
        password: String!
        token: String!
        events: [Event]
        followers: [User]
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
        getClubsFollowedByUser: [Club!]!
    }

    type Mutation{
        registerUser(registerInput: RegisterInput): User!
        loginUser(username: String!, password: String!): User!
        addAssignment(title: String!, description: String!, dueDate: String!, category: String!): User!   #dueDate formatted as xx/xx/xxxx
        registerClub(registerInput: RegisterInput): Club!
        loginClub(username: String!, password: String!): Club!
        addEvent(title: String!, description: String!, dueDate: String!, category: String!): Club!
        # follow/unfollow
        followClub(username: String!): User!
        unfollowClub(username: String!): User!
    }
`;

module.exports = {typeDefs};