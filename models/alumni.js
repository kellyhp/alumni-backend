const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  job: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  otherEducation: {
    type: String 
  },
  url: {
    type: String,
    required: true
  } 
});

const Alumni = mongoose.model('alumni', alumniSchema);

module.exports = Alumni;