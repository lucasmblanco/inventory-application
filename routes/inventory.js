var express = require('express');
var router = express.Router();
const Artist = require("../models/artist")
const Album = require("../models/album"); 
const Song = require("../models/song"); 
const Genre = require('../models/genre'); 

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const [artist, album, song, genre] = await Promise.all([
      Artist.countDocuments(),
      Album.countDocuments(),
      Song.countDocuments(),
      Genre.countDocuments(), 
    ]); 
    res.render('inventoryHome', {
        title: "Currently there's:",
        artist: artist,
        album: album,
        song: song,
        genre: genre
    })
  } catch(err) {
    return next(err)
}
});

module.exports = router;
