const express = require('express');
const router = express.Router();
const { listJobs } = require('../controllers/jobController');

router.get('/', listJobs);

module.exports = router;
