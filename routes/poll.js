const faker = require('faker');
const mongoose = require('mongoose');

const Poll = mongoose.model('Poll');

module.exports = (app) => {

  const createPolls = (amount) => {
    for (let i = 0; i < amount; i++) {
      const options = [];
      const optionsAmount = Math.floor(Math.random() * 5) + 2;
      for (let j = 0; j < optionsAmount; j++) {
        options.push({
          value: faker.lorem.words(),
          votes: 0,
        });
      }
      const voters = [];
      if (Math.random() > 0.7) {
        voters.push('5b8c18b0eb3e4e31ace65437');
      } 
      new Poll({
        question: faker.lorem.slug(),
        options,
        creator: '5b8954d98d94d72b583e3158',
        voters,
      })
      .save()
      .then(newPoll => {
        console.log(newPoll);
      });
    }
  } 
//  createPolls(5);

  app.get('/polls', (req, res) => {
    Poll.find({}, '_id question creationDate voters')
    .then(polls => {
      return res.json({
        polls,
      });
    })
    .catch(error => {
      return res.status(500).json({
        message: 'An error occurred while performing the query for polls',
      });
    });
  });      

  app.get('/poll/:pollId', (req, res) => {
    // TODO: Validation
    Poll.findById(req.params.pollId)
    .exec()
    .then(poll => {
      if (poll) {
        return res.json({
          poll,
        });
      }
      else {
        return res.status(404).json({
          message: 'No such poll',
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        message: 'An error occurred while performing the query for this poll',
      });
    });
  });      

}
 