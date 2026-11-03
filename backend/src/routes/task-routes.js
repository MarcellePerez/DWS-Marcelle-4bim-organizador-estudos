const express = require('express');
const authenticate = require('../middleware/auth');
const controller = require('../controllers/task-controller');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
