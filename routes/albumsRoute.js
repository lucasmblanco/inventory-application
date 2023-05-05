const express = require('express');

const router = express.Router();
const albumController = require('../controllers/albumController');

router.get('/', albumController.getHome);

router.get('/detail/:id', albumController.getDetails);

router.get('/create', albumController.uploadCoverAlbum, albumController.getCreateAlbum);

router.post('/create', albumController.uploadCoverAlbum, albumController.postCreateAlbum);

router.get('/detail/:id/edit', albumController.getEditAlbum);

router.put('/detail/:id/edit', albumController.uploadCoverAlbum, albumController.postEditAlbum);

router.delete('/detail/:id', albumController.deleteAlbum);

module.exports = router;
