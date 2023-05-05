const express = require('express');

const router = express.Router();
const songController = require('../controllers/songController');

router.get('/', songController.getHome);

router.get('/detail/:id', songController.getDetails);

router.get('/create', songController.getSongCreate);

router.post('/create', songController.postSongCreate);

router.get('/detail/:id/edit', songController.getEditSong);

router.put('/detail/:id/edit', songController.postEditSong);

router.delete('/detail/:id', songController.deleteSong);

module.exports = router;
