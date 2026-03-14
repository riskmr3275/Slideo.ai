import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login } from '../controllers/authController';
import { googleLogin } from '../controllers/googleAuthController';

const router = Router();

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').exists().withMessage('Password is required'),
  ],
  login
);

router.post('/google-login', googleLogin);

export default router;
