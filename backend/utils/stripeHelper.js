const { decryptStripeKey } = require('./encryption');

/**
 * Get the decrypted Stripe secret key
 * Handles both encrypted and plain text keys for backward compatibility
 * @returns {string} Decrypted Stripe secret key
 */
function getStripeSecretKey() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  // Check if the key is encrypted (contains colons indicating our encryption format)
  if (stripeKey.includes(':') && stripeKey.split(':').length === 3) {
    try {
      // Key is encrypted, decrypt it
      return decryptStripeKey(stripeKey);
    } catch (error) {
      throw new Error(`Failed to decrypt STRIPE_SECRET_KEY: ${error.message}`);
    }
  } else if (stripeKey.startsWith('sk_')) {
    // Key is in plain text (backward compatibility)
    console.warn('WARNING: STRIPE_SECRET_KEY is stored in plain text. Consider encrypting it for better security.');
    return stripeKey;
  } else {
    throw new Error('STRIPE_SECRET_KEY format is invalid. Must be either a valid Stripe key or encrypted format.');
  }
}

/**
 * Initialize Stripe with the decrypted secret key
 * @returns {object} Stripe instance
 */
function initializeStripe() {
  const stripe = require('stripe');
  const secretKey = getStripeSecretKey();
  return stripe(secretKey);
}

module.exports = {
  getStripeSecretKey,
  initializeStripe
};
