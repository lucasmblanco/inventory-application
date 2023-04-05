var express = require('express');
var router = express.Router();
const artistController = require("../controllers/artistController")

router.get('/', artistController.getHome); 

router.get('/detail/:id', artistController.getDetails); 

module.exports = router;