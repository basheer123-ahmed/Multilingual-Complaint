const Complaint = require('../models/Complaint');
const User = require('../models/User');
const axios = require('axios');

/**
 * AI Central Intelligence Assistant
 * - System Aware
 * - Real-time Data Access (Complaint, Officer, FIR, Stats, Search)
 * - User-Specific Context (Authenticated)
 * - Dynamic Reasoning
 */

const handleChat = async (req, res) => {
  const { message, history } = req.body;
  const user = req.user;

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        reply: "System Intelligence Offline: Please configure `GROQ_API_KEY`."
      });
    }

    // 1. INTENT EXTRACTION LAYER
    const intentPrompt = `You are a system-intent-extractor for a governance platform.
    Analyze the user message and history to decide which data to fetch.
    
    User Message: "${message}"
    User Context: ${user ? `${user.name} (${user.role})` : 'Anonymous'}

    Possible Intents:
    - GET_COMPLAINT_DETAILS: Specific case lookup (requires COMP- ID)
    - SEARCH_COMPLAINTS: "High risk complaints", "Pending cases", "Theft reports", "What are the latest issues?"
    - LIST_MY_COMPLAINTS: "Show my complaints", "Status of my reports"
    - SEARCH_OFFICER: Questions about specific officers
    - SYSTEM_STATS: "Total complaints", "How many cases are resolved?"
    - GENERAL: Help, greetings

    Return JSON ONLY:
    {
      "intent": "GET_COMPLAINT_DETAILS" | "SEARCH_COMPLAINTS" | "LIST_MY_COMPLAINTS" | "SEARCH_OFFICER" | "SYSTEM_STATS" | "GENERAL",
      "criteria": {
        "status": string | null,
        "priority": "Low" | "Medium" | "High" | "Critical" | null,
        "category": string | null,
        "entityId": string | null,
        "entityName": string | null
      }
    }`;

    let intent = { intent: 'GENERAL', criteria: {} };
    try {
      const intentResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.1-8b-instant',
        response_format: { type: "json_object" },
        messages: [{ role: 'system', content: intentPrompt }],
        temperature: 0
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      });
      intent = JSON.parse(intentResponse.data.choices[0].message.content);
    } catch (e) {
      console.error("Intent extraction failed:", e.message);
    }

    // 2. DATA FETCHING LAYER
    let systemData = "No specific data requested.";
    let dataFound = false;

    // Auto-detect COMP- patterns regardless of intent
    const manualMatch = message.match(/COMP-[0-9]+/i);
    let targetId = (intent.criteria?.entityId && intent.criteria.entityId !== 'null') ? intent.criteria.entityId : (manualMatch?.[0]);

    if (targetId && !targetId.startsWith('COMP-') && !targetId.match(/^[0-9a-fA-F]{24}$/) && targetId.match(/^[0-9]+$/)) {
      targetId = `COMP-${targetId}`;
    }
    if (targetId) targetId = String(targetId).split(' ')[0].trim();

    if (intent.intent === 'GET_COMPLAINT_DETAILS' || targetId) {
      if (targetId) {
        const queryId = String(targetId).toUpperCase();
        const complaint = await Complaint.findOne({
          $or: [{ complaintId: queryId }, { _id: queryId.length === 24 ? queryId : null }]
        })
          .populate('assignedOfficerUserId', 'name rank')
          .populate('assignedDepartmentId', 'name');

        if (complaint) {
          dataFound = true;
          systemData = `LIVE DOSSIER ${complaint.complaintId}: Status is ${complaint.status}, Priority ${complaint.priority}, Category ${complaint.category}. Assigned to Officer ${complaint.assignedOfficerUserId?.name || 'Unassigned'}. Description: ${complaint.description}. FIR Summary: ${complaint.firData?.summary || 'None'}.`;
        } else {
          systemData = `SEARCH ERROR: Complaint ID "${targetId}" not found. Inform user to verify.`;
        }
      }
    } else if (intent.intent === 'SEARCH_COMPLAINTS') {
      // Dynamic search based on criteria
      let query = {};
      if (message.toLowerCase().includes('high risk') || message.toLowerCase().includes('critical') || intent.criteria?.priority === 'High' || intent.criteria?.priority === 'Critical') {
        query.priority = { $in: ['High', 'Critical'] };
      }
      if (intent.criteria?.status) query.status = intent.criteria.status;
      if (intent.criteria?.category) query.category = new RegExp(intent.criteria.category, 'i');

      const results = await Complaint.find(query).sort({ createdAt: -1 }).limit(10).populate('assignedOfficerUserId', 'name');
      if (results.length > 0) {
        dataFound = true;
        systemData = `SEARCH RESULTS (${results.length} cases):
            ${results.map(c => `- ${c.complaintId}: ${c.category} (Risk: ${c.priority}, Status: ${c.status}) - Assigned: ${c.assignedOfficerUserId?.name || 'Unassigned'}`).join('\n')}`;
      } else {
        systemData = `SEARCH NOTIFICATION: No complaints matching those criteria are currently registered in the database.`;
      }
    } else if (intent.intent === 'LIST_MY_COMPLAINTS' && user) {
      const myComplaints = await Complaint.find({ citizenUserId: user._id }).sort({ createdAt: -1 }).limit(10);
      if (myComplaints.length > 0) {
        dataFound = true;
        systemData = `YOUR RECENT COMPLAINTS (${user.name}):\n${myComplaints.map(c => `- ${c.complaintId}: ${c.status}`).join('\n')}`;
      } else {
        systemData = `You have not filed any complaints yet.`;
      }
    } else if (intent.intent === 'SYSTEM_STATS') {
      const stats = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
      const totalCount = await Complaint.countDocuments();
      const highRiskCount = await Complaint.countDocuments({ priority: { $in: ['High', 'Critical'] } });
      dataFound = true;
      systemData = `SYSTEM ANALYTICS: Total ${totalCount} cases, High-Risk cases: ${highRiskCount}. Distribution: ${stats.map(s => `${s._id}: ${s.count}`).join(', ')}`;
    } else if (intent.intent === 'SEARCH_OFFICER') {
      const namePattern = intent.criteria?.entityName || message.replace(/officer/gi, '').trim();
      const officers = await User.find({ role: 'OFFICER', name: new RegExp(namePattern, 'i') }).limit(3);
      if (officers.length > 0) {
        dataFound = true;
        systemData = `OFFICERS FOUND: ${officers.map(o => `${o.name} (${o.rank})`).join(', ')}`;
      } else {
        systemData = `No active officer found matching that name.`;
      }
    } else {
      const stats = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
      systemData = `Platform State: ${stats.map(s => `${s._id}: ${s.count}`).join(', ') || 'Ready.'}`;
    }

    // 3. RESPONSE GENERATION LAYER
    const finalSystemPrompt = `You are Antaravati AI, the official AI assistant for Anantapur district government services. You speak English, Telugu, and Hindi fluently. You help citizens with government services, complaints, certificates, welfare schemes, and police FIR filing.
    
    PERSONALITY:
    - Friendly, patient, simple language always
    - Never use technical jargon
    - Always respond in the same language the user writes in
    - Telugu లో రాస్తే Telugu లో reply చేయి
    - Hindi లో రాస్తే Hindi లో reply చేయి
    - English లో రాస్తే English లో reply చేయి

    CAPABILITIES & DATA OVERVIEW:
    - You HAVE direct system database access.
    
    SYSTEM INTELLIGENCE DATA FOR CURRENT REQUEST:
    ${systemData}

    [DATA_VERIFIED: ${dataFound}]

    RULES:
    1. Answer queries directly using the SYSTEM INTELLIGENCE above.
    2. Tell the user their status simply if it's an FIR/Complaint query. Explain the current status stage nicely.
    3. Never make up information. If you do not know say I will check and get back to you.
    4. Always offer to help with something else after answering. Keep answers under 5 lines unless user asks for more detail.
    5. Always end with a helpful follow up question.

    User Persona: ${user ? user.name : 'Citizen'}`;

    const chatResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: finalSystemPrompt },
        ...(history || []).map(h => ({ role: h.role, content: String(h.content) })),
        { role: 'user', content: message }
      ],
      temperature: 0.3
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });

    res.json({ reply: chatResponse.data.choices[0].message.content });

  } catch (error) {
    console.error("Central AI Error:", error.message);
    res.status(500).json({ reply: "Connection to central intelligence interrupted. Please attempt later." });
  }
};

