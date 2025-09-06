# Payment Method Update Guide

## Overview

When Stripe fails to charge a customer at the end of a trial period or during the next billing cycle (due to insufficient funds, declined card, etc.), users need a way to update their payment method. This guide explains the two available solutions.

## Available Solutions

### 1. Stripe Customer Portal (Recommended)

**Option A: Dynamic Session Creation**
**Endpoint:** `POST /api/subscription/create-customer-portal-session`

**Option B: Direct Portal URL (Simplest)**
**Endpoint:** `GET /api/subscription/get-direct-customer-portal-url`

**Purpose:** Creates a Stripe Customer Portal session where users can:
- Update their payment method
- View billing history
- Download invoices
- Update billing information
- Manage subscriptions

**✅ Ready to Use:** Since you've configured the Customer Portal in your dashboard, both endpoints will work.

**Option A - Dynamic Session Request:**
```bash
curl -X POST "http://localhost:3000/api/subscription/create-customer-portal-session" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Option A - Dynamic Session Response:**
```json
{
  "success": true,
  "portalUrl": "https://billing.stripe.com/session/...",
  "msg": "Customer portal session created successfully"
}
```

**Option B - Direct URL Request:**
```bash
curl -X GET "http://localhost:3000/api/subscription/get-direct-customer-portal-url" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Option B - Direct URL Response:**
```json
{
  "success": true,
  "portalUrl": "https://billing.stripe.com/p/login/test_3cI14pd3Ldodct57Ta8g000?customer=cus_...",
  "msg": "Direct customer portal URL generated successfully"
}
```

**Frontend Integration:**

**Option A - Dynamic Session:**
```javascript
// Create portal session and redirect user
const response = await fetch('/api/subscription/create-customer-portal-session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.success) {
  // Redirect user to Stripe Customer Portal
  window.location.href = data.portalUrl;
}
```

**Option B - Direct URL (Simpler):**
```javascript
// Get direct portal URL and redirect user
const response = await fetch('/api/subscription/get-direct-customer-portal-url', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const data = await response.json();
if (data.success) {
  // Redirect user to Stripe Customer Portal
  window.location.href = data.portalUrl;
}
```

### 2. Direct Payment Method Update (Alternative)

**Endpoint:** `POST /api/subscription/create-payment-method-update-session`

**Purpose:** Creates a Stripe Checkout session specifically for updating payment methods only.

**Request:**
```bash
curl -X POST "http://localhost:3000/api/subscription/create-payment-method-update-session" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/...",
  "msg": "Payment method update session created successfully"
}
```

**Frontend Integration:**
```javascript
// Create payment method update session and redirect user
const response = await fetch('/api/subscription/create-payment-method-update-session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.success) {
  // Redirect user to Stripe Checkout for payment method update
  window.location.href = data.checkoutUrl;
}
```

## When to Use Each Solution

### Use Customer Portal When:
- You want users to have full billing management capabilities
- Users need to view billing history and invoices
- You want a comprehensive billing management experience
- Users need to update billing addresses or other customer information

### Use Direct Payment Method Update When:
- You only need users to update their payment method
- You want a simpler, more focused experience
- You're handling other billing management features in your own UI
- You want more control over the user flow

## Error Handling

Both endpoints will return appropriate error messages:

```json
{
  "success": false,
  "msg": "User not found"
}
```

```json
{
  "success": false,
  "msg": "No Stripe customer found. Please create a subscription first."
}
```

**Customer Portal Configuration Error:**
```json
{
  "success": false,
  "msg": "Customer portal not configured. Please use the direct payment method update instead.",
  "error": "No configuration provided...",
  "alternativeEndpoint": "/api/subscription/create-payment-method-update-session"
}
```

**Solution:** If you get the configuration error, either:
1. Set up Customer Portal in Stripe Dashboard (see `STRIPE_CUSTOMER_PORTAL_SETUP.md`)
2. Use the alternative endpoint: `/api/subscription/create-payment-method-update-session`

## Security Notes

- Both endpoints require authentication (`authPolicy` middleware)
- Users can only create sessions for their own accounts
- Stripe handles all payment method data securely (PCI compliance)
- No sensitive payment information is stored on your servers

## Integration with Payment Failure Flow

When a payment fails (handled in the `invoice.payment_failed` webhook), you can:

1. Set `user.lastPaymentFailed = true` (already implemented)
2. Show a banner/notification to the user about the failed payment
3. Provide a button/link that calls one of these endpoints
4. Redirect the user to update their payment method
5. After successful update, Stripe will automatically retry the failed payment

## Example Frontend Implementation

```javascript
// Show payment failure notification
if (user.lastPaymentFailed) {
  showNotification({
    type: 'error',
    title: 'Payment Failed',
    message: 'Your payment method was declined. Please update your payment information.',
    action: {
      label: 'Update Payment Method',
      onClick: () => updatePaymentMethod()
    }
  });
}

async function updatePaymentMethod() {
  try {
    const response = await fetch('/api/subscription/create-customer-portal-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      window.location.href = data.portalUrl;
    } else {
      showError(data.msg);
    }
  } catch (error) {
    showError('Failed to create payment update session');
  }
}
```
