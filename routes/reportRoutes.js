const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateJWT = require('../middlewares/authMiddleware');

router.get('/', authenticateJWT, reportController.getReports);
router.post('/', authenticateJWT, reportController.createReport);

module.exports = router;