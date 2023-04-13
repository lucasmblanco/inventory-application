const Genre = require("../models/genre"); 
const Songs = require("../models/song")
const path = require("path"); 

const getHome = async (req, res, next) => {
    try {
        const genresResult = await Genre.find({}).exec(); 
        res.render(path.join(__dirname, '..', 'views', 'genres', 'genresHome.ejs'), {
            title: "Genres", 
            genres: genresResult,
        })
    } catch (err) {
        next(err); 
    }
}

const getDetails = async (req, res, next) => {
    try {
        const [genresResults, songsResults] = await Promise.all([
            Genre.findById(req.params.id).exec(),
            Songs.find({ genre: req.params.id }).populate("artist").exec()  
        ]) 
        
        res.render(path.join(__dirname, '..', 'views', 'genres', 'genreDetails.ejs'), {
            title: genresResults.name,
            songs: songsResults,
    })
    } catch (err) {
        next(err); 
    }
}

module.exports = {
    getHome, 
    getDetails
}