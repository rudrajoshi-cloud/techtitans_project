import { GoogleGenerativeAI } from '@google/generative-ai';
import SafetyReport from '../models/SafetyReport.js';

export const handleChat = async (req, res) => {
    try {
        const { message, history = [], location = null } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY in environment variables.");
            return res.status(500).json({ error: 'AI Assistant is currently unavailable. Contact developer.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build context for the AI
        let systemContext = `You are a highly helpful and concise highly-trained Personal Safety Assistant for the 'SafeRoute' application. You help users navigate safely in India. You proactively warn them about danger, offer safe routing advice, and analyze specific neighborhoods if asked. Your identity is 'SafeRoute AI Assistant'.
`;

        if (location && location.lat && location.lng) {
            systemContext += `\n[INTERNAL CONTEXT - THE USER'S CURRENT POSITION IS: Latitude ${location.lat}, Longitude ${location.lng}]. Do not share these raw coordinates. Use them if they ask about 'nearby' or 'my area'.`;
            
            // Fetch nearby community danger reports (within ~5km)
            try {
                // simple box approximation (roughly 5km)
                const margin = 0.05;
                const reports = await SafetyReport.find({
                    latitude: { $gte: location.lat - margin, $lte: location.lat + margin },
                    longitude: { $gte: location.lng - margin, $lte: location.lng + margin }
                }).limit(10).lean();

                if (reports.length > 0) {
                    systemContext += `\n[INTERNAL CONTEXT - COMMUNITY ALERTS IN USER'S AREA: `;
                    reports.forEach(r => {
                        systemContext += `(${r.category} reported recently), `;
                    });
                    systemContext += `] Warn the user about these specific problems if they ask about safety nearby.`;
                } else {
                    systemContext += `\n[INTERNAL CONTEXT - NO COMMUNITY DANGER ALERTS IN IMMEDIATE VICINITY.]`;
                }
            } catch (err) {
                console.warn("Failed to retrieve nearby reports for LLM context", err);
            }
        }

        // We construct a simple prompt string for the AI combining context, history, and the new message 
        // since passing raw history arrays requires exact formatting based on SDK version
        let fullPrompt = `${systemContext}\n\n`;
        if(history.length > 0) {
             fullPrompt += `--- Conversation History ---\n`;
             history.slice(-4).forEach(turn => {
                  fullPrompt += `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}\n`;
             });
             fullPrompt += `----------------------------\n`;
        }
        fullPrompt += `\nUser's current message: "${message}"\nYour helpful, safe, and precise reply:`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
             return res.json({ reply: text });
        } else {
             throw new Error("Invalid response format from Gemini");
        }

    } catch (error) {
        console.error("AI Chat Assistant Error:", error);
        res.status(500).json({ error: error.message || 'Error processing your message' });
    }
};
