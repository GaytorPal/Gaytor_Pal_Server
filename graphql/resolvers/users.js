const User = require('../../models/user');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY } = require('../../config');

function generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
}

module.exports = {
    Query: {
        async getUsers() {
          try {
            const users = await User.find().sort({ createdAt: -1 });

            return users;
          } catch (err) {
            throw new Error(err);
          }
        }
    },
     Mutation: {
        async registerUser( _,{registerInput: { username, email, password, confirmPassword }}) {

            //TODO: check register input is valid

            //Make sure user doesnt already exist
            const user = await User.findOne({ username });
            if (user) {
              throw new UserInputError('Username is taken', {
                errors: {
                  username: 'This username is taken'
                }
              });
            }
            //hash password and create an auth token
            password = await bcrypt.hash(password, 12);
      
            const newUser = new User({
              email,
              username,
              password,
              points: 0,
              createdAt: new Date().toISOString()
            });
      
            const res = await newUser.save();
      
            const token = generateToken(res);
      
            return {
              ...res._doc,
              id: res._id,
              token
            };
          },
        async loginUser(_, {username, password}) {
            const user = await User.findOne({ username });

            console.log(`AAAAAAAAAAAAAAAAAAAAAAA${user.username}`)

            if (!user) {
              errors.general = 'User not found';
              throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong crendetials';
                throw new UserInputError('Wrong crendetials', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
              };
        }
     }
};
