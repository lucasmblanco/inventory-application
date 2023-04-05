const Song = require('../models/song'); 
const path = require("path"); 
const moment = require('moment');

const getHome = async function(req, res, next) {
    try {
        const songsResult = await Song.find({}, "title artist").populate("artist").exec(); 
        res.render(path.join(__dirname, '..', 'views', 'songs', 'songsHome.ejs'), {
            title: 'Songs',
            songs: songsResult
        });
    } catch (err) {
        return next(err); 
    }
}

const getDetail = async function (req, res, next) {
    try {
        const songDetail = await Song.findById(req.params.id).populate(["artist", "album", "genre"]); 
        res.render(path.join(__dirname, '..', 'views', 'songs', 'songDetail.ejs'), {
            title: songDetail.title,
            artist: songDetail.artist,
            album: songDetail.album, 
            duration: moment.duration(songDetail.duration).asMinutes(),
            genre: songDetail.genre
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getHome,
    getDetail
}