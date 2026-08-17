const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const careerRoutes = require('./careers');
const jobRoutes = require('./jobs');
const progressRoutes = require('./progress');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/careers', careerRoutes);
router.use('/jobs', jobRoutes);
router.use('/progress', progressRoutes);

module.exports = router;
