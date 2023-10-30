const mongoose = require('mongoose')

const VolunteerTaskSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    location: String,
    duration: String,
    dateTiem: String,
    images: [String],
    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('VolunteerTask', VolunteerTaskSchema)
