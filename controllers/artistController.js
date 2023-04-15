const Artist = require("../models/artist"); 
const path = require("path"); 
const fs = require("fs/promises"); 
const multer = require('multer');
const { body, validationResult } = require("express-validator"); 


const storage = multer.diskStorage({ 
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true); 
    } else {
        req.fileValidationError = 'Invalid file type. Only PNG, JPG and JPEG files are allowed.';
        cb(null, false); 
    }
}

const upload = multer({
    storage: storage, 
    fileFilter: fileFilter
    
})

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

const getCreateArtist = async (req, res, next) => {
    try {
        res.render(path.join(__dirname, '..', 'views', 'artists', 'artistForm.ejs'), {
            title: 'Create Artist', 
            artist: false,
            errors: false,
        })
    } catch (err) {
        next(err); 
    }
}

const uploadPhotoArtist = upload.single("photo");

const postCreateArtist = [
    body("name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Name must be specific."),
    body("formation_year")
        .isISO8601()
        .toInt(),
    body("disbandment_year")
        .customSanitizer((value) => {
        if (isNaN(value)) {
          return false; 
        }
        return parseInt(value);
        })
        .optional({checkFalsy: true})
        .isISO8601(),
    body("biography")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (req.fileValidationError) {
               errors.errors.push( {
                "value": "invalid_format",
                "msg": "Invalid file type. Only PNG, JPG and JPEG files are allowed.",
                "param": "photo",
                "location": "file"
                })
        }
        if (!errors.isEmpty()) {
            try {
                res.render(path.join(__dirname, '..', 'views', 'artists', 'artistForm.ejs'), {
                    title: 'Create Artist',
                    artist: req.body,
                    errors: errors.array(),
                })
            } catch (err) {
                return next(err);
            }
        } else {
            try {

                const checkArtistExistence = await Artist.findOne({ name: req.body.name }).exec(); 
                if (checkArtistExistence) {
                    res.redirect(checkArtistExistence.url); 
                } else {
                    const imgData = await fs.readFile(req.file.path)
                    const imgBase64 = Buffer.from(imgData).toString('base64');
                    const artist = new Artist({
                            name: req.body.name,
                            formation_year: req.body.formation_year,
                            disbandment_year: req.body.disbandment_year ?  req.body.disbandment_year : 'present',
                            biography: req.body.biography.replace(/&quot;/g, ''),
                            photo: imgBase64
                    })
                        await artist.save(); 
                        res.redirect(artist.url); 
                }

                } catch (err) {
                        return next(err);
                }
        }
    }
];

module.exports = {
    getHome,
    getDetails,
    getCreateArtist,
    uploadPhotoArtist,
    postCreateArtist
};