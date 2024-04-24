const Club = require('../../models/club');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ClubInputError } = require('apollo-server');
const checkAuth = require('../../util/check-auth');

const { SECRET_KEY } = require('../../config');

function generateToken(club) {
    return jwt.sign(
      {
        id: club.id,
        email: club.email,
        username: club.username
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
}

module.exports = {
    Query: {
        async getClubs() {
          try {
            const clubs = await Club.find().sort({ createdAt: -1 });

            return clubs;
          } catch (err) {
            throw new Error(err);
          }
        },
        async getEventsByDue(_, {target_username, target_dueDate}) {
          // const club = await Club.findOne({username})

          console.log(target_username)
          console.log(target_dueDate)

          try {
            // const due_events = await Club.find({ "events.dueDate": target_dueDate, username: target_username });
            const due_events = await Club.aggregate(
                                                         [
                                                          {"$unwind": {"path": "$events"}},
                                                          {"$match": {"events.dueDate": target_dueDate, "username": target_username}},
                                                          {"$project":
                                                            {"title": "$events.title", "dueDate": "$events.dueDate"}}
                                                         ])

            console.log(due_events)

            return due_events;
          } catch (err) {
            throw new Error(err);
          }
        }
    },
     Mutation: {
        async registerClub( _,{registerInput: { username, email, password, confirmPassword }}) {

            //TODO: check register input is valid

            //Make sure club doesnt already exist
            const club = await Club.findOne({ username });
            if (club) {
              throw new ClubInputError('Username is taken', {
                errors: {
                  username: 'This username is taken'
                }
              });
            }
            //hash password and create an auth token
            password = await bcrypt.hash(password, 12);
      
            const newClub = new Club({
              email,
              username,
              password,
              createdAt: new Date().toISOString()
            });
      
            const res = await newClub.save();
      
            const token = generateToken(res);
      
            return {
              ...res._doc,
              id: res._id,
              token
            };
          },
        async loginClub(_, {username, password}) {
            const club = await Club.findOne({ username });

            console.log(`AAAAAAAAAAAAAAAAAAAAAAA${club.username}`)

            if (!club) {
              errors.general = 'Club not found';
              throw new ClubInputError('Club not found', { errors });
            }

            const match = await bcrypt.compare(password, club.password);
            if (!match) {
                errors.general = 'Wrong crendetials';
                throw new ClubInputError('Wrong crendetials', { errors });
            }

            const token = generateToken(club);

            return {
                ...club._doc,
                id: club._id,
                token
              };
        },
        async addEvent(_, {username, title, description, dueDate, category}) {

          var club = await Club.findOne({ username });

          console.log(club.username)

          //input validation
          if (title.trim() === '') {
            throw new ClubInputError ('Empty Event Title', {
              errors: {
                body: 'Event Title must not be empty'
              }
            });
          }

          const due_month = Number(dueDate.substring(0, 2))
          const due_day = Number(dueDate.substring(3, 5))
          const due_year = Number(dueDate.substring(6, 10))

          if (due_month > 12) {
            throw new ClubInputError ('Invalid Month in Date', {
              errors: {
                body: 'Month must not exceed 12'
              }
            });
          }
          if ((due_month == 1 || due_month == 3 || due_month == 5 || due_month == 7 || due_month == 8 || due_month == 10 || due_month == 12)
               && due_day > 31) {
            throw new ClubInputError ('Invalid Day in Date', {
              errors: {
                body: 'Day in specified month must not exceed 31'
              }
            });
          }
          else if ((due_month == 4 || due_month == 6 || due_month == 9 || due_month == 11) && due_day > 30) {
            throw new ClubInputError ('Invalid Day in Date', {
              errors: {
                body: 'Day in specified month must not exceed 30'
              }
            });
          }
          else if (due_month == 2) {  
            if (!(due_year % 4 === 0) && due_day > 28) {                //leap year :)
              throw new ClubInputError ('Invalid Day in Date', {
                errors: {
                  body: 'Day in specified month must not exceed 28'
                }
              });
            }
            else if (due_day > 29) {
              throw new ClubInputError ('Invalid Day in Date', {
                errors: {
                  body: 'Day in specified month must not exceed 29'
                }
              });
            }
          }

          if (club) {   //club found
            club.events.unshift({
              title,
              description,
              dueDate,
              category
            });
            await club.save();
            return club;
          } else throw new ClubInputError('Club not found')
        } //TODO: Add checking for correct input format xx/xx/xxxx
     }
};
