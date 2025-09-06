#!/usr/bin/env node

/**
 * Script to encrypt Stripe secret key for secure storage in environment variables
 * 
 * Usage:
 * 1. Generate master key: node scripts/encryptStripeKey.js --generate-key
 * 2. Encrypt Stripe key: node scripts/encryptStripeKey.js --encrypt sk_test_your_key_here
 * 3. Test decryption: node scripts/encryptStripeKey.js --decrypt encrypted_key_here
 */

const crypto = require('crypto');
const path = require('path');

// Import our encryption utility
const { generateMasterKey, encryptStripeKey, decryptStripeKey } = require('../utils/encryption');

function showUsage() {
  console.log(`
Stripe Key Encryption Utility
=============================

SETUP (First Time):
1. Generate a master encryption key:
   node scripts/encryptStripeKey.js --generate-key

2. Add the generated key to your .env file:
   ENCRYPTION_MASTER_KEY=your_generated_key_here

3. Encrypt your Stripe secret key:
   node scripts/encryptStripeKey.js --encrypt sk_test_your_stripe_key

4. Replace STRIPE_SECRET_KEY in your .env file with the encrypted value

COMMANDS:
  --generate-key           Generate a new master encryption key
  --encrypt <stripe_key>   Encrypt a Stripe secret key
  --decrypt <encrypted>    Test decrypt an encrypted key
  --help                   Show this help message

EXAMPLES:
  node scripts/encryptStripeKey.js --generate-key
  node scripts/encryptStripeKey.js --encrypt sk_test_51ABC123...
  node scripts/encryptStripeKey.js --decrypt iv:tag:data
`);
}

function generateKey() {
  console.log('🔑 Generating new master encryption key...\n');
  
  const masterKey = generateMasterKey();
  
  console.log('✅ Master encryption key generated successfully!');
  console.log('📋 Add this to your .env file:\n');
  console.log(`ENCRYPTION_MASTER_KEY=${masterKey}\n`);
  console.log('⚠️  IMPORTANT: Keep this key secure and never commit it to version control!');
  console.log('💡 Consider storing it in a secure key management service for production.');
}

function encryptKey(stripeKey) {
  if (!stripeKey) {
    console.error('❌ Error: Please provide a Stripe secret key to encrypt');
    console.log('💡 Usage: node scripts/encryptStripeKey.js --encrypt sk_test_your_key');
    process.exit(1);
  }

  if (!stripeKey.startsWith('sk_')) {
    console.error('❌ Error: Invalid Stripe secret key format. Key should start with "sk_"');
    process.exit(1);
  }

  try {
    console.log('🔐 Encrypting Stripe secret key...\n');
    
    const encryptedKey = encryptStripeKey(stripeKey);
    
    console.log('✅ Stripe secret key encrypted successfully!');
    console.log('📋 Replace STRIPE_SECRET_KEY in your .env file with:\n');
    console.log(`STRIPE_SECRET_KEY=${encryptedKey}\n`);
    console.log('✨ Your Stripe key is now securely encrypted!');
    
  } catch (error) {
    console.error('❌ Encryption failed:', error.message);
    
    if (error.message.includes('ENCRYPTION_MASTER_KEY')) {
      console.log('\n💡 First generate a master key: node scripts/encryptStripeKey.js --generate-key');
    }
    
    process.exit(1);
  }
}

function testDecrypt(encryptedKey) {
  if (!encryptedKey) {
    console.error('❌ Error: Please provide an encrypted key to decrypt');
    console.log('💡 Usage: node scripts/encryptStripeKey.js --decrypt encrypted_key_here');
    process.exit(1);
  }

  try {
    console.log('🔓 Testing decryption...\n');
    
    const decryptedKey = decryptStripeKey(encryptedKey);
    
    console.log('✅ Decryption successful!');
    console.log(`🔑 Decrypted key: ${decryptedKey.substring(0, 12)}...${decryptedKey.substring(decryptedKey.length - 4)}`);
    console.log('✨ Your encryption setup is working correctly!');
    
  } catch (error) {
    console.error('❌ Decryption failed:', error.message);
    
    if (error.message.includes('ENCRYPTION_MASTER_KEY')) {
      console.log('\n💡 Make sure ENCRYPTION_MASTER_KEY is set in your .env file');
    } else if (error.message.includes('Invalid encrypted data format')) {
      console.log('\n💡 The encrypted key format is incorrect. Expected format: iv:authTag:encryptedData');
    }
    
    process.exit(1);
  }
}

// Load environment variables FIRST
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  showUsage();
  process.exit(0);
}

// Handle commands
if (args.includes('--generate-key')) {
  generateKey();
} else if (args.includes('--encrypt')) {
  const keyIndex = args.indexOf('--encrypt') + 1;
  const stripeKey = args[keyIndex];
  encryptKey(stripeKey);
} else if (args.includes('--decrypt')) {
  const keyIndex = args.indexOf('--decrypt') + 1;
  const encryptedKey = args[keyIndex];
  testDecrypt(encryptedKey);
} else {
  console.error('❌ Unknown command. Use --help for usage information.');
  process.exit(1);
}
