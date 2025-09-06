# Payment Failure and Recovery Flow

## Overview

This document explains the complete flow for handling payment failures and subsequent recovery when users update their payment methods.

## Payment Failure Flow

### 1. When Payment Fails (`invoice.payment_failed` webhook)

When Stripe fails to charge a customer (due to insufficient funds, declined card, etc.), the following actions are taken:

#### For Trial Subscriptions (`isTrialPeriod: true`):
```javascript
// User flags
user.lastPaymentFailed = true;
user.lastFailedInvoiceId = invoice.id; // Track which invoice failed

// Subscription flags
subscription.isActive = false;
subscription.isCancelled = true;
subscription.cancelledDueToPaymentFailure = true;
subscription.lastFailedInvoiceId = invoice.id; // Track which invoice failed
```

#### For Regular Subscriptions:
```javascript
// User flags
user.lastPaymentFailed = true;
user.lastFailedInvoiceId = invoice.id; // Track which invoice failed

// Subscription flags
subscription.isActive = false;
subscription.cancelledDueToPaymentFailure = true;
subscription.lastFailedInvoiceId = invoice.id; // Track which invoice failed
// Note: isCancelled remains false for regular subscriptions
```

### 2. User Experience After Payment Failure

- **UI Indicators**: The frontend can check `user.lastPaymentFailed` to show payment failure banners
- **Access Control**: The frontend can check `subscription.isActive` to restrict access to paid features
- **Payment Update Options**: Users can use the payment method update endpoints to fix their payment information

## Payment Recovery Flow

### 1. When Payment Succeeds (`invoice.payment_succeeded` webhook)

When a previously failed payment succeeds (after user updates payment method), the following recovery actions are taken:

#### User Flag Recovery:
```javascript
// Revert payment failure flag - but only for the same invoice that failed
if (user.lastPaymentFailed && user.lastFailedInvoiceId === invoice.id) {
  user.lastPaymentFailed = false;
  user.lastFailedInvoiceId = null; // Clear the failed invoice ID
  console.log(`✅ Payment succeeded for previously failed invoice ${invoice.id} - reverting payment failure flags`);
}
```

#### Subscription Flag Recovery:
```javascript
// Check if subscription was cancelled due to payment failure for the same invoice
if (subscription.cancelledDueToPaymentFailure === true && subscription.lastFailedInvoiceId === invoice.id) {
  // Reactivate subscription
  subscription.isActive = true;
  subscription.isCancelled = false;
  subscription.cancelledDueToPaymentFailure = false; // Clear the flag
  subscription.lastFailedInvoiceId = null; // Clear the failed invoice ID
  console.log(`✅ Reactivated subscription after successful payment for invoice ${invoice.id}`);
}
```

### 2. Smart Recovery Logic

The system distinguishes between different types of cancellations and ensures precise invoice matching:

- **Payment Failure Cancellations**: Automatically reactivated when the SAME invoice that failed succeeds
- **User-Initiated Cancellations**: NOT reactivated (preserves user intent)
- **Different Invoice Success**: If a different invoice succeeds, flags are NOT reverted (prevents incorrect recovery)

## Database Schema Changes

### New Fields Added to User Model

```javascript
lastFailedInvoiceId: { type: String, default: null }
```

### New Fields Added to UserSubscription Model

```javascript
cancelledDueToPaymentFailure: { type: Boolean, default: false },
lastFailedInvoiceId: { type: String, default: null }
```

These fields track which specific invoice failed and whether a subscription was cancelled due to payment failure, allowing for precise recovery logic that only reverts flags when the same invoice succeeds.

## API Endpoints for Payment Method Updates

### 1. Customer Portal (Recommended)
```bash
GET /api/subscription/get-direct-customer-portal-url
```

### 2. Direct Payment Method Update
```bash
POST /api/subscription/create-payment-method-update-session
```

## Invoice Matching Logic

### Why Invoice Matching is Important

The system tracks specific invoice IDs to prevent incorrect flag reversions. This is crucial because:

1. **Multiple Invoices**: A user might have multiple failed invoices
2. **Different Payment Methods**: User might pay a different invoice with a new payment method
3. **Subscription Changes**: User might upgrade/downgrade while having a failed payment
4. **Precision**: Only the exact invoice that failed should trigger flag reversion

### Invoice Matching Scenarios

#### Scenario 1: Same Invoice Success ✅
```javascript
// Invoice A fails
user.lastFailedInvoiceId = "in_1234567890";
subscription.lastFailedInvoiceId = "in_1234567890";

// Later, Invoice A succeeds
if (user.lastFailedInvoiceId === "in_1234567890") {
  // ✅ Revert flags - this is the same invoice that failed
  user.lastPaymentFailed = false;
  user.lastFailedInvoiceId = null;
}
```

