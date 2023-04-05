const Album = require("../models/album"); 
const path = require("path"); 

const getHome = async function (req, res, next) {
    try {
        const albumsResults = await Album.find({}, "title artist").populate("artist").exec(); 
        res.render(path.join(__dirname, '..', 'views', 'albums', 'albumsHome'), {
            title: "Albums", 
            albums: albumsResults
        }); 
    } catch (err) {
        return next(err); 
    }
}

const getDetails = async function (req, res, next) {
    try {
        const albumDetail = await Album.findById(req.params.id).populate("artist").populate("genre").exec(); 
        res.render(path.join(__dirname, '..', 'views', 'albums', 'albumDetail'), {
            title: albumDetail.title, 
            artist: albumDetail.artist, 
            cover: albumDetail.cover,
            release_year: albumDetail.release_year,
            genres: albumDetail.genre
        })
    } catch (err) {
        next(err); 
    }
}

module.exports = {
    getHome, 
    getDetails
}