import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, SkipForward, Repeat, Volume2, X, Check, Globe, ChevronRight, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../config/api';

const VoiceFIRRobot = ({ onClose, onComplete }) => {
    const [hasStarted, setHasStarted] = useState(false);
    const [history, setHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [manualText, setManualText] = useState('');
    const [aiReply, setAiReply] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());

    const handleStart = async () => {
        setHasStarted(true);
        // Force an audio play on interaction to unlock the audio context
        audioRef.current.src = ""; 
        await audioRef.current.play().catch(() => {});
        
        const greeting = "నమస్కారం! నేను అనంతపూరు పోలీస్ అసిస్టెంట్ ని. మీకు ఒక ఎఫ్ఐఆర్ నమోదు చేయడంలో నేను సహాయపడతాను. మీ పేరు ఏమిటి?";
        setAiReply(greeting);
        setHistory([{ role: 'assistant', content: greeting }]);
        await speakWithRetry(greeting);
    };

    /**
     * ULTRA ROBUST TTS (OPENAI STREAM -> BROWSER FALLBACK)
     */
    const speakWithRetry = async (text) => {
        setIsSpeaking(true);
        try {
            // First Attempt: Premium OpenAI Stream via Backend
            const response = await axios.post(`${API_BASE}/api/tts`, { 
                text: text, 
                voice: 'alloy' 
            }, { 
                responseType: 'blob',
                timeout: 5000 
            });

            const url = URL.createObjectURL(response.data);
            audioRef.current.src = url;
            
            audioRef.current.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(url);
                startListening();
            };

            audioRef.current.onerror = async () => {
                console.warn("Audio buffer failed, trying browser synthesis...");
                await fallbackToBrowser(text);
            };

            await audioRef.current.play();
        } catch (err) {
            console.warn("Backend TTS failed, using browser fallback.");
            await fallbackToBrowser(text);
        }
    };

    const fallbackToBrowser = (text) => {
        return new Promise((resolve) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Try to find ANY Telugu voice or default
            utterance.lang = 'te-IN';
            utterance.rate = 0.9;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
                startListening();
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
                resolve();
                startListening();
            };
            
            window.speechSynthesis.speak(utterance);
        });
    };

    useEffect(() => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            recognitionRef.current = new SpeechRec();
            recognitionRef.current.lang = 'te-IN';
            recognitionRef.current.continuous = false;
            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                processInput(text);
            };
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, [history]);

    const startListening = () => {
        if (recognitionRef.current && !isProcessing && !isSpeaking) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.warn(e);
            }
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualText.trim() || isProcessing || isSpeaking) return;
        processInput(manualText);
        setManualText('');
    };

    const processInput = async (userInput) => {
        if (!userInput.trim()) return;
        setIsProcessing(true);
        try {
            // Updated to handle both authenticated and unauthenticated for robustness
            const response = await axios.post(`${API_BASE}/api/chat/voice-fir`, {
                message: userInput,
                history: history,
                lang: 'te'
            });

            const reply = response.data.reply;
            setAiReply(reply);
            setHistory(prev => [...prev, { role: 'user', content: userInput }, { role: 'assistant', content: reply }]);

            await speakWithRetry(reply);
        } catch (err) {
            console.error("AI Comm Error:", err);
            setErrorMsg("Connection error. Ensure Server is running on Port 5000.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center p-6 h-full overflow-hidden">
            <div className="w-full max-w-2xl flex flex-col h-full bg-slate-50 border-8 border-slate-100/50 rounded-[3rem] shadow-2xl relative">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center p-8 border-b-2 border-slate-100 bg-white rounded-t-[2.5rem]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">P</div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-slate-800 leading-none">పోలీస్ సహాయకుడు</h2>
                            <p className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest">Active Assistant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-50 rounded-full text-slate-400">
                        <X size={24}/>
                    </button>
                </div>

                {!hasStarted ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-10 text-center px-10">
                        <div className="w-40 h-40 bg-blue-600 rounded-[3.5rem] flex items-center justify-center text-white shadow-2xl">
                            <Mic size={64}/>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black text-slate-900 leading-tight">నమస్కారం!</h1>
                            <p className="text-slate-500 font-bold text-xl px-12">ఎఫ్ఐఆర్ నమోదు చేయడానికి దయచేసి 'ప్రారంభించండి' నొక్కండి.</p>
                        </div>
                        <button onClick={handleStart} className="px-16 py-7 bg-blue-600 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                            ప్రారంభించండి (START)
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 h-full p-6 gap-6 overflow-hidden">
                        
                        {/* Conversation Bubble */}
                        <motion.div key={aiReply} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white border-4 border-white p-8 rounded-[3.5rem] shadow-xl text-center relative mt-4">
                            <h2 className="text-2xl font-black text-slate-800 leading-snug">
                                {isProcessing ? "ఆలోచిస్తున్నాను..." : aiReply}
                            </h2>
                        </motion.div>

                        <div className="flex-1 overflow-y-auto" />

                        {/* Control Area */}
                        <div className="w-full bg-white p-6 rounded-[3.5rem] flex flex-col gap-6 shadow-xl border-b-8 border-slate-100">
                            
                            <div className="flex items-center gap-6 px-4">
                                <button
                                    onClick={startListening}
                                    disabled={isSpeaking || isProcessing}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 shadow-2xl ring-4 ring-red-100' : 'bg-blue-600 shadow-xl'} ${isSpeaking || isProcessing ? 'opacity-20' : ''}`}
                                >
                                    {isListening ? (
                                        <div className="flex gap-1 items-end h-6">
                                            {[1,2,3,4,5].map(i => <motion.div key={i} animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }} className="w-1.5 bg-white rounded-full" />)}
                                        </div>
                                    ) : <Mic size={40} className="text-white" />}
                                </button>
                                <div className="flex flex-col">
                                    <p className="font-black text-slate-900 text-lg">
                                        {isSpeaking ? 'వినిపిస్తోంది...' : isListening ? 'వింటున్నాను...' : 'నొక్కండి మట్లాడండి'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for input</p>
                                </div>
                            </div>

                            <form onSubmit={handleManualSubmit} className="relative w-full">
                                <input
                                    type="text"
                                    value={manualText}
                                    onChange={(e) => setManualText(e.target.value)}
                                    placeholder="లేదా కింద టైప్ చేయండి..."
                                    className="w-full p-8 pr-28 bg-slate-100/50 border-4 border-white rounded-[3rem] text-2xl font-bold text-slate-800 outline-none transition-all shadow-inner"
                                />
                                <button type="submit" disabled={!manualText.trim() || isProcessing || isSpeaking} className="absolute right-5 top-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30">
                                    <Send size={28} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {errorMsg && <div className="fixed bottom-10 bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl z-[10000]">{errorMsg}</div>}
        </div>
    );
};

export default VoiceFIRRobot;
