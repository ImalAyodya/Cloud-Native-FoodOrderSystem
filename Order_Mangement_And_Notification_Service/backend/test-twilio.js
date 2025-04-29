require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Replace this with a valid phone number for testing
const testPhoneNumber = '+94764335055'; 

async function testTwilio() {
  try {
    console.log('Testing Twilio SMS with:');
    console.log(`Account SID: ${accountSid.substring(0, 8)}...`);
    console.log(`From: ${twilioNumber}`);
    console.log(`To: ${testPhoneNumber}`);
    
    const message = await client.messages.create({
      body: 'This is a test message from DigiDine',
      from: twilioNumber,
      to: testPhoneNumber,
    });
    
    console.log('Test message sent successfully!');
    console.log('Message SID:', message.sid);
  } catch (error) {
    console.error('Twilio test failed:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testTwilio();