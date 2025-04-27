require('dotenv').config(); // At the top of the file

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

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

module.exports = { sendSMS };
