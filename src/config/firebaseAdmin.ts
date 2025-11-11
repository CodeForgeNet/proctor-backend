import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs'; // Import the fs module
import path from 'path'; // Import path module
import type { Auth } from 'firebase-admin/auth'; // Import the Auth type

console.log('Admin object after import:', admin); // Add this line

dotenv.config();

let firebaseAuth: Auth; // Declare a variable to hold the Auth instance

// Check if Firebase Admin SDK is already initialized
if (!admin.default.apps.length) { // Changed admin.apps to admin.default.apps
  try {
    console.log('Attempting to initialize Firebase Admin SDK...');
    console.log('Environment variables loaded:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ? 'FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set' : 'FIREBASE_SERVICE_ACCOUNT_KEY_PATH is NOT set');

    // Use environment variable for service account key path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

    if (!serviceAccountPath) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set. Please ensure your .env file has this variable pointing to your Firebase service account key JSON file.');
    }

    // Resolve the absolute path to the service account key file
    const absoluteServiceAccountPath = path.resolve(serviceAccountPath);
    console.log('Attempting to load Firebase service account key from:', absoluteServiceAccountPath);

    if (!fs.existsSync(absoluteServiceAccountPath)) {
      throw new Error(`Firebase service account key file not found at: ${absoluteServiceAccountPath}. Please check the path in your .env file.`);
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(fs.readFileSync(absoluteServiceAccountPath, 'utf8'));
    } catch (parseError: any) {
      throw new Error(`Error parsing Firebase service account key JSON file at ${absoluteServiceAccountPath}: ${parseError.message}`);
    }
    
    admin.default.initializeApp({ // Changed admin.initializeApp to admin.default.initializeApp
      credential: admin.default.credential.cert(serviceAccount), // Changed admin.credential to admin.default.credential
    });
    console.log('Firebase Admin SDK initialized successfully.');
    firebaseAuth = admin.default.auth(); // Changed admin.auth to admin.default.auth
  } catch (error: any) {
    console.error('FATAL ERROR during Firebase Admin SDK initialization:', error.message);
    // Log the full error object for more details if available
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1); // Exit the process if Firebase Admin SDK fails to initialize
  }
} else {
  firebaseAuth = admin.default.auth(); // If already initialized, get the Auth instance // Changed admin.auth to admin.default.auth
}

export const auth = firebaseAuth; // Export the typed Auth instance
