/* eslint no-underscore-dangle: 0 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const AlbumSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  cover: {
    type: Buffer,
  },
  release_year: {
    type: Number,
    required: true,
  },
});

AlbumSchema.virtual('url').get(function () {
  return `/albums/detail/${this._id}`;
});

module.exports = mongoose.models.Album || mongoose.model('Album', AlbumSchema);
