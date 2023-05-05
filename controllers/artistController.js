const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Song = require('../models/song');
const Album = require('../models/album');
const Artist = require('../models/artist');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === 'image/png'
    || file.mimetype === 'image/jpg'
    || file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    req.fileValidationError = 'Invalid file type. Only PNG, JPG and JPEG files are allowed.';
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

const getHome = async (req, res, next) => {
  try {
    const artistsResult = await Artist.find({}, 'name').collation({ locale: 'en' }).sort({ name: 1 }).exec();
    res.render(
      path.join(__dirname, '..', 'views', 'artists', 'artistsHome.ejs'),
      {
        title: 'Artists',
        artists: artistsResult,
      },
    );
  } catch (err) {
    return next(err);
  }
};

const getDetails = async (req, res, next) => {
  try {
    const [artistDetail, artistSongs, artistAlbum] = await Promise.all([
      Artist.findById(req.params.id).exec(),
      Song.find({ artist: req.params.id }).sort({ title: 1 }).exec(),
      Album.find({ artist: req.params.id }).sort({ title: 1 }).exec(),
    ]);
    res.render(
      path.join(__dirname, '..', 'views', 'artists', 'artistDetail.ejs'),
      {
        title: artistDetail.name,
        formation_year: artistDetail.formation_year,
        disbandment_year: artistDetail.disbandment_year,
        biography: artistDetail.biography,
        photo: artistDetail.photo,
        url: artistDetail.url,
        songs: artistSongs,
        albums: artistAlbum,
        error: false,
      },
    );
  } catch (err) {
    next(err);
  }
};

const getCreateArtist = async (req, res, next) => {
  try {
    res.render(
      path.join(__dirname, '..', 'views', 'artists', 'artistForm.ejs'),
      {
        title: 'Create Artist',
        artist: false,
        errors: false,
        edit: false,
      },
    );
  } catch (err) {
    next(err);
  }
};

const uploadPhotoArtist = upload.single('photo');

const postCreateArtist = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Name must be specific.'),
  body('formation_year').isISO8601().toInt(),
  body('disbandment_year')
    .customSanitizer((value) => {
      if (isNaN(value)) {
        return false;
      }
      return parseInt(value);
    })
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('biography').trim().isLength({ min: 1 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!req.file) {
      errors.errors.push({
        value: 'image_required',
        msg: 'Photo field must not be empty',
        param: 'photo',
        location: 'file',
      });
    } else if (req.fileValidationError) {
      errors.errors.push({
        value: 'invalid_format',
        msg: 'Invalid file type. Only PNG, JPG and JPEG files are allowed.',
        param: 'photo',
        location: 'file',
      });
    }
    if (!errors.isEmpty()) {
      try {
        res.render(
          path.join(__dirname, '..', 'views', 'artists', 'artistForm.ejs'),
          {
            title: 'Create Artist',
            artist: req.body,
            errors: errors.array(),
            edit: false,
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkArtistExistence = await Artist.findOne({
          name: req.body.name,
        }).exec();
        if (checkArtistExistence) {
          res.redirect(checkArtistExistence.url);
        } else {
          const imgData = await fs.readFile(req.file.path);
          const imgBase64 = Buffer.from(imgData).toString('base64');
          const artist = new Artist({
            name: req.body.name,
            formation_year: req.body.formation_year,
            disbandment_year: req.body.disbandment_year
              ? req.body.disbandment_year
              : 'present',
            biography: req.body.biography.replace(/&#x27;|&quot;/g, bringBackQuotes),
            photo: imgBase64,
          });
          await artist.save();
          res.redirect(artist.url);
        }
      } catch (err) {
        return next(err);
      }
    }
  },
];

function bringBackQuotes(value) {
  if (value === '&quot;') {
    return '"';
  } if (value === '&#x27;') {
    return "'";
  }
}

const getEditArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id).exec();
    res.render(
      path.join(__dirname, '..', 'views', 'artists', 'artistForm.ejs'),
      {
        title: 'Edit artist information',
        errors: false,
        artist,
        edit: true,
      },
    );
  } catch (err) {
    return next(err);
  }
};

