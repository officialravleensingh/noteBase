const express = require('express');
const { body } = require('express-validator');
const { signup, login } = require('../controllers/authController');

const app = express();

const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

app.post('/signup', signupValidation, signup);
app.post('/login', loginValidation, login);

module.exports = app;