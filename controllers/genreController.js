const path = require('path');
const { body, validationResult } = require('express-validator');
const Genre = require('../models/genre');
const Song = require('../models/song');

const getHome = async (req, res, next) => {
  try {
    const genresResult = await Genre.find({})
      .collation({ locale: 'en' })
      .sort({ name: 1 })
      .exec();
    res.render(
      path.join(__dirname, '..', 'views', 'genres', 'genresHome.ejs'),
      {
        title: 'Genres',
        genres: genresResult,
      },
    );
  } catch (err) {
    next(err);
  }
};

const getDetails = async (req, res, next) => {
  try {
    const [genresResults, songsResults] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Song.find({ genre: req.params.id }).populate('artist').exec(),
    ]);

    res.render(
      path.join(__dirname, '..', 'views', 'genres', 'genreDetails.ejs'),
      {
        title: genresResults.name,
        songs: songsResults,
        error: false,
        url: genresResults.url,
      },
    );
  } catch (err) {
    next(err);
  }
};

const getcreateGenre = (req, res) => {
  res.render(path.join(__dirname, '..', 'views', 'genres', 'genreForm.ejs'), {
    title: 'Create genre',
    genre: false,
    errors: false,
  });
};

const postcreateGenre = [
  body('name').trim().isLength({ min: 1 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      try {
        return res.render(
          path.join(__dirname, '..', 'views', 'genres', 'genreForm.ejs'),
          {
            title: 'Create genre',
            genre: req.body,
            errors: errors.array(),
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkGenreExistence = await Genre.findOne({
          name: req.body.name,
        }).exec();
        if (checkGenreExistence) {
          try {
            return res.redirect(checkGenreExistence.url);
          } catch (err) {
            return next(err);
          }
        } else {
          try {
            const genre = new Genre({
              name: req.body.name,
            });

            await genre.save();
            return res.redirect(genre.url);
          } catch (err) {
            return next(err);
          }
        }
      } catch (err) {
        return next(err);
      }
    }
  },
];

const getEditGenre = async (req, res, next) => {
  try {
    const [genre, songs] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Song.find({ genre: req.params.id }).populate('artist').exec(),
    ]);
    if (songs.length) {
      try {
        return res.render(
          path.join(__dirname, '..', 'views', 'genres', 'genreDetails.ejs'),
          {
            title: genre.name,
            songs,
            error: 'You cannot edit this genre because is in use',
            url: genre.url,
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        return res.render(
          path.join(__dirname, '..', 'views', 'genres', 'genreForm.ejs'),
          {
            title: 'Create genre',
            errors: false,
            genre,
          },
        );
      } catch (err) {
        return next(err);
      }
    }
  } catch (err) {
    return next(err);
  }
};

const postEditGenre = [
  body('name').trim().isLength({ min: 1 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      try {
        return res.render(
          path.join(__dirname, '..', 'views', 'genres', 'genreForm.ejs'),
          {
            title: 'Create genre',
            genre: req.body,
            errors: errors.array(),
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkGenreExistence = await Genre.findOne({
          name: req.body.name,
        }).exec();

        if (checkGenreExistence) {
          try {
            return res.render(
              path.join(__dirname, '..', 'views', 'genres', 'genreForm.ejs'),
              {
                title: 'Create genre',
                genre: req.body,
                errors: [
                  {
                    msg: 'Name already in use, try another',
                  },
                ],
              },
            );
          } catch (err) {
            return next(err);
          }
        } else {
          try {
            const genre = new Genre({
              name: req.body.name,
            });

            await genre.save();
            return res.redirect(genre.url);
          } catch (err) {
            return next(err);
          }
        }
      } catch (err) {
        return next(err);
      }
    }
  },
];

const deleteGenre = async (req, res, next) => {
  try {
    const [genre, songs] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Song.find({ genre: req.params.id }).populate('artist').exec(),
    ]);

    if (songs.length) {
      try {
        return res.render(
          path.join(__dirname, '..', 'views', 'genres', 'genreDetails.ejs'),
          {
            title: genre.name,
            songs,
            error: 'You cannot delete this genre because is in use',
            url: genre.url,
          },
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        await Genre.findByIdAndRemove(req.params.id);
        return res.redirect('/genres');
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
  getcreateGenre,
  postcreateGenre,
  getEditGenre,
  postEditGenre,
  deleteGenre,
};