const postEditArtist = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Name must be specific.'),
  body('formation_year').isISO8601().toInt(),
  body('disbandment_year')
    .customSanitizer((value) => {
      if (isNaN(value)) {
        return false;
      }
      return parseInt(value);
    })
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('biography').trim().isLength({ min: 1 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (req.fileValidationError) {
      errors.errors.push({
        value: 'invalid_format',
        msg: 'Invalid file type. Only PNG, JPG and JPEG files are allowed.',
        param: 'photo',
        location: 'file',
      });
    }
    if (!errors.isEmpty()) {
      try {
        return res.render(
          path.join(__dirname, '..', 'views', 'artists', 'artistForm.ejs'),
          {
            title: 'Edit artist information',
            artist: req.body,
            errors: errors.array(),
            edit: true,
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkArtistExistence = await Artist.findOne({
          name: req.body.name,
        }).exec();
        let imgBase64;
        if (checkArtistExistence) {
          if (
            req.params.id.toString() !== checkArtistExistence._id.toString()
          ) {
            return res.render(
              path.join(__dirname, '..', 'views', 'artists', 'artistForm.ejs'),
              {
                title: 'Edit artist information',
                artist: req.body,
                errors: [
                  {
                    msg: 'You cannot modify the information from an artist with information from another artist',
                  },
                ],
                edit: true,
              },
            );
          }
          if (!req.file) {
            imgBase64 = checkArtistExistence.photo;
          } else {
            const imgData = await fs.readFile(req.file.path);
            imgBase64 = Buffer.from(imgData).toString('base64');
          }
        } else if (!req.file) {
          try {
            const artist = await Artist.findById(req.params.id).exec();
            imgBase64 = artist.photo;
          } catch (err) {
            return next(err);
          }
        } else {
          const imgData = await fs.readFile(req.file.path);
          imgBase64 = Buffer.from(imgData).toString('base64');
        }
        const artist = new Artist({
          name: req.body.name,
          formation_year: req.body.formation_year,
          disbandment_year: req.body.disbandment_year
            ? req.body.disbandment_year
            : 'present',
          biography: req.body.biography.replace(/&#x27;|&quot;/g, bringBackQuotes),
          photo: imgBase64,
          _id: req.params.id,
        });
        const artistUpdated = await Artist.findByIdAndUpdate(
          req.params.id,
          artist,
          { new: true },
        );
        return res.redirect(artistUpdated.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];

const deleteArtist = async (req, res, next) => {
  try {
    const [albums, songs] = await Promise.all([
      Album.find({ artist: req.params.id }).exec(),
      Song.find({ artist: req.params.id }).exec(),
    ]);

    if (albums.length || songs.length) {
      try {
        const [artistDetail, artistSongs, artistAlbums] = await Promise.all([
          Artist.findById(req.params.id).exec(),
          Song.find({ artist: req.params.id }).sort({ title: 1 }).exec(),
          Album.find({ artist: req.params.id }).sort({ title: 1 }),
        ]);
        return res.render(
          path.join(__dirname, '..', 'views', 'artists', 'artistDetail.ejs'),
          {
            title: artistDetail.name,
            formation_year: artistDetail.formation_year,
            disbandment_year: artistDetail.disbandment_year,
            biography: artistDetail.biography,
            photo: artistDetail.photo,
            url: artistDetail.url,
            songs: artistSongs,
            albums: artistAlbums,
            error:
              'You cannot delete this artist',
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        await Artist.findByIdAndDelete(req.params.id);
        return res.redirect('/artists');
      } catch (err) {
        return next(err);
      }
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getHome,
  getDetails,
  getCreateArtist,
  uploadPhotoArtist,
  postCreateArtist,
  getEditArtist,
  postEditArtist,
  deleteArtist,
};
