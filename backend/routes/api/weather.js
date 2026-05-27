const express = require('express');
const router = express.Router();
const { getCurrentWeather, getForecast, getFarmingAdvice } = require('../controllers/weatherController');
const { auth } = require('../middleware/auth');

router.get('/current', auth, getCurrentWeather);
router.get('/forecast', auth, getForecast);
router.get('/advice', auth, getFarmingAdvice);

module.exports = router;