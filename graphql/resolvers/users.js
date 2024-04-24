const User = require('../../models/user');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
const checkAuth = require('../../util/check-auth');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb')

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

          try {
            
            const due_assignments = await User.aggregate(
                                                         [
                                                          {"$unwind": {"path": "$assignments"}},
                                                          {"$match": {"assignments.dueDateReduced": target_dueDate, "username": target_username}},
                                                          {"$project":
                                                            {"id": "$assignments._id", "title": "$assignments.title", "description": "$assignments.description",
                                                             "dueDate": "$assignments.dueDate", "dueDateReduced": "$assignments.dueDateReduced",
                                                              "category": "$assignments.category", "completed": "$assignments.completed"}}
                                                         ])

            console.log(due_assignments)

            // console.log(due_assignments[4].dueDate)

            return due_assignments;
          } catch (err) {
             console.log("repinga")
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
        async addAssignment(_, {username, title, description, dueDate, category}) {

          console.log(username)

          // var user = await User.findOne({username: checkAuth(context).username})
          var user = await User.findOne({username})
          
          if (!user) {throw new UserInputError('User not found')}

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

          console.log(dueDate)
          dueDate = dueDate.replaceAll(/-|_/gi,"/")
          console.log(dueDate)

          const dueDateReduced = dueDate.substring(0, 10)
          console.log(":" + dueDateReduced)

          const completed = false

          if (user) {   //user found
            user.assignments.unshift({
              title,
              description,
              dueDate,
              dueDateReduced,
              category,
              completed
            });
            await user.save();
            return user;
          } else throw new UserInputError('User not found')
        },

        async toggleCompleted(_, {target_id, user_id}) {
          try {

            //let the_id = ObjectId(target_id)

            // console.log(target_id)

            // const user = await User.findById(target_id).aggregate(
            //                                                 [
            //                                                 {"$unwind": {"path": "$assignments"}},
                                                          
                                                            
            //                                                 ]

            // )
            // console.log(user)

            // const the_assignment = User.find({
            //   "assignments": {
            //     "$elemMatch": {
            //       "_id": mongoose.Types.ObjectId(the_id),
            //       "default": true
            //     }
            //   }
            // }, {
            //   "accounts.$._id": 1 // "accounts.$": 1 also works
            // }).pretty()

          //   idConversionStage = {
          //     $addFields: {
          //        convertedId: { $toObjectId: "$_id" }
          //     }
          //  };
            
          //   const the_assignment = await User.aggregate(
          //                                                 [
          //                                                 {"$unwind": {"path": "$assignments"}},
          //                                                 idConversionStage,
          //                                                 {"$match": {"assignments.convertedId": target_id}},
          //                                                 {"$project":
          //                                                   {"id": "$assignments.id"}}
          //                                                 ])

          const user = await User.findById(user_id);
          console.log(user)

          if (user) {
            const assignment_index = user.assignments.findIndex((c) => c.id === target_id);

            if (assignment_index == -1) {throw new UserInputError("Assignment not found")}

            console.log(assignment_index)
    
            if (user.assignments[assignment_index].completed) 
            {
              user.assignments[assignment_index].completed = false
            } else {
              user.assignments[assignment_index].completed = true
            }
              await user.save();
              return user;
          } else {
            throw new UserInputError('User not found');
          }
        }
          catch (err) {
             console.log("repinga")
             throw new Error(err);
          }
        },

        async deleteAssignment(_, {target_id, user_id}) {
          try {
            
            const user = await User.findById(user_id);
            console.log(user)

            if (user) {
              const assignment_index = user.assignments.findIndex((c) => c.id === target_id);

              if (assignment_index == -1) {throw new UserInputError("Assignment not found")}

              console.log(assignment_index)
      
              user.assignments.splice(assignment_index, 1)

              await user.save();
              return "Assignment Deleted Successfully";

            } else {
              throw new UserInputError('User not found');
            }
          }
            catch (err) {
              console.log("repinga")
              throw new Error(err);
          }
        },

        async modifyAssignment(_, {target_id, user_id, title, description, dueDate, category, completed}) {
          try {
            
            const user = await User.findById(user_id);
            console.log(user)

            if (!user) {throw new UserInputError("User not found")}

            const assignment_index = user.assignments.findIndex((c) => c.id === target_id);

            if (assignment_index == -1) {throw new UserInputError("Assignment not found")}

            console.log(assignment_index)
      
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

            console.log(dueDate)
            dueDate = dueDate.replaceAll(/-|_/gi,"/")
            console.log(dueDate)

            const dueDateReduced = dueDate.substring(0, 10)
            console.log(":" + dueDateReduced)

            user.assignments[assignment_index] = {
              id: target_id,
              title,
              description,
              dueDate,
              dueDateReduced,
              category,
              completed
            };

            await user.save();
            return user;
          }
            catch (err) {
              console.log("repinga")
              throw new Error(err);
          }
        }
     }
};
