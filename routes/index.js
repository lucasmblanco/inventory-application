var express = require('express');
var router = express.Router();
const Artist = require("../models/artist")
const Album = require("../models/album"); 
const Song = require("../models/song"); 

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const [artist, album, song] = await Promise.all([
      Artist.countDocuments(),
      Album.countDocuments(),
      Song.countDocuments()
    ]); 
    res.render('index', {
        title: 'Music Library',
        artist: artist,
        album: album,
        song: song,
    })
  } catch(err) {
    return next(err)
}
});

module.exports = router;