/**
 * Sequential Voice FIR Conversation Controller
 * Handles naming, phone, location, crime type, etc.
 * Uses a stateless history approach to determine the next question.
 */
const handleVoiceFIRConversation = async (req, res) => {
  const { message, history = [], lang = 'en' } = req.body;

  try {
    const systemPrompt = `You are an Antaravati Police Officer helping a citizen file an FIR. 
    You are calm, professional, and empathetic. 
    Your goal is to collect the following 6 details one-by-one:
    1. Name
    2. Phone Number
    3. Location of incident
    4. Type of Incident (Theft, Attack, Accient, etc.)
    5. Date & Time
    6. Detailed Description

    IMPORTANT RULES:
    - Respond strictly in the lang: ${lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English'}.
    - Ask only ONE question at a time.
    - If user provides partial info, acknowledge it and ask for the next.
    - If a detail is missing, prioritize asking for it.
    - If ALL details are collected, summarize them and say "The FIR draft is ready. Please confirm to submit."
    - Use simple, spoken tone suitable for voice output. No jargon.
    - In Telugu, respond with "నమస్కారం! మాకు ఒక ఫిర్యాదు నమోదు చేయడంలో మీకు సహాయపడతాను" initially.
    - Detection context from user: "${message}"`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
      temperature: 0.5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Voice FIR Assistant Error:", error.message);
    res.status(500).json({ reply: "Connection to Voice FIR system lost. Please try again." });
  }
};

module.exports = { handleChat, handleVoiceFIRConversation };
