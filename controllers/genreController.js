const Genre = require("../models/genre"); 
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

module.exports = {
    getHome
}