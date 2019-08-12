const uuid = require('uuid/v4');
const mongoose = require('mongoose');

const Student = new mongoose.Schema({
  _id: {
    type: String,
    default: function createId() { return uuid(); }
  },
  name: String,
  email: String
});

module.exports = {
  Student
};