#### Scenario 2: Different Invoice Success ❌
```javascript
// Invoice A fails
user.lastFailedInvoiceId = "in_1234567890";
subscription.lastFailedInvoiceId = "in_1234567890";

// Later, Invoice B succeeds (different invoice)
if (user.lastFailedInvoiceId !== "in_9876543210") {
  // ❌ Don't revert flags - this is a different invoice
  console.log("Different invoice succeeded, not reverting flags");
}
```

#### Scenario 3: Multiple Failed Invoices
```javascript
// Invoice A fails
user.lastFailedInvoiceId = "in_1234567890";

// Invoice B fails (overwrites previous)
user.lastFailedInvoiceId = "in_9876543210";

// Invoice A succeeds
if (user.lastFailedInvoiceId !== "in_1234567890") {
  // ❌ Don't revert - user still has Invoice B failed
}
```

## Complete Flow Example

### Scenario: Trial User Payment Failure and Recovery

1. **Trial Period Ends**
   - Stripe attempts to charge the customer
   - Payment fails (insufficient funds)

2. **Payment Failure Webhook Triggers**
   ```javascript
   // Flags set:
   user.lastPaymentFailed = true;
   user.lastFailedInvoiceId = "in_1234567890"; // Store failed invoice ID
   subscription.isActive = false;
   subscription.isCancelled = true;
   subscription.cancelledDueToPaymentFailure = true;
   subscription.lastFailedInvoiceId = "in_1234567890"; // Store failed invoice ID
   ```

3. **User Sees Payment Failure**
   - Frontend shows "Payment Failed" banner
   - User clicks "Update Payment Method"
   - Redirected to Customer Portal or Checkout

4. **User Updates Payment Method**
   - User adds new card or updates existing card
   - Stripe retries the failed payment

5. **Payment Success Webhook Triggers**
   ```javascript
   // Flags reverted (only if same invoice succeeds):
   user.lastPaymentFailed = false;
   user.lastFailedInvoiceId = null; // Clear failed invoice ID
   subscription.isActive = true;
   subscription.isCancelled = false;
   subscription.cancelledDueToPaymentFailure = false;
   subscription.lastFailedInvoiceId = null; // Clear failed invoice ID
   ```

6. **User Access Restored**
   - Frontend removes payment failure banner
   - User regains access to paid features
   - Subscription continues normally

## Frontend Integration

### Check Payment Status
```javascript
// Check if user has payment issues
if (user.lastPaymentFailed) {
  showPaymentFailureBanner();
}

// Check subscription access
if (!subscription.isActive) {
  restrictAccessToPaidFeatures();
}
```

### Handle Payment Method Update
```javascript
async function updatePaymentMethod() {
  try {
    const response = await fetch('/api/subscription/get-direct-customer-portal-url', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const data = await response.json();
    if (data.success) {
      window.location.href = data.portalUrl;
    }
  } catch (error) {
    showError('Failed to open payment method update');
  }
}
```

## Error Handling

### Payment Failure Scenarios
- **Insufficient Funds**: Card declined due to low balance
- **Expired Card**: Card has expired
- **Incorrect CVC**: Wrong security code
- **Card Not Supported**: Payment method not accepted

### Recovery Scenarios
- **Successful Retry**: Payment succeeds after method update
- **Multiple Failures**: System handles repeated failures gracefully
- **User Cancellation**: Distinguishes from payment failure cancellations

## Testing

### Test Payment Failure
```bash
# Use Stripe test cards for different failure scenarios
curl -X POST "/api/subscription/update-payment-method-test" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"testCardType": "insufficient_funds"}'
```

### Test Recovery
1. Trigger payment failure with test card
2. Verify flags are set correctly
3. Update payment method with valid test card
4. Verify flags are reverted correctly

## Monitoring and Logging

### Key Log Messages
- `❌ Payment failed for user {email}. Invoice ID: {id}`
- `✅ Payment succeeded - reverting payment failure flags for user {email}`
- `✅ Reactivated subscription {id} after successful payment`

### Metrics to Track
- Payment failure rate
- Recovery success rate
- Time to recovery
- User retention after payment failure

## Security Considerations

- All payment data handled by Stripe (PCI compliant)
- User authentication required for all endpoints
- Webhook signature verification
- No sensitive payment information stored locally

## Best Practices

1. **Immediate Feedback**: Show payment failure status immediately
2. **Clear Actions**: Provide obvious path to update payment method
3. **Graceful Degradation**: Restrict access but don't break the app
4. **Automatic Recovery**: Seamlessly restore access when payment succeeds
5. **User Communication**: Clear messaging about payment status and next steps
