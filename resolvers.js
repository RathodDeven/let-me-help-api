// resolvers.js
const { verify } = require('./controllers/auth')
const User = require('./models/User') // Assuming you have a User model
const VolunteerTask = require('./models/VolunteerTask')
const { Expo } = require('expo-server-sdk')

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN })

const resolvers = {
  VolunteerTask: {
    owner: async (parent, args, context, info) => {
      // parent is the current VolunteerTask object
      // You can fetch the User data based on parent.owner
      return await User.findById(parent.owner)
    },
    volunteers: async (parent, args, context, info) => {
      // parent is the current VolunteerTask object
      // You can fetch the User data based on parent.volunteers
      return await User.find({ _id: { $in: parent.volunteers } })
    }
  },
  Query: {
    user: async (_, { AuthPayLoad }) => {
      return await verify(AuthPayLoad)
    },
    users: async () => {
      return await User.find()
    },
    volunteerTasks: async (_, { where, sort }) => {
      // if there is sort field, sort the results
      if (sort) {
        return await VolunteerTask.find(where).sort({
          [sort.field]: sort.order === 'ASC' ? 1 : -1
        })
      }

      if (where.attendingUserId) {
        return await VolunteerTask.find({
          volunteers: { $in: [where.attendingUserId] }
        })
      }
      return await VolunteerTask.find(where)
    },
    volunteerTask: async (_, { where }) => {
      return await VolunteerTask.findOne(where)
    }
  },
  Mutation: {
    createUser: async (_, { AuthPayLoad, email, pushToken }) => {
      const username = AuthPayLoad.username
      const password = AuthPayLoad.password
      const existingUser = await User.findOne({
        username: AuthPayLoad.username
      })

      if (existingUser) {
        throw new Error('Username already exists')
      }

      const newUser = new User({
        username,
        password,
        email,
        pushToken
      })

      return await newUser.save()
    },
    createVolunteerTask: async (_, { AuthPayLoad, VolunteerTaskPayLoad }) => {
      const user = await verify(AuthPayLoad)
      const newVolunteerTask = new VolunteerTask({
        ...VolunteerTaskPayLoad,
        owner: user._id,
        volunteers: [user._id]
      })

      await newVolunteerTask.save()

      // send bulk notification to all users who have pushToken
      const users = await User.find({ pushToken: { $exists: true } })

      // get all unique pushTokens from users
      const pushTokens = [...new Set(users.map((user) => user?.pushToken))]

      // send notiifcation using expo-server-sdk
      const messages = []
      for (const pushToken of pushTokens) {
        if (!pushToken) continue
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
          continue
        }

        messages.push({
          to: pushToken,
          sound: 'default',
          body: VolunteerTaskPayLoad.name,
          data: newVolunteerTask
        })
      }

      const chunks = expo.chunkPushNotifications(messages)

      for (const chunk of chunks) {
        try {
          const receipts = await expo.sendPushNotificationsAsync(chunk)
          console.log(receipts)
        } catch (error) {
          console.error(error)
        }
      }

      return await newVolunteerTask.save()
    },
    addVolunteerToTask: async (_, { AuthPayLoad, volunteerTaskId }) => {
      const user = await verify(AuthPayLoad)
      const volunteerTask = await VolunteerTask.findById(volunteerTaskId)
      if (!volunteerTask) {
        throw new Error('Volunteer Task not found')
      }
      volunteerTask.volunteers.push(user._id)

      // send notification to owner of the task
      const owner = await User.findById(volunteerTask.owner)

      // send notiifcation using expo-server-sdk

      if (owner?.pushToken) {
        if (!Expo.isExpoPushToken(owner.pushToken)) {
          console.error(
            `Push token ${owner.pushToken} is not a valid Expo push token`
          )
          return await volunteerTask.save()
        }

        const message = {
          to: owner.pushToken,
          sound: 'default',
          body: `${user.username} has volunteered for ${volunteerTask.name}`,
          data: volunteerTask
        }

        try {
          const receipt = await expo.sendPushNotificationsAsync(message)
          console.log(receipt)
        } catch (error) {
          console.error(error)
        }
      }

      return await volunteerTask.save()
    }
  }
}

module.exports = resolvers
