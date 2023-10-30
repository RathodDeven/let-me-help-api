const dotenv = require('dotenv')
dotenv.config()
// server.js
// eslint-disable-next-line no-unused-vars
const db = require('./db.js')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const app = express()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true // Enable Apollo Explorer
})

// Start the server
server
  .start()
  .then(() => {
    server.applyMiddleware({ app })

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server', error)
  })
