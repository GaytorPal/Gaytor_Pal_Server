const { model, Schema } = require('mongoose');

clubSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    events: [
        {
            title: String,
            description: String,
            date: String,
        }
    ],
  });

module.exports = model('Club', clubSchema);
