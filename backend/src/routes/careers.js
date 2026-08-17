const express = require('express');
const router = express.Router();
const { listCareers, getCareer, getRoadmap } = require('../controllers/careerController');

router.get('/', listCareers);
router.get('/:id', getCareer);
router.get('/:id/roadmap', getRoadmap);

module.exports = router;
