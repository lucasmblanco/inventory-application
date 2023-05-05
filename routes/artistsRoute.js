const express = require('express');

const router = express.Router();
const artistController = require('../controllers/artistController');

router.get('/', artistController.getHome);

router.get('/detail/:id', artistController.getDetails);

router.get('/create', artistController.getCreateArtist);

router.post('/create', artistController.uploadPhotoArtist, artistController.postCreateArtist);

router.get('/detail/:id/edit', artistController.getEditArtist);

router.put('/detail/:id/edit', artistController.uploadPhotoArtist, artistController.postEditArtist);

router.delete('/detail/:id/', artistController.deleteArtist);

module.exports = router;
