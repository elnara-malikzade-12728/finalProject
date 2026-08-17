const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upsertProgress } = require('../controllers/progressController');

router.put('/:stepId', auth, upsertProgress);

module.exports = router;
