const faker = require('faker');
const mongoose = require('mongoose');
const passport = require('passport');

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
//  createPolls(15);

  app.get('/polls', (req, res) => {
    Poll
    .find({}, '_id question creationDate creator voters')
    .sort([['creationDate', -1]])
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

  app.get('/polls/:userId', (req, res) => {
    Poll
    .find({
      creator: req.params.userId,
    }, '_id question creationDate creator voters')
    .sort([['creationDate', -1]])
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

  app.post(
    '/poll',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      new Poll({
        question: req.body.question,
        options: req.body.options,
        creator: req.user.id,
      })
      .save()
      .then(newPoll => {
        return res.json({
          poll: newPoll,
          message: 'New poll was created successfully',
        });
      })
      .catch(error => {
        return res.status(500).json({
          message: 'An error happened while creating this poll',
        });
      })
    }
  );

  app.patch(
    '/poll/:pollId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      // TODO: validation
      const query = {
        _id: req.params.pollId,
        creator: req.user.id,
      };
      // TODO: validation
      const update = {
        $push: { options: { $each: req.body.options } },
      };
      Poll.findOneAndUpdate(query, update, { new: true })
      .then(updatedPoll => {
        if (updatedPoll) {
          return res.json({
            poll: updatedPoll,
            message: 'Poll was updated successfully',
          });
        }
        return res.status(403).json({
          message: 'No such poll or you are not authorized to update this poll',
        });
      })
      .catch(error => {
        return res.status(500).json({
          message: 'An error happened while updating this poll',
        });
      });
    }
  );

  app.patch('/poll/:pollId/vote', (req, res) => {
    Poll.findOneAndUpdate(
      {
        _id: req.params.pollId,
        'options._id': req.body.optionId, 
      }, {
        $inc: { 'options.$.votes': 1 },
        $push: { voters: req.body.voter },
      }, {
        new: true,
      }
    )
    .then(updatedPoll => {
      if (updatedPoll) {
        return res.json({
          poll: updatedPoll
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

  app.delete(
    '/poll/:pollId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      // validation
      const query = {
        _id: req.params.pollId,
        creator: req.user.id,
      };
      Poll.findOneAndRemove(query)
      .then(deletedPoll => {
        if (deletedPoll) {
          return res.json({
            message: 'Poll was deleted successfully',
          });
        }
        return res.status(403).json({
          message: 'No such poll or you are not authorized to delete this poll',
        });
      })
      .catch(error => {
        return res.status(500).json({
          message: 'An error happened while deleting this poll',
        });
      });
    }
  );


}
