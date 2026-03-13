import User from '../models/User.js';
import twilio from 'twilio';

export const sendSOS = async (req, res) => {
  try {
    // Initialize Twilio client dynamically to ensure environment variables are loaded
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contacts = user.emergency_contacts || [];
    
    if (contacts.length === 0) {
       return res.status(400).json({ error: 'No emergency contacts strictly defined for this user to text.' });
    }

    // Try to get dynamic lat/long from the request body if frontend sends it
    // otherwise fallback to a generic message
    const lat = req.body.latitude || "Unknown";
    const lng = req.body.longitude || "Unknown";
    const googleMapLink = lat !== "Unknown" ? `https://www.google.com/maps?q=${lat},${lng}` : "Location unavailable";

    const messageTemplate = `🚨 SOS ALERT 🚨\n\n${user.name} has triggered an emergency alert and listed you as a contact!\n\nThey need immediate assistance.\n\n📍 View Location: ${googleMapLink}`;

    console.log(`[SOS DISPATCHED] Alerting ${contacts.length} emergency contacts for user: ${user.name}`);
    
    const sendPromises = contacts.map(contact => {
       // Format phone number to E.164 and attach whatsapp: prefix
       // Assuming India locale +91 for now if standard 10 digit
       let formattedPhone = contact.phone.toString().trim();
       if (formattedPhone.length === 10) formattedPhone = `+91${formattedPhone}`;
       if (!formattedPhone.startsWith('+')) formattedPhone = `+${formattedPhone}`;

       console.log(`[TWILIO] -> Texting WhatsApp ${contact.name} at whatsapp:${formattedPhone}`);
       
       return client.messages.create({
           body: messageTemplate,
           from: process.env.TWILIO_WHATSAPP_NUMBER,
           to: `whatsapp:${formattedPhone}`
       });
    });

    const receipts = await Promise.allSettled(sendPromises);
    
    const successCount = receipts.filter(r => r.status === 'fulfilled').length;
    const fails = receipts.filter(r => r.status === 'rejected');
    const failCount = fails.length;
    
    const failReasons = fails.map(r => r.reason?.message || String(r.reason)).join(' | ');

    if (failCount > 0 && successCount === 0) {
       // Everything failed. Surface the Twilio error to the user.
       return res.status(400).json({ error: `Twilio blocked the dispatch: ${failReasons}` });
    }

    res.json({ 
       message: `SOS Dispatched successfully on WhatsApp! Delivered to ${successCount} contacts. (${failCount} failed)`,
       details: failReasons ? `Errors: ${failReasons}` : undefined,
       receipts
    });
  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ error: error.message || 'Failed to dispatch SOS via Twilio' });
  }
};