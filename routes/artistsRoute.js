var express = require('express');
var router = express.Router();
const artistController = require("../controllers/artistController")

router.get('/', artistController.getHome); 

router.get('/detail/:id', artistController.getDetails); 

router.get('/create', artistController.getCreateArtist); 

router.post('/create', artistController.uploadPhotoArtist, artistController.postCreateArtist); 

module.exports = router;