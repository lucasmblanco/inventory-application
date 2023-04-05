const express = require("express"); 
const router = express.Router(); 
const songController = require("../controllers/songController"); 

router.get('/', songController.getHome); 

router.get('/detail/:id', songController.getDetails); 

module.exports = router; 