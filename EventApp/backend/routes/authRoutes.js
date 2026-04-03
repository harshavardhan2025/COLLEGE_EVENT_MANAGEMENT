const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register, login, getMe, updateProfile, forgotPassword, resetPassword,
} = require('../controllers/authController');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, forgotPassword);

router.post('/reset-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword').notEmpty().withMessage('New password is required'),
], validate, resetPassword);

module.exports = router;
