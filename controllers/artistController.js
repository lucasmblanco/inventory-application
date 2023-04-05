const Artist = require("../models/artist"); 
const path = require("path"); 

const getHome = async (req, res, next) => {
    try {
        const artistsResult = await Artist.find({}, "name").exec(); 
        res.render(path.join(__dirname, '..', 'views', 'artists', 'artistsHome.ejs'), {
            title: 'Artists', 
            artists: artistsResult
        })
    } catch (err) {
        return next(err)
    }
}


const getDetails = async (req, res, next) => {
    try { 
        const artistDetail = await Artist.findById(req.params.id).exec(); 
        res.render(path.join(__dirname, '..', 'views', 'artists', 'artistDetail.ejs'), {
            title: artistDetail.name,
            formation_year: artistDetail.formation_year, 
            disbandment_year: artistDetail.disbandment_year, 
            biography: artistDetail.biography, 
            photo: artistDetail.photo
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getHome,
    getDetails
};