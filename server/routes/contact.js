import express from 'express';
import { sendContactEmail } from '../utils/nodemailer.js';

const router = express.Router();

router.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await sendContactEmail({ name, email, subject, message });
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
