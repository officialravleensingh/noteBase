const { encrypt, decrypt } = require('../utils/encryption');

// Encryption of Data
const encryptSensitiveFields = (data) => {
  const sensitiveFields = ['name', 'avatar'];
  const encrypted = { ...data };
  
  sensitiveFields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encrypt(encrypted[field]);
    }
  });
  
  return encrypted;
};

// Decryption of Data
const decryptSensitiveFields = (data) => {
  if (!data) return data;
  
  const sensitiveFields = ['name', 'avatar'];
  const decrypted = { ...data };
  
  sensitiveFields.forEach(field => {
    if (decrypted[field]) {
      decrypted[field] = decrypt(decrypted[field]);
    }
  });
  
  return decrypted;
};

// For arrays of data
const decryptUserArray = (users) => {
  if (!Array.isArray(users)) return users;
  return users.map(user => decryptSensitiveFields(user));
};

module.exports = {
  encryptSensitiveFields,
  decryptSensitiveFields,
  decryptUserArray
};