const axios = require('axios');
const { prisma } = require('../db/database');
const { generateTokenPair } = require('../utils/jwt');

const googleAuth = (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      console.error('Missing OAuth environment variables');
      return res.status(500).json({ error: 'OAuth not configured' });
    }
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('OAuth redirect URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth' });
  }
};

const googleCallback = async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('OAuth authorization error:', error);
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=oauth_denied`);
    }

    if (!code) {
      console.error('OAuth callback: No authorization code provided');
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=no_code`);
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      console.error('OAuth: Missing required environment variables');
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=config_error`);
    }

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
    params.append('grant_type', 'authorization_code');

    let tokenResponse;
    try {
      tokenResponse = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      });
    } catch (tokenError) {
      console.error('OAuth token exchange error:');
      console.error('Status:', tokenError.response?.status);
      console.error('Data:', tokenError.response?.data);
      console.error('Message:', tokenError.message);
      console.error('Config:', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        code: code.substring(0, 20) + '...'
      });
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
    }

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      console.error('OAuth: No access token received from Google');
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=no_access_token`);
    }

    let userInfoResponse;
    try {
      userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 10000
      });
    } catch (userInfoError) {
      console.error('OAuth user info error:', userInfoError.response?.data || userInfoError.message);
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=user_info_failed`);
    }

    const { email, name, picture } = userInfoResponse.data;

    if (!email) {
      console.error('OAuth: No email provided by Google');
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=no_email`);
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            password: '',
            name: name || email.split('@')[0],
            avatar: picture || null,
            lastLogin: new Date()
          }
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            ...(picture && { avatar: picture }),
            ...(name && !user.name && { name })
          }
        });
      }
    } catch (dbError) {
      console.error('OAuth database error:', dbError);
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=database_error`);
    }

    let tokens;
    try {
      tokens = generateTokenPair(user.id);
    } catch (tokenError) {
      console.error('OAuth token generation error:', tokenError);
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/login?error=token_generation_failed`);
    }

    const frontendUrl = process.env.FRONTEND_URL;
    const tokenData = encodeURIComponent(JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: picture
      }
    }));
    
    res.redirect(`${frontendUrl}/auth/google/callback?tokens=${tokenData}`);

  } catch (error) {
    console.error('OAuth callback unexpected error:', error);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/login?error=unexpected_error`);
  }
};

module.exports = { googleAuth, googleCallback };