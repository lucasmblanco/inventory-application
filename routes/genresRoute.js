const express = require("express"); 
const router = express.Router(); 
const genreController = require("../controllers/genreController"); 

router.get('/', genreController.getHome); 

router.get('/detail/:id', genreController.getDetails)

module.exports = router; 