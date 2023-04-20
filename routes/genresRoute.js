const express = require("express"); 
const router = express.Router(); 
const genreController = require("../controllers/genreController"); 

router.get('/', genreController.getHome); 

router.get('/detail/:id', genreController.getDetails); 

router.get('/create', genreController.getcreateGenre); 

router.post('/create', genreController.postcreateGenre); 

router.get('/detail/:id/edit', genreController.getEditGenre); 

router.post('/detail/:id/edit', genreController.postEditGenre); 

router.delete('/detail/:id/', genreController.deleteGenre);

module.exports = router; 