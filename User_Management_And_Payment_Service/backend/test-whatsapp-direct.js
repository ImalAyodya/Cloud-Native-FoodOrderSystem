require('dotenv').config();
const twilio = require('twilio');

// You'll need to add these to your User Management Service .env
// or copy them from the Order Management Service .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Replace this with a valid phone number for testing
const testPhoneNumber = '94764335055'; // Without '+' for clearer formatting

async function testTwilioWhatsApp() {
  try {
    console.log('Testing Twilio WhatsApp directly with:');
    console.log(`Account SID: ${accountSid ? accountSid.substring(0, 8) + '...' : 'MISSING'}`);
    console.log(`From WhatsApp: ${twilioWhatsAppNumber}`);
    console.log(`To WhatsApp: +${testPhoneNumber}`);
    
    const message = await client.messages.create({
      body: 'This is a test WhatsApp message from DigiDine',
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:+${testPhoneNumber}`
    });
    
    console.log('WhatsApp test message sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Message Status:', message.status);
  } catch (error) {
    console.error('Twilio WhatsApp test failed:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    // More detailed troubleshooting
    if (error.moreInfo) {
      console.error('More info:', error.moreInfo);
    }
  }
}

testTwilioWhatsApp();