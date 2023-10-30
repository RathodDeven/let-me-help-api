// resolvers.js
const { verify } = require('./controllers/auth')
const { addNewUser } = require('./controllers/auth')
const User = require('./models/User') // Assuming you have a User model
const VolunteerTask = require('./models/VolunteerTask')

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
    createUser: async (_, { AuthPayLoad, email }) => {
      return await addNewUser({
        username: AuthPayLoad.username,
        password: AuthPayLoad.password,
        email
      })
    },
    createVolunteerTask: async (_, { AuthPayLoad, VolunteerTaskPayLoad }) => {
      const user = await verify(AuthPayLoad)
      const newVolunteerTask = new VolunteerTask({
        ...VolunteerTaskPayLoad,
        owner: user._id,
        volunteers: [user._id]
      })

      return await newVolunteerTask.save()
    },
    addVolunteerToTask: async (_, { AuthPayLoad, volunteerTaskId }) => {
      const user = await verify(AuthPayLoad)
      const volunteerTask = await VolunteerTask.findById(volunteerTaskId)
      if (!volunteerTask) {
        throw new Error('Volunteer Task not found')
      }
      volunteerTask.volunteers.push(user._id)
      return await volunteerTask.save()
    }
  }
}

module.exports = resolvers
