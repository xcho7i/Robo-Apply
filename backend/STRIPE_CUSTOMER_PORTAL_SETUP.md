# Stripe Customer Portal Setup Guide

## Issue
You're getting this error when trying to create a Customer Portal session:
```
"No configuration provided and your test mode default configuration has not been created. Provide a configuration or create your default by saving your customer portal settings in test mode at https://dashboard.stripe.com/test/settings/billing/portal."
```

## Solution

### Option 1: Set Up Stripe Customer Portal Configuration (Recommended)

1. **Go to Stripe Dashboard**
   - Navigate to: https://dashboard.stripe.com/test/settings/billing/portal
   - (For production, use: https://dashboard.stripe.com/settings/billing/portal)

2. **Configure Customer Portal Settings**
   - **Business Information**: Add your business name and support email
   - **Features**: Enable the features you want customers to access:
     - ✅ **Payment methods** (Required for payment updates)
     - ✅ **Billing history** (Optional)
     - ✅ **Invoices** (Optional)
     - ✅ **Subscription management** (Optional)
   - **Branding**: Customize colors and logo (optional)
   - **Terms of Service & Privacy Policy**: Add your URLs (optional)

3. **Save Configuration**
   - Click "Save configuration" at the bottom
   - This creates the default configuration for your account

4. **Test the Configuration**
   - The Customer Portal endpoint should now work
   - Test with: `POST /api/subscription/create-customer-portal-session`
   - Or use the direct URL: `GET /api/subscription/get-direct-customer-portal-url`

### Option 2: Use Direct Customer Portal URL (Simplest)

Since you've already configured the Customer Portal in your dashboard, you can use the direct URL approach:

**Endpoint:** `GET /api/subscription/get-direct-customer-portal-url`

This uses your configured portal URL: `https://billing.stripe.com/p/login/test_3cI14pd3Ldodct57Ta8g000` with the customer parameter.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/subscription/get-direct-customer-portal-url" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "portalUrl": "https://billing.stripe.com/p/login/test_3cI14pd3Ldodct57Ta8g000?customer=cus_...",
  "msg": "Direct customer portal URL generated successfully"
}
```

### Option 3: Use Direct Payment Method Update (Alternative)

If you prefer a more focused payment method update experience:

**Endpoint:** `POST /api/subscription/create-payment-method-update-session`

This creates a Stripe Checkout session specifically for updating payment methods.

## Updated Error Handling

The Customer Portal endpoint now provides helpful error messages:

```json
{
  "success": false,
  "msg": "Customer portal not configured. Please use the direct payment method update instead.",
  "error": "No configuration provided...",
  "alternativeEndpoint": "/api/subscription/create-payment-method-update-session"
}
```

## Frontend Implementation with Fallback

```javascript
async function updatePaymentMethod() {
  try {
    // Try Customer Portal first
    const response = await fetch('/api/subscription/create-customer-portal-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Customer Portal is configured, redirect to portal
      window.location.href = data.portalUrl;
    } else if (data.alternativeEndpoint) {
      // Customer Portal not configured, use alternative
      console.log('Customer Portal not configured, using direct payment update');
      await useDirectPaymentUpdate();
    } else {
      showError(data.msg);
    }
  } catch (error) {
    showError('Failed to create payment update session');
  }
}

async function useDirectPaymentUpdate() {
  try {
    const response = await fetch('/api/subscription/create-payment-method-update-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      window.location.href = data.checkoutUrl;
    } else {
      showError(data.msg);
    }
  } catch (error) {
    showError('Failed to create payment method update session');
  }
}
```

## Customer Portal Configuration Details

### Required Features for Payment Updates
- **Payment methods**: Allow customers to add, update, and remove payment methods
- **Business information**: Support email for customer inquiries

### Optional Features
- **Billing history**: Let customers view past invoices
- **Invoices**: Allow customers to download PDF invoices
- **Subscription management**: Let customers cancel or modify subscriptions
- **Branding**: Custom colors and logo for brand consistency

### Security Considerations
- Customer Portal sessions are secure and PCI compliant
- Sessions expire after 24 hours
- Customers can only access their own billing information
- All payment data is handled by Stripe

## Testing

### Test Mode Configuration
1. Set up configuration in test mode first: https://dashboard.stripe.com/test/settings/billing/portal
2. Test with test customers and test payment methods
3. Verify all features work as expected

### Production Configuration
1. Set up configuration in live mode: https://dashboard.stripe.com/settings/billing/portal
2. Use the same settings as test mode
3. Test with real customers (small amounts)

## Troubleshooting

### Common Issues
1. **"No configuration provided"**: Set up Customer Portal configuration in Stripe Dashboard
2. **"Customer not found"**: Ensure user has a valid `stripeCustomerId`
3. **"Portal session expired"**: Sessions expire after 24 hours, create a new one

### Debug Steps
1. Check Stripe Dashboard for configuration status
2. Verify customer exists in Stripe
3. Check API keys are correct (test vs live)
4. Review error logs for specific error messages

## Recommendation

**For immediate use**: Use the direct payment method update endpoint (`/api/subscription/create-payment-method-update-session`) as it doesn't require Customer Portal configuration.

**For long-term**: Set up Customer Portal configuration for a better user experience with full billing management capabilities.
