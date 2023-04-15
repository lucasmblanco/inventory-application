var express = require('express');
var router = express.Router();
const albumController = require("../controllers/albumController");

router.get('/', albumController.getHome); 

router.get('/detail/:id', albumController.getDetails); 

router.get('/create', albumController.uploadCoverAlbum, albumController.getCreateAlbum); 

router.post('/create', albumController.uploadCoverAlbum, albumController.postCreateAlbum); 

module.exports = router;