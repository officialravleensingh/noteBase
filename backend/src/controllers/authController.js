const { prisma } = require('../db/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateTokenPair } = require('../utils/jwt');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        lastLogin: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    const { accessToken, refreshToken } = generateTokenPair(user.id);

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    res.status(500).json({ error: `Server error : ${error}`  });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const { accessToken, refreshToken } = generateTokenPair(user.id);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: `Server error : ${error}` });
  }
};

module.exports = { signup, login };