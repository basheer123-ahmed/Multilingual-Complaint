const axios = require('axios');

/**
 * OpenAI Text-to-Speech API Integration
 */
const generateTTS = async (req, res) => {
    const { text, voice = 'alloy' } = req.body;
    try {
        if (!text) return res.status(400).send("Missing text");
        
        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is missing in .env");
            return res.status(500).send("TTS API Key Missing");
        }

        const response = await axios.post("https://api.openai.com/v1/audio/speech", {
            model: "tts-1", 
            voice: voice,
            input: text
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            responseType: 'arraybuffer'
        });

        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);
    } catch (error) {
        console.error("OpenAI TTS failed:", error.message);
        res.status(500).send("TTS Generation Error");
    }
};

/**
 * Placeholder STT (To avoid route errors)
 */
const generateSTT = async (req, res) => {
    res.status(501).send("STT not implemented in this controller yet.");
};

module.exports = { generateTTS, generateSTT };
