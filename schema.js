// schema.js
const { gql } = require('apollo-server-express')
// eslint-disable-next-line no-unused-vars

const typeDefs = gql`
  type User {
    id: ID
    username: String
    email: String
    createdAt: String
  }

  type VolunteerTask {
    id: ID
    name: String
    description: String
    location: String
    dateTime: String
    duration: String
    images: [String]
    volunteers: [User]
    owner: User
    createdAt: String
  }

  input AuthPayLoad {
    username: String
    password: String
  }

  input VolunteerTaskPayLoad {
    name: String
    description: String
    location: String
    duration: String
    dateTime: String
    images: [String]
  }

  input VolunteerTaskWhere {
    _id: ID
    owner: ID
    attendingUserId: ID
  }

  enum Order {
    ASC
    DESC
  }

  input AnySort {
    field: String!
    order: Order
  }

  type Query {
    users: [User]
    volunteerTasks(where: VolunteerTaskWhere, sort: AnySort): [VolunteerTask]
    volunteerTask(where: VolunteerTaskWhere): VolunteerTask
  }

  type Mutation {
    createUser(AuthPayLoad: AuthPayLoad, email: String): User
    createVolunteerTask(
      AuthPayLoad: AuthPayLoad
      VolunteerTaskPayLoad: VolunteerTaskPayLoad
    ): VolunteerTask
    addVolunteerToTask(
      AuthPayLoad: AuthPayLoad
      volunteerTaskId: ID
    ): VolunteerTask
  }
`

module.exports = typeDefs
