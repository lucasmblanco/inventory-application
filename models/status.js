const mongoose = require('mongoose');

const { Schema } = mongoose;

const StatusSchema = new Schema({
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'Artist',
  },
  monthly_listeners: {
    type: Number,
    required: true,
  },
  followers: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.models.Status || mongoose.model('Status', StatusSchema);
