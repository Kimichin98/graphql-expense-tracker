const crypto = require('crypto');


const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const setTokenExpiration = () => {
  return Date.now() + 3600000; // 1 hour from now
};

const updateLastLogin = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      lastLogin: Date.now(),
      loginAttempts: 0 // Reset login attempts on successful login
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

const handleFailedLogin = async (user) => {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  if (user.lockUntil && user.lockUntil < Date.now()) {
    return await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !user.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return await User.findByIdAndUpdate(user._id, updates);
};

module.exports = {
  generateToken,
  setTokenExpiration,
  updateLastLogin,
  handleFailedLogin
};