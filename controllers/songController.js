const Song = require('../models/song'); 
const Artist = require('../models/artist'); 
const Album = require('../models/album'); 
const Genre = require('../models/genre'); 
const path = require("path"); 
const { body, validationResult } = require("express-validator");
//const moment = require('moment');

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

const getDetails = async function (req, res, next) {
    try {
        const songDetail = await Song.findById(req.params.id).populate(["artist", "album", "genre"]); 
        res.render(path.join(__dirname, '..', 'views', 'songs', 'songDetail.ejs'), {
            title: songDetail.title,
            artist: songDetail.artist,
            album: songDetail.album, 
            track_number: songDetail.track_number, 
            genres: songDetail.genre
        })
    } catch (err) {
        next(err)
    }
}

const getSongCreate = async function (req, res, next) {
    try {
        const [artists, albums, genres] = await Promise.all([
            Artist.find({}, "name").exec(),
            Album.find({}, "title").exec(),
            Genre.find().exec()
        ]); 

        res.render(path.join(__dirname, '..', 'views', 'songs', 'songForm.ejs'), {
            title: 'Create Song', 
            song: false,
            errors: false,
            artists, albums, genres
        })
    } catch (err) {
        return next(err); 
    }
}

const postSongCreate = [
    body('title', 'Title must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Title must be specific'), 
    body("artist", "Artist must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Artist must be specific'), 
    body("album", "Album must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Album must be specific'), 
    body("track_number", "Track number must not be empty")
        .isISO8601()
        .toInt(),
    async (req, res, next) => {
        const errors = validationResult(req); 
        if (!errors.isEmpty) {
            try {
                const [artists, albums, genres] = await Promise.all([
                    Artist.find({}, "name").exec(),
                    Album.find({}, "title").exec(),
                    Genre.find().exec()
                ]); 
        
                res.render(path.join(__dirname, '..', 'views', 'songs', 'songForm.ejs'), {
                    title: 'Create Song', 
                    song: req.body,
                    errors: errors.array(),
                    artists, albums, genres
                })
            } catch (err) {
                return next(err); 
            }
        } else {
            try {
                const song = new Song({
                    title: req.body.title,
                    artist: req.body.artist,
                    album: req.body.album,
                    track_number: req.body.track_number,
                    genre: req.body.genre
                }); 
                
                await song.save(); 
                res.redirect(song.url); 
            } catch (err) {
                return next(err); 
           }
             
        }
    }

]


module.exports = {
    getHome,
    getDetails,
    getSongCreate,
    postSongCreate
}