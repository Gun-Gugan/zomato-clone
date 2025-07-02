import express from 'express';
import { Router } from 'express';
import { sendContactEmail } from '../utils/nodemailer.js';

const router = Router();

router.post('/send', async (req, res) => {
  console.log('Received POST to /api/send with body:', req.body);
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    console.log('Validation failed: Missing fields');
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await sendContactEmail({ name, email, subject, message });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message, error.stack);
    res.status(500).json({ error: `Error sending email: ${error.message}` });
  }
});

export default router;
