const { model, Schema } = require('mongoose');

userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
  });

module.exports = model('User', userSchema);
