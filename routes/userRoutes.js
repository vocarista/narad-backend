const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/authMiddleware');

router.get('/', authenticateJWT, userController.getUsers);
router.delete('/:id', authenticateJWT, userController.deleteUser);
router.post('/update-location/:id', authenticateJWT, userController.updateLocation);

module.exports = router;