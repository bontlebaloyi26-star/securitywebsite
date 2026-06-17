const sendgrid = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bontlebaloyi26@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@morabasolutions.co.za';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  const { service, name, phone, email, message } = req.body;

  if (!service || !name || !phone || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please complete all fields before submitting.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  sendgrid.setApiKey(SENDGRID_API_KEY);

  try {
    await sendgrid.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      replyTo: email,
      subject: `New quote request from ${name}`,
      text: `New quote request received:\n\nService: ${service}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage:\n${message}`,
      html: `<p>New quote request received:</p><ul><li><strong>Service:</strong> ${service}</li><li><strong>Name:</strong> ${name}</li><li><strong>Phone:</strong> ${phone}</li><li><strong>Email:</strong> ${email}</li></ul><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    });
  } catch (error) {
    console.error('SendGrid error:', error?.response?.body ?? error);
    return res.status(500).json({ success: false, message: 'There was a problem sending the email notification. Please try again later.' });
  }

  return res.status(200).json({ success: true, message: 'Thank you! Your quote request was received and email notification has been sent.' });
};
