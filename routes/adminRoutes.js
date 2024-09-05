const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateJWT = require('../middlewares/authMiddleware');

router.post('/login', adminController.adminLogin);

module.exports = router;