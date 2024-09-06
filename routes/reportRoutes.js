const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateJWT = require('../middlewares/authMiddleware');

router.get('/', authenticateJWT, reportController.getReports);
router.post('/', authenticateJWT, reportController.createReport);
router.delete('/:id', authenticateJWT, reportController.deleteReport);

module.exports = router;