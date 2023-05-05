// const Genre = require("../models/genre");
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { body, validationResult } = require('express-validator');
const Song = require('../models/song');
const Artist = require('../models/artist');
const Album = require('../models/album');

// ----- Multer Configuration -----
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
// -----------------------------

const getHome = async function (req, res, next) {
  try {
    const albumsResults = await Album.find({}, 'title artist')
      .populate('artist')
      .collation({ locale: 'en' })
      .sort({ title: 1 })
      .exec();
    res.render(path.join(__dirname, '..', 'views', 'albums', 'albumsHome'), {
      title: 'Albums',
      albums: albumsResults,
    });
  } catch (err) {
    return next(err);
  }
};

const getDetails = async function (req, res, next) {
  try {
    const [albumDetail, songs] = await Promise.all([
      Album.findById(req.params.id)
        .populate('artist')
        .exec(),
      Song.find({ album: req.params.id }).sort({ track_number: 1 }).exec(),
    ]);

    res.render(path.join(__dirname, '..', 'views', 'albums', 'albumDetail.ejs'), {
      title: albumDetail.title,
      artist: albumDetail.artist,
      cover: albumDetail.cover,
      release_year: albumDetail.release_year,
      // genres: albumDetail.genre,
      url: albumDetail.url,
      error: false,
      songs,
    });
  } catch (err) {
    return next(err);
  }
};

const getCreateAlbum = async function (req, res, next) {
  try {
    const artists = await Artist.find({}, 'name formation_year').exec();

    res.render(path.join(__dirname, '..', 'views', 'albums', 'albumForm'), {
      title: 'Create album',
      album: false,
      errors: false,
      artists,
      edit: false,
    });
  } catch (err) {
    return next(err);
  }
};

const uploadCoverAlbum = upload.single('cover');

const postCreateAlbum = [
  body('title', 'Title must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Title must be specific.'),
  body('artist', 'Artist must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Artist must be specific.'),
  body('release_year', 'Release year must not be empty').isISO8601().toInt(),

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
        const artists = await
        Artist.find({}, 'name formation_year').exec();

        res.render(path.join(__dirname, '..', 'views', 'albums', 'albumForm'), {
          title: 'Create album',
          album: req.body,
          errors: errors.array(),
          artists,

          edit: false,
        });
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkAlbumExistence = await Album.findOne({
          title: req.body.title,
        }).exec();
        if (checkAlbumExistence) {
          res.redirect(checkAlbumExistence.url);
        } else {
          const imgData = await fs.readFile(req.file.path);
          const imgBase64 = Buffer.from(imgData).toString('base64');
          const album = new Album({
            title: req.body.title,
            artist: req.body.artist,
            cover: imgBase64,
            release_year: req.body.release_year,
          });
          await album.save();
          res.redirect(album.url);
        }
      } catch (err) {
        return next(err);
      }
    }
  },
];

const getEditAlbum = async (req, res, next) => {
  try {
    const [album, artists] = await Promise.all([
      Album.findById(req.params.id).populate('artist').exec(),
      Artist.find({}, 'name formation_year').exec(),

    ]);

    res.render(path.join(__dirname, '..', 'views', 'albums', 'albumForm'), {
      title: 'Edit album information',
      errors: false,
      album,
      artists,
      edit: true,
    });
  } catch (err) {
    return next(err);
  }
};

const postEditAlbum = [
  body('title', 'Title must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Title must be specific.'),
  body('artist', 'Artist must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Artist must be specific.'),
  body('release_year', 'Release year must not be empty').isISO8601().toInt(),
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
        const artists = await
        Artist.find({}, 'name formation_year').exec();

        return res.render(
          path.join(__dirname, '..', 'views', 'albums', 'albumForm'),
          {
            title: 'Create an album',
            album: req.body,
            errors: errors.array(),
            artists,

            edit: true,
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkAlbumExistence = await Album.findOne({
          title: req.body.title,
        }).exec();
        let imgBase64;
        if (checkAlbumExistence) {
          if (req.params.id.toString() !== checkAlbumExistence._id.toString()) {
            try {
              const artists = await
              Artist.find({}, 'name formation_year').exec();

              return res.render(
                path.join(
                  __dirname,
                  '..',
                  'views',
                  'artists',
                  'artistForm.ejs',
                ),
                {
                  title: 'Edit artist information',
                  artist: req.body,
                  errors: [
                    {
                      msg: 'You cannot modify the information from an artist with information from another artist',
                    },
                  ],
                  artists,

                },
              );
            } catch (err) {
              return next(err);
            }
          }
          if (!req.file) {
            imgBase64 = checkAlbumExistence.photo;
          } else {
            const imgData = await fs.readFile(req.file.path);
            imgBase64 = Buffer.from(imgData).toString('base64');
          }
        } else if (!req.file) {
          try {
            const album = await Album.findById(req.params.id).exec();
            imgBase64 = album.photo;
          } catch (err) {
            return next(err);
          }
        } else {
          const imgData = await fs.readFile(req.file.path);
          imgBase64 = Buffer.from(imgData).toString('base64');
        }
        const album = new Album({
          title: req.body.title,
          artist: req.body.artist,
          cover: imgBase64,
          release_year: req.body.release_year,
          _id: req.params.id,
        });
        const albumUpdated = await Album.findByIdAndUpdate(
          req.params.id,
          album,
          { new: true },
        );
        return res.redirect(albumUpdated.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];

const deleteAlbum = async (req, res, next) => {
  try {
    const [albumDetail, songs] = await Promise.all([
      Album.findById(req.params.id)
        .populate('artist')
        .exec(),
      Song.find({ album: req.params.id }).sort({ track_number: 1 }).exec(),
    ]);
    if (songs.length) {
      try {
        res.render(path.join(__dirname, '..', 'views', 'albums', 'albumDetail.ejs'), {
          title: albumDetail.title,
          artist: albumDetail.artist,
          cover: albumDetail.cover,
          release_year: albumDetail.release_year,
          url: albumDetail.url,
          error: 'You cannot delete this album because is in use',
          songs,
        });
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        await Album.findByIdAndDelete(req.params.id);
        res.redirect('/albums');
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
  getCreateAlbum,
  uploadCoverAlbum,
  postCreateAlbum,
  getEditAlbum,
  postEditAlbum,
  deleteAlbum,
};
