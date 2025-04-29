require('dotenv').config(); // At the top of the file

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendSMS = async (req, res) => {
  const { to, message } = req.body;

  try {
    const sms = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: to,
    });

    res.status(200).json({ success: true, sid: sms.sid, message: 'SMS sent successfully!' });
  } catch (error) {
    console.error('SMS sending failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send SMS' });
  }
};

const sendWhatsApp = async (req, res) => {
  const { to, message } = req.body;

  try {
    // Format WhatsApp numbers with "whatsapp:" prefix
    const whatsappMessage = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${to}`
    });

    res.status(200).json({ 
      success: true, 
      sid: whatsappMessage.sid, 
      message: 'WhatsApp message sent successfully!' 
    });
  } catch (error) {
    console.error('WhatsApp message sending failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send WhatsApp message',
      error: error.message 
    });
  }
};

module.exports = { sendSMS, sendWhatsApp };
