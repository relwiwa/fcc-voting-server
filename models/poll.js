const mongoose = require('mongoose');
const { Schema } = mongoose;

const PollOption = new Schema({
  value: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
    required: true,
  },
});

const pollSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  options: [PollOption],
  voters: {
    type: [Schema.Types.ObjectId],
  },
  creationDate: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

mongoose.model('Poll', pollSchema);
