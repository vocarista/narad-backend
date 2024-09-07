const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authMiddleware')

const alertController = require('../controllers/alertController');

router.post('/', authenticateJWT, alertController.createAlert);
router.delete('/:id', authenticateJWT, alertController.deleteAlert);
router.get('/', authenticateJWT, alertController.getAlerts);