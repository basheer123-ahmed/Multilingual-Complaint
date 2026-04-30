const express = require('express');
const { handleChat, handleVoiceFIRConversation } = require('../controllers/chatController');

const { softProtect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', softProtect, handleChat);
router.post('/voice-fir', softProtect, handleVoiceFIRConversation);

module.exports = router;
