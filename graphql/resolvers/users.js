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
        },
        async getAssignmentsByDue(_, {target_username, target_dueDate}) {
          // const user = await User.findOne({username})

          console.log(target_username)
          console.log(target_dueDate)

          try {
            // const due_assignments = await User.find({ "assignments.dueDate": target_dueDate, username: target_username });
            const due_assignments = await User.aggregate(
                                                         [
                                                          {"$unwind": {"path": "$assignments"}},
                                                          {"$match": {"assignments.dueDate": target_dueDate, "username": target_username}},
                                                          {"$project":
                                                            {"title": "$assignments.title", "dueDate": "$assignments.dueDate"}}
                                                         ])

            console.log(due_assignments)

            return due_assignments;
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
        },
        async addAssignment(_, {username, title, dueDate}) {
          var user = await User.findOne({username});

          //input validation
          if (title.trim() === '') {
            throw new UserInputError ('Empty Assignment Title', {
              errors: {
                body: 'Assignment Title must not be empty'
              }
            });
          }

          const due_month = Number(dueDate.substring(0, 2))
          const due_day = Number(dueDate.substring(3, 5))
          const due_year = Number(dueDate.substring(6, 10))

          if (due_month > 12) {
            throw new UserInputError ('Invalid Month in Due Date', {
              errors: {
                body: 'Month must not exceed 12'
              }
            });
          }
          if ((due_month == 1 || due_month == 3 || due_month == 5 || due_month == 7 || due_month == 8 || due_month == 10 || due_month == 12)
               && due_day > 31) {
            throw new UserInputError ('Invalid Day in Due Date', {
              errors: {
                body: 'Day in specified month must not exceed 31'
              }
            });
          }
          else if ((due_month == 4 || due_month == 6 || due_month == 9 || due_month == 11) && due_day > 30) {
            throw new UserInputError ('Invalid Day in Due Date', {
              errors: {
                body: 'Day in specified month must not exceed 30'
              }
            });
          }
          else if (due_month == 2) {  
            if (!(due_year % 4 === 0) && due_day > 28) {                //leap year :)
              throw new UserInputError ('Invalid Day in Due Date', {
                errors: {
                  body: 'Day in specified month must not exceed 28'
                }
              });
            }
            else if (due_day > 29) {
              throw new UserInputError ('Invalid Day in Due Date', {
                errors: {
                  body: 'Day in specified month must not exceed 29'
                }
              });
            }
          }

          if (user) {   //user found
            user.assignments.unshift({
              title,
              dueDate
            });
            await user.save();
            return user;
          } else throw new UserInputError('User not found')
        } //TODO: Add checking for correct input format xx/xx/xxxx
     }
};
