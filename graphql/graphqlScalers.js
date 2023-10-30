const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A valid date time value.',
  parseValue: (value) => new Date(value), // value from the client
  serialize: (value) => value.getTime(), // value sent to the client
  parseLiteral: (ast) => (ast.kind === Kind.INT ? new Date(ast.value) : null)
})

module.exports = DateTime
