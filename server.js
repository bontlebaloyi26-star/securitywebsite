require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const sendgrid = require('@sendgrid/mail');

const app = express();
const PORT = 8000;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bontlebaloyi26@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@morabasolutions.co.za';

if (!SENDGRID_API_KEY) {
  console.error('Missing SENDGRID_API_KEY. Set it in your environment or .env file.');
  process.exit(1);
}

sendgrid.setApiKey(SENDGRID_API_KEY);

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Quote submission endpoint
app.post('/submit_quote.php', async (req, res) => {
  const { service, name, phone, email, message } = req.body;

  // Validation
  if (!service || !name || !phone || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all fields before submitting.'
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  const entry = `${timestamp} | Service: ${service} | Name: ${name} | Phone: ${phone} | Email: ${email} | Message: ${message.replace(/[\r\n]/g, ' ')}\n`;
  fs.appendFileSync(path.join(__dirname, 'quote-requests.txt'), entry, 'utf8');

  const emailText = `New quote request received:\n\nService: ${service}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage:\n${message}`;

  try {
    await sendgrid.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      replyTo: email,
      subject: `New quote request from ${name}`,
      text: emailText,
      html: `<p>New quote request received:</p><ul><li><strong>Service:</strong> ${service}</li><li><strong>Name:</strong> ${name}</li><li><strong>Phone:</strong> ${phone}</li><li><strong>Email:</strong> ${email}</li></ul><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
    });
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response && error.response.body) {
      console.error('SendGrid response body:', JSON.stringify(error.response.body, null, 2));
    }
    return res.status(500).json({
      success: false,
      message: 'There was a problem sending the email notification. Please try again later.'
    });
  }

  res.json({
    success: true,
    message: 'Thank you! Your quote request was received and email notification has been sent.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Quote requests saved to: ${path.join(__dirname, 'quote-requests.txt')}`);
});
