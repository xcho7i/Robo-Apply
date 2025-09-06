const crypto = require('crypto');

/**
 * Encryption Utility for Sensitive Environment Variables
 * Uses AES-256-GCM encryption for secure encryption/decryption
 */

class EncryptionUtil {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this._masterKey = null; // Lazy-loaded
  }

  /**
   * Get the master encryption key from environment (lazy-loaded)
   * @returns {Buffer} Master encryption key
   */
  getMasterKey() {
    if (!this._masterKey) {
      let masterKeyEnv = process.env.ENCRYPTION_MASTER_KEY;
      
      if (!masterKeyEnv) {
        throw new Error(
          'ENCRYPTION_MASTER_KEY environment variable is required. ' +
          'Generate one using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
      }

      // Remove quotes if present
      masterKeyEnv = masterKeyEnv.replace(/^["']|["']$/g, '');

      // Convert hex string to buffer
      if (masterKeyEnv.length !== 64) {
        throw new Error(`ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes), got ${masterKeyEnv.length} characters`);
      }

      this._masterKey = Buffer.from(masterKeyEnv, 'hex');
    }
    
    return this._masterKey;
  }

  /**
   * Encrypt a string value
   * @param {string} plaintext - The text to encrypt
   * @returns {string} Encrypted text in format: iv:authTag:encryptedData (all base64)
   */
  encrypt(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Plaintext must be a non-empty string');
    }

    try {
      // Generate a random IV for each encryption
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.getMasterKey(), iv);
      cipher.setAAD(Buffer.from('stripe-secret', 'utf8')); // Additional authenticated data
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();
      
      // Return format: iv:authTag:encryptedData
      return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt an encrypted string
   * @param {string} encryptedData - The encrypted text in format: iv:authTag:encryptedData
   * @returns {string} Decrypted plaintext
   */
  decrypt(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Encrypted data must be a non-empty string');
    }

    try {
      // Parse the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format. Expected format: iv:authTag:encryptedData');
      }

      const [ivBase64, authTagBase64, encrypted] = parts;
      
      // Convert from base64
      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.getMasterKey(), iv);
      decipher.setAAD(Buffer.from('stripe-secret', 'utf8')); // Same AAD as encryption
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt Stripe secret key specifically
   * @param {string} stripeSecretKey - The Stripe secret key
   * @returns {string} Encrypted key
   */
  encryptStripeKey(stripeSecretKey) {
    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe secret key format');
    }
    return this.encrypt(stripeSecretKey);
  }

  /**
   * Decrypt Stripe secret key and validate format
   * @param {string} encryptedKey - The encrypted Stripe key
   * @returns {string} Decrypted Stripe secret key
   */
  decryptStripeKey(encryptedKey) {
    const decryptedKey = this.decrypt(encryptedKey);
    
    if (!decryptedKey.startsWith('sk_')) {
      throw new Error('Decrypted key is not a valid Stripe secret key');
    }
    
    return decryptedKey;
  }

  /**
   * Generate a new master encryption key
   * @returns {string} Hex-encoded 32-byte key
   */
  static generateMasterKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Create a singleton instance
const encryptionUtil = new EncryptionUtil();

module.exports = {
  EncryptionUtil,
  encrypt: (plaintext) => encryptionUtil.encrypt(plaintext),
  decrypt: (encryptedData) => encryptionUtil.decrypt(encryptedData),
  encryptStripeKey: (stripeKey) => encryptionUtil.encryptStripeKey(stripeKey),
  decryptStripeKey: (encryptedKey) => encryptionUtil.decryptStripeKey(encryptedKey),
  generateMasterKey: EncryptionUtil.generateMasterKey
};
