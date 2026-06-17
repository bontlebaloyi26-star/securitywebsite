const sendgrid = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bontlebaloyi26@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@morabasolutions.co.za';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ success: false, message: 'Server configuration error: missing API key.' });
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

  const adminMail = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    replyTo: email,
    subject: `New quote request from ${name}`,
    text: `New quote request received:\n\nService: ${service}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage:\n${message}`,
    html: `
      <h2>New Quote Request</h2>
      <ul>
        <li><strong>Service:</strong> ${service}</li>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Email:</strong> ${email}</li>
      </ul>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  const confirmationMail = {
    to: email,
    from: FROM_EMAIL,
    subject: 'We received your quote request – Moraba Security Solutions',
    text: `Hi ${name},\n\nThank you for reaching out to Moraba Security Solutions. We have received your quote request for "${service}" and will be in touch shortly.\n\nYour message:\n${message}\n\nRegards,\nMoraba Security Solutions`,
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for reaching out to <strong>Moraba Security Solutions</strong>. We have received your quote request for <strong>${service}</strong> and will be in touch shortly.</p>
      <p><strong>Your message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <br>
      <p>Regards,<br>Moraba Security Solutions</p>
    `,
  };

  try {
    await sendgrid.send([adminMail, confirmationMail]);
  } catch (error) {
    console.error('SendGrid error:', error?.response?.body ?? error);
    return res.status(500).json({ success: false, message: 'There was a problem sending the email. Please try again later.' });
  }

  return res.status(200).json({ success: true, message: 'Thank you! Your quote request has been received. Check your email for confirmation.' });
};
