const express = require('express');
const { generateTTS, generateSTT } = require('../controllers/ttsController');

const router = express.Router();

router.post('/', generateTTS);
router.post('/stt', generateSTT);

module.exports = router;
