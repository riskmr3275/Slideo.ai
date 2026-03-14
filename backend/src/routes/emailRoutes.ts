import { Router } from 'express';
import {
  testEmail,
  sendWelcome,
  sendOTP,
  sendPasswordReset,
  sendPresentationShared,
  sendAccountDeleted,
} from '../controllers/emailController';

const router = Router();

/** Dev utility — send a raw test email */
router.post('/test', testEmail);

/** Send a welcome email (called internally on signup) */
router.post('/send-welcome', sendWelcome);

/** Send an OTP / verification code */
router.post('/send-otp', sendOTP);

/** Send a password-reset link */
router.post('/send-password-reset', sendPasswordReset);

/** Notify a recipient that a presentation was shared */
router.post('/send-presentation-shared', sendPresentationShared);

/** Confirm account deletion */
router.post('/send-account-deleted', sendAccountDeleted);

export default router;
