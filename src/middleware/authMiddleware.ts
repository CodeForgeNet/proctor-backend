import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebaseAdmin.js';

// Extend the Request type to include the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string | undefined; // Allow undefined
        role?: string | undefined; // Allow undefined
        // Add other properties from Firebase DecodedIdToken as needed
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided or invalid format.' });
  }

  const idToken = authHeader.split(' ')[1];

  if (!idToken) { // Add this check
    return res.status(401).json({ message: 'Unauthorized: Token is missing.' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || undefined, // Handle undefined for email
      role: (decodedToken.role as string) || undefined, // Handle undefined for role
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: User role not found.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: User does not have the required role. Required: ${roles.join(', ')}` });
    }
    next();
  };
};
