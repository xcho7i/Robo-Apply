# Stripe Secret Key Encryption Guide

This guide explains how to securely encrypt your Stripe secret key before storing it in your environment variables, adding an extra layer of security to your application.

## 🔐 Overview

Instead of storing your Stripe secret key in plain text in your `.env` file, this system:
- Encrypts the key using AES-256-GCM encryption
- Stores the encrypted key in your environment variables
- Automatically decrypts the key when your application needs it
- Provides backward compatibility with plain text keys

## 🚀 Quick Setup

### Step 1: Generate Master Encryption Key

```bash
node scripts/encryptStripeKey.js --generate-key
```

This will output something like:
```
🔑 Generating new master encryption key...

✅ Master encryption key generated successfully!
📋 Add this to your .env file:

ENCRYPTION_MASTER_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

⚠️  IMPORTANT: Keep this key secure and never commit it to version control!
```

### Step 2: Add Master Key to Environment

Add the generated key to your `.env` file:
```env
ENCRYPTION_MASTER_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Step 3: Encrypt Your Stripe Key

```bash
node scripts/encryptStripeKey.js --encrypt sk_test_your_actual_stripe_key_here
```

This will output:
```
🔐 Encrypting Stripe secret key...

✅ Stripe secret key encrypted successfully!
📋 Replace STRIPE_SECRET_KEY in your .env file with:

STRIPE_SECRET_KEY=iv_base64:auth_tag_base64:encrypted_data_base64
```

### Step 4: Update Your Environment File

Replace your plain text Stripe key with the encrypted version:
```env
# Before (plain text - not secure)
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_key_here

# After (encrypted - secure)
STRIPE_SECRET_KEY=iv_base64:auth_tag_base64:encrypted_data_base64
ENCRYPTION_MASTER_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Step 5: Verify Setup

Test that decryption works:
```bash
node scripts/encryptStripeKey.js --decrypt "iv_base64:auth_tag_base64:encrypted_data_base64"
```

## 📋 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ENCRYPTION_MASTER_KEY` | 64-character hex string for encryption | Yes | `a1b2c3d4e5f6...` |
| `STRIPE_SECRET_KEY` | Encrypted Stripe secret key | Yes | `iv:tag:data` |

## 🛠 Available Commands

### Generate Master Key
```bash
node scripts/encryptStripeKey.js --generate-key
```

### Encrypt Stripe Key
```bash
node scripts/encryptStripeKey.js --encrypt sk_test_your_key
```

### Test Decryption
```bash
node scripts/encryptStripeKey.js --decrypt encrypted_key_here
```

### Help
```bash
node scripts/encryptStripeKey.js --help
```

## 🔧 How It Works

### Encryption Process
1. **Master Key**: A 32-byte (256-bit) random key used for encryption
2. **Algorithm**: AES-256-GCM for authenticated encryption
3. **Format**: `iv:authTag:encryptedData` (all base64 encoded)
4. **Security**: Each encryption uses a unique IV and includes authentication

### Decryption Process
1. Application reads `STRIPE_SECRET_KEY` from environment
2. Detects if key is encrypted (contains colons)
3. If encrypted, automatically decrypts using `ENCRYPTION_MASTER_KEY`
4. Returns decrypted key to Stripe SDK

## 🔄 Backward Compatibility

The system supports both encrypted and plain text keys:
- **Encrypted keys**: Automatically detected and decrypted
- **Plain text keys**: Used directly with a warning message
- **Migration**: You can migrate from plain text to encrypted anytime

## 🏗 Code Architecture

### Files Created/Modified

1. **`utils/encryption.js`** - Core encryption/decryption utilities
2. **`utils/stripeHelper.js`** - Stripe-specific helper functions
3. **`scripts/encryptStripeKey.js`** - CLI tool for key management
4. **Updated controllers** - All Stripe usage now uses encrypted keys

### Usage in Code

```javascript
// Instead of:
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Now use:
const { initializeStripe } = require("../utils/stripeHelper");
const stripe = initializeStripe();
```

## 🔒 Security Best Practices

### Master Key Security
- **Never commit** `ENCRYPTION_MASTER_KEY` to version control
- **Rotate regularly** in production environments
- **Use key management** services (AWS KMS, Azure Key Vault) for production
- **Separate environments** use different master keys

### Environment Setup
- Use different master keys for development, staging, and production
- Store master keys in secure key management services
- Implement key rotation procedures
- Monitor key access and usage

### Production Deployment
```bash
# Generate production master key
PROD_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Store in your key management service
aws ssm put-parameter --name "/app/encryption/master-key" --value "$PROD_KEY" --type "SecureString"

# Use in your deployment
export ENCRYPTION_MASTER_KEY=$(aws ssm get-parameter --name "/app/encryption/master-key" --with-decryption --query 'Parameter.Value' --output text)
```

## 🚨 Troubleshooting

### Common Issues

**Error: "ENCRYPTION_MASTER_KEY environment variable is required"**
- Solution: Generate and set the master key in your `.env` file

**Error: "ENCRYPTION_MASTER_KEY must be a 64-character hex string"**
- Solution: Ensure the master key is exactly 64 hex characters (32 bytes)

**Error: "Failed to decrypt STRIPE_SECRET_KEY"**
- Solution: Verify the encrypted key format and master key are correct

**Error: "Invalid Stripe secret key format"**
- Solution: Ensure your original key starts with `sk_`

### Validation Commands

```bash
# Check if master key is valid length
node -e "console.log('Length:', process.env.ENCRYPTION_MASTER_KEY?.length || 'Not set')"

# Test encryption/decryption cycle
node scripts/encryptStripeKey.js --encrypt sk_test_dummy_key
```

## 📚 API Reference

### EncryptionUtil Class

```javascript
const { EncryptionUtil } = require('./utils/encryption');

const encUtil = new EncryptionUtil();

// Encrypt any string
const encrypted = encUtil.encrypt('sensitive-data');

// Decrypt
const decrypted = encUtil.decrypt(encrypted);

// Stripe-specific methods
const encryptedKey = encUtil.encryptStripeKey('sk_test_...');
const originalKey = encUtil.decryptStripeKey(encryptedKey);
```

### Helper Functions

```javascript
const { 
  encrypt, 
  decrypt, 
  encryptStripeKey, 
  decryptStripeKey 
} = require('./utils/encryption');

const { 
  getStripeSecretKey, 
  initializeStripe 
} = require('./utils/stripeHelper');
```

## 🔄 Migration Steps

If you're migrating from plain text keys:

1. **Backup** your current `.env` file
2. **Generate** master encryption key
3. **Encrypt** your existing Stripe key
4. **Update** `.env` with encrypted key and master key
5. **Test** your application
6. **Deploy** with confidence

Your application will continue working during the migration process due to backward compatibility.

## 🚀 Future Enhancements

- Support for encrypting other sensitive environment variables
- Key rotation automation
- Integration with cloud key management services
- Audit logging for key access
- Multi-environment key management

---

## 📞 Support

If you encounter any issues with the encryption setup, check the troubleshooting section above or review the generated files:
- `utils/encryption.js` - Core encryption logic
- `utils/stripeHelper.js` - Stripe integration
- `scripts/encryptStripeKey.js` - Management CLI
