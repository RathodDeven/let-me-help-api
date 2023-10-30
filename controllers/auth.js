// const jwt = require('jsonwebtoken')
// const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const bcrypt = require('bcrypt')

// to be added to .env
// const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)

// const verifyGoogleToken = async (idToken) => {
//   const ticket = await client.verifyIdToken({
//     idToken,
//     audience: 'YOUR_CLIENT_ID'
//   })

//   const payload = ticket.getPayload()
//   const sub = payload.sub
//   const email = payload.email
//   const picture = payload.picture
//   // You can also extract other user information here

//   const user = await User.findOne({ sub })

//   if (user) {
//     return user
//   }

//   const newUser = new User({
//     sub,
//     email,
//     picture
//   })

//   return await newUser.save()
// }

const addNewUser = async ({ username, password, email }) => {
  // to do email verification in future

  // check if user with the username already exists
  const existingUser = await User.findOne({ username })

  if (existingUser) {
    throw new Error('Username already exists')
  }

  const newUser = new User({
    username,
    password,
    email
  })

  return await newUser.save()
}

const verify = async ({ username, password }) => {
  const user = await User.findOne({ username })

  if (!user) {
    throw new Error('User not found')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid password')
  }

  return user
}

module.exports = {
  addNewUser,
  verify
  // verifyGoogleToken
}
