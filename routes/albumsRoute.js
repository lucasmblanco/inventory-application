var express = require('express');
var router = express.Router();
const albumController = require("../controllers/albumController");

router.get('/', albumController.getHome); 

router.get('/detail/:id', albumController.getDetails); 

module.exports = router;