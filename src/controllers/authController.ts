import type { Request, Response } from 'express';
import { auth } from '../config/firebaseAdmin.js';

export const setCustomUserClaims = async (req: Request, res: Response) => {
  const { role } = req.body; // Expecting 'candidate' or 'interviewer'
  const uid = req.user?.uid; // uid is available from authenticateToken middleware

  if (!uid) {
    return res.status(400).json({ message: 'User ID not found in request.' });
  }

  if (!role || (role !== 'candidate' && role !== 'interviewer')) {
    return res.status(400).json({ message: 'Invalid role provided. Must be "candidate" or "interviewer".' });
  }

  try {
    // Set custom user claims
    await auth.setCustomUserClaims(uid, { role });

    // Optionally, verify the claims were set
    const userRecord = await auth.getUser(uid);
    console.log(`Custom claims set for user ${uid}:`, userRecord.customClaims);

    res.status(200).json({ message: 'Custom claims (role) set successfully.', role });
  } catch (error) {
    console.error('Error setting custom user claims:', error);
    res.status(500).json({ message: 'Failed to set custom user claims.' });
  }
};
