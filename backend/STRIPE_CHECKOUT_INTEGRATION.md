# Stripe Checkout Integration for All Charging Scenarios

## Overview

This document outlines the implementation of Stripe Checkout redirects for all customer charging scenarios in the application. The goal is to provide a consistent, secure, and user-friendly payment experience while maintaining existing functionality.

## Implementation Summary

### What Changed

1. **All charging scenarios now redirect to Stripe Checkout** instead of processing payments server-side
2. **Frontend receives checkout URLs** and handles user redirection
3. **Webhook processing** handles successful payments and plan updates
4. **Existing logic preserved** for downgrades and same-price changes

### Benefits

- **Better error handling**: Stripe's native checkout provides detailed decline reasons
- **PCI compliance**: Payment data never touches our servers
- **International support**: Stripe handles different payment methods globally
- **Consistent UX**: All payments go through the same flow
- **Built-in retry logic**: Stripe handles payment retry attempts

## API Endpoints

### 1. Plan Upgrades (New Checkout Flow)

#### `POST /api/subscription/create-upgrade-checkout`

**Purpose**: Creates a Stripe Checkout session for plan upgrades

**Request Body**:
```json
{
  "identifier": "standard_monthly_individual"
}
```

**Response**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "type": "trial_upgrade" | "regular_upgrade",
  "message": "Redirect to Stripe to complete your payment"
}
```

**Flow**:
1. **Trial Upgrades**: Creates payment session for full plan price
2. **Regular Upgrades**: Calculates proration, creates payment session for proration amount
3. **Downgrades**: Processes immediately (no payment needed)
4. **Same Price**: Processes immediately (no payment needed)

### 2. Plan Preview (Updated)

#### `GET /api/subscription/preview-upgrade?identifier=standard_monthly_individual`

**Response** (for upgrades):
```json
{
  "success": true,
  "type": "trial_upgrade" | "upgrade",
  "invoice": {
    "immediateChargeUSD": "$29.99",
    "nextCycleChargeUSD": "$29.99",
    "checkoutRequired": true,
    "message": "You'll be redirected to Stripe Checkout to complete your payment"
  }
}
```

### 3. Existing Endpoints (Unchanged)

- `POST /api/subscription/create-subscription` - New subscriptions (already uses checkout)
- `POST /api/subscription/upgrade` - Legacy endpoint (still works for downgrades/same-price)
- `POST /api/subscription/createCreditCheckout` - Credit purchases (already uses checkout)

## Frontend Integration

### 1. Plan Upgrade Flow

```javascript
// 1. Preview the upgrade
const preview = await fetch('/api/subscription/preview-upgrade?identifier=' + planId);
const previewData = await preview.json();

if (previewData.invoice.checkoutRequired) {
  // 2. Create checkout session
  const checkout = await fetch('/api/subscription/create-upgrade-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: planId })
  });
  const checkoutData = await checkout.json();
  
  // 3. Redirect to Stripe
  window.location.href = checkoutData.checkoutUrl;
} else {
  // Handle downgrades/same-price changes (no payment needed)
  const upgrade = await fetch('/api/subscription/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: planId })
  });
}
```

### 2. Success/Cancel URLs

**Success URL**: `${FRONTEND_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`
**Cancel URL**: `${FRONTEND_URL}/plan-purchase-failure`

## Webhook Processing

### New Webhook Events

The webhook handler now processes upgrade payments from checkout sessions:

```javascript
// Handle upgrade payments from checkout sessions
if (session.mode === "payment" && session.metadata?.action) {
  const { action, planIdentifier, stripeSubscriptionId } = session.metadata;
  
  if (action === 'trial_upgrade' || action === 'regular_upgrade') {
    // Update subscription to new plan
    // Update plan snapshot in database
    // Handle trial cancellation for trial upgrades
    // Save payment history
  }
}
```

### Payment History

All checkout payments are recorded in the `PaymentHistory` collection with metadata:
```json
{
  "action": "trial_upgrade" | "regular_upgrade",
  "planIdentifier": "standard_monthly_individual",
  "currentPlanIdentifier": "basic_monthly_individual",
  "fromCheckout": true
}
```

## Environment Variables

Ensure these are set in your environment:

```env
FRONTEND_URL=https://your-frontend-domain.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing

### Test Card Numbers

Use Stripe's test card numbers to simulate different scenarios:

- **Successful payment**: `4242424242424242`
- **Declined payment**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`
- **Expired card**: `4000000000000069`

### Testing Scenarios

1. **Trial Upgrade**: Upgrade from trial to paid plan
2. **Regular Upgrade**: Upgrade from one paid plan to another
3. **Downgrade**: Downgrade to cheaper plan (no payment)
4. **Same Price**: Change to plan with same price (no payment)
5. **Payment Decline**: Test with declined card numbers

## Migration Guide

### For Frontend Developers

1. **Update upgrade flows** to use the new checkout endpoints
2. **Handle checkout URLs** and redirect users to Stripe
3. **Update success/cancel pages** to handle upgrade scenarios
4. **Test all scenarios** with the provided test card numbers

### For Backend Developers

1. **No changes needed** to existing endpoints
2. **Webhook processing** automatically handles new checkout payments
3. **Database schema** remains unchanged
4. **Payment history** includes new metadata fields

## Error Handling

### Common Scenarios

1. **Payment Declined**: User sees Stripe's native error page
2. **Session Expired**: User redirected to cancel URL
3. **Network Issues**: Stripe handles retry logic
4. **Invalid Session**: Webhook ignores invalid sessions

### Logging

All checkout events are logged:
- Checkout session creation
- Payment processing
- Plan updates
- Error scenarios

## Security Considerations

1. **PCI Compliance**: Payment data never touches our servers
2. **Webhook Verification**: All webhooks are signature-verified
3. **Session Validation**: Only valid sessions are processed
4. **User Authentication**: All endpoints require authentication

## Monitoring

Monitor these metrics:
- Checkout session creation success rate
- Payment success rate
- Webhook processing success rate
- Plan upgrade completion rate

## Support

For issues related to:
- **Stripe Checkout**: Check Stripe Dashboard logs
- **Webhook Processing**: Check application logs
- **Payment Failures**: Check PaymentHistory collection
- **Plan Updates**: Check UserSubscription collection
