const express = require("express"); 
const router = express.Router(); 
const testController = require("../controllers/testController"); 

router.get('/', testController.test); 

router.post('/', testController.search); 

module.exports = router; 