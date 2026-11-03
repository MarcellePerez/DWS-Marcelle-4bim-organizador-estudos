const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const controller = require('../controllers/taskcontroller');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
