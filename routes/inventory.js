const express = require('express');

const router = express.Router();
const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');
const Genre = require('../models/genre');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const [artist, album, song, genre] = await Promise.all([
      Artist.countDocuments(),
      Album.countDocuments(),
      Song.countDocuments(),
      Genre.countDocuments(),
    ]);
    return res.render('inventoryHome', {
      title: "Currently there's:",
      artist,
      album,
      song,
      genre,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
