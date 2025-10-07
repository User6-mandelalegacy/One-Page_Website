const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY); // Initialize Resend with your API key

app.post('/api/register', async (req, res) => {
  const data = req.body;
  try {
    const { error } = await supabase.from('registrations').insert([data]);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // Send confirmation email
try {
    console.log('Attempting to send test email...');
  const emailResult = await resend.emails.send({
    from: 'Mandela Legacy <no-reply@mandelalegacy.com>', // Must be verified in Resend
    to: data.email,
    subject: 'Welcome to Mandela Legacy! Thank You for Registering',
    html: `
      <p>Dear ${data.first_name},</p>
      <p>Thank you for registering as a Gig Worker with Mandela Legacy!</p>
      <p>We’re excited to welcome you to our community. Your commitment to shaping an honest and equitable AI future is truly valued. By joining us, you are helping ensure that artificial intelligence reflects the rich diversity and wisdom of our world.</p>
      <p><strong>What’s Next?</strong><br>
      - You’ll soon receive updates about upcoming opportunities, training sessions, and ways to contribute.</p>
      <p>We look forward to working together to build a just and inclusive AI future!</p>
      <p>Warm regards,<br>
      Mandela Legacy Team</p>
      <p>Website: <a href="https://mandelalegacy.com">https://mandelalegacy.com</a></p>e 
    `
  });
  console.log('Resend email result:', emailResult);
} catch (emailErr) {
  console.error('Resend email error:', emailErr);
}

    res.json({ success: true, message: 'Registration successful! Please check your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));