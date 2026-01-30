# Payment Term ID Fixes - Summary

## Problem
Payment statuses were not resetting when creating a new term because:
1. Payment status checks weren't filtering by current term
2. New payment records weren't being tagged with term_id

## Fixes Applied

### ✅ 1. ParentPortal.tsx - Payment Status Check
**File**: `client/src/pages/ParentPortal.tsx`  
**Function**: `hasPaidTermFees()`

**Changed**: Added filter for current term only
```typescript
// OLD: Checked all payments within 3 months
// NEW: Only checks payments for current term
const studentPayments = payments.filter(p => 
  p.student_id === studentId && 
  p.paid_term_fees && 
  p.status === 'succeeded' &&
  p.term_id === currentTermId // ADDED THIS
)
```

### ✅ 2. AdminPortal.tsx - Payment Status Display
**File**: `client/src/pages/AdminPortal.tsx`  
**Function**: Data loading section

**Changed**: 
1. Load current term
2. Filter payments by current term only
3. Removed 3-month date check (term is the period)

```typescript
// NEW: Get current term
const { data: currentTermData } = await supabase
  .from('terms')
  .select('id')
  .eq('is_current', true)
  .single()

// NEW: Filter payments by term
if (currentTermId) {
  termFeePaymentsQuery = termFeePaymentsQuery.eq('term_id', currentTermId)
}
```

### ✅ 3. pay-term-fees Edge Function
**File**: `supabase/functions/pay-term-fees/index.ts`  
**Version**: 9 (deployed)

**Changed**: Get current term and include in metadata
```typescript
// NEW: Get current term
const { data: currentTerm } = await supabaseClient
  .from("terms")
  .select("id")
  .eq("is_current", true)
  .single()

const termId = currentTerm?.id || null

// NEW: Include in all metadata
metadata: {
  // ... other fields
  term_id: termId ? termId.toString() : "",
}
```

### ⏳ 4. stripe-webhook Edge Function
**File**: `supabase/functions/stripe-webhook/index.ts`  
**Status**: NEEDS UPDATE

**Required Changes**: Extract term_id from metadata and include in ALL payment inserts

```typescript
// At the start of each case that creates payments:
const termId = session.metadata?.term_id ? parseInt(session.metadata.term_id) : null
// OR for subscription invoices:
const termId = subscription.metadata?.term_id ? parseInt(subscription.metadata.term_id) : null

// Then in EVERY payment insert:
await supabaseClient.from("payments").insert({
  parent_id: parseInt(parentId),
  student_id: sid,
  // ... other fields
  term_id: termId,  // ADD THIS LINE
  metadata: { ...session.metadata, student_id: sid.toString() },
})
```

**Locations to Update** (search for `from("payments").insert(`):
1. `checkout.session.completed` - Term fees only (line ~115)
2. `checkout.session.completed` - Full payment (line ~135)
3. `checkout.session.completed` - Books only (line ~155)
4. `checkout.session.completed` - Single payment (line ~175)
5. `payment_intent.succeeded` - Fallback (line ~270)
6. `invoice.payment_succeeded` - Subscription renewal (line ~380)

## Testing Steps

### Before These Changes:
❌ Ahmed Test shows "Term Fees Paid" even in new term  
❌ Admin portal shows old payments as current  
❌ Fatima Test shows unpaid (correct) but Ahmed shows paid (wrong)

### After Frontend Changes (Already Done):
✅ Parent portal checks current term only  
✅ Admin portal checks current term only  
⏳ NEW payments need webhook update to include term_id

### After Webhook Update (TODO):
1. Make a test payment
2. Verify payment record includes correct term_id
3. Verify status updates correctly in both portals

## Manual Webhook Update Steps

1. Get the current webhook code:
```bash
cd /Users/ayaanabdiwahab/madrasah-app
# Download current version if needed
```

2. Update ALL payment inserts to include `term_id`:
   - Extract from metadata at start of each case
   - Add to insert statement

3. Deploy updated webhook:
```bash
supabase functions deploy stripe-webhook --project-ref nwouazzqxkyndyxgsxuu
```

4. Test with a payment

## Quick Fix for Existing Data

If you need to assign existing payments to the current term:

```sql
-- Get current term ID
SELECT id FROM terms WHERE is_current = true;

-- Let's say it's 5, then:
UPDATE payments 
SET term_id = 5 
WHERE term_id IS NULL 
  AND created_at >= '2025-01-20'  -- Or whatever date the term started
  AND paid_term_fees = true;
```

## Why This Matters

**Without term_id on payments:**
- Parents see old term payments as "paid" for new term
- Admin sees incorrect payment status
- Can't track payment history per term
- Can't generate term-specific reports

**With term_id on payments:**
- ✅ Clean slate each term
- ✅ Accurate payment status
- ✅ Historical payment records preserved
- ✅ Term-specific reporting possible

## Current Status

✅ Frontend checks fixed (ParentPortal, AdminPortal)  
✅ pay-term-fees function updated (gets current term)  
⏳ stripe-webhook needs manual update (add term_id to inserts)  
⏳ Test new payment after webhook update

---

**Last Updated**: January 30, 2026  
**Files Modified**: ParentPortal.tsx, AdminPortal.tsx, pay-term-fees function  
**Files Pending**: stripe-webhook function

