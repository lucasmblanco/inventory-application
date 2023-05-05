/* eslint no-underscore-dangle: 0 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const ArtistSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  formation_year: {
    type: Number,
    required: true,
  },
  disbandment_year: {
    type: Schema.Types.Mixed,
  },
  biography: {
    type: String,
    required: true,
  },
  photo: {
    type: Buffer,
  },
});

ArtistSchema.virtual('url').get(function () {
  return `/artists/detail/${this._id}`;
});

module.exports = mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);
