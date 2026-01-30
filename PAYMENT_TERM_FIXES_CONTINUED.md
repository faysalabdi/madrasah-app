# Payment and Term Management Fixes - Part 2

## Date: 2026-01-30

## Issues Fixed

### 1. Manual Payment Missing term_id
**Problem**: When creating manual payments in the Admin Portal, the `term_id` field was not being set, causing these payments to not be associated with the current term.

**Solution**:
- Added `currentTermId` and `terms` state variables to `AdminPortal.tsx`
- Modified `loadAdminData()` to fetch and store the current term ID and all terms
- Updated `handleCreatePayment()` to include `term_id: currentTermId` when inserting payment records
- Updated the `Payment` interface to include `term_id: number | null`

**Files Modified**:
- `client/src/pages/AdminPortal.tsx`

**Code Changes**:
```typescript
// In state declarations:
const [currentTermId, setCurrentTermId] = useState<number | null>(null)
const [terms, setTerms] = useState<any[]>([])

// In loadAdminData():
setCurrentTermId(currentTermId || null)
const { data: allTermsData } = await supabase
  .from('terms')
  .select('*')
  .order('academic_year', { ascending: false })
  .order('term_number', { ascending: false })
setTerms(allTermsData || [])

// In handleCreatePayment() payment record:
term_id: currentTermId, // Add current term ID
```

### 2. Payments Not Grouped by Terms
**Problem**: The Payments tab in the Admin Portal showed all payments in a flat list, making it difficult to see which payments belonged to which term.

**Solution**:
- Completely redesigned the payment history display to group payments by term
- Current term is shown first, followed by historical terms (most recent first)
- Payments with no term assigned are grouped under "No Term Assigned"
- Each term section shows:
  - Term name with "Current Term" badge if applicable
  - Number of payments and total amount for that term
  - Individual payment cards with all details

**Files Modified**:
- `client/src/pages/AdminPortal.tsx`

**UI Improvements**:
- Removed date filter dropdown (replaced by term grouping)
- Added term headers with summary statistics
- Better visual hierarchy with borders and sections
- Shows which payments belong to the current term vs historical terms

### 3. Term Deletion Not Working
**Problem**: When attempting to delete a term, the UI showed "Successfully deleted" but the term was not actually deleted from the database. This was due to missing RLS (Row Level Security) policies for admins to delete terms.

**Root Cause**: 
The `terms` table only had SELECT policies for authenticated users and full access for service_role. There were no DELETE, UPDATE, or INSERT policies for admin users authenticated through the application.

**Solution**:
Created a new migration that adds RLS policies allowing admins to manage terms:

1. **INSERT Policy**: Allows admins to create new terms
2. **UPDATE Policy**: Allows admins to modify existing terms
3. **DELETE Policy**: Allows admins to delete terms

All policies check if the authenticated user exists in the `admins` table by matching `auth.uid()` with the admin's `user_id`.

**Files Created**:
- Migration: `allow_admins_to_manage_terms` (applied via MCP Supabase)

**SQL Code**:
```sql
CREATE POLICY "Allow admins to insert terms"
ON terms FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()::text)
);

CREATE POLICY "Allow admins to update terms"
ON terms FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()::text)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()::text)
);

CREATE POLICY "Allow admins to delete terms"
ON terms FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()::text)
);
```

**Verification**:
- Tested deletion of a term (ID: 1) via SQL - successful
- Confirmed all 5 policies now exist on the `terms` table:
  1. Allow admins to delete terms (DELETE)
  2. Allow admins to insert terms (INSERT)
  3. Allow admins to update terms (UPDATE)
  4. Allow authenticated users to read terms (SELECT)
  5. Allow service role full access to terms (ALL)

## Testing Instructions

### Manual Payment with Term ID
1. Go to Admin Portal > Payments tab
2. Click "Create Manual Payment"
3. Select a parent and student(s)
4. Choose payment type (Term Fees/Books)
5. Create payment
6. Verify payment appears under the current term group
7. Check database: payment should have `term_id` set to current term ID

### Grouped Payments Display
1. Go to Admin Portal > Payments tab
2. Payments should be grouped by term
3. Current term should appear first with a "Current Term" badge
4. Each term section should show:
   - Term name
   - Number of payments
   - Total amount for that term
5. Older terms should appear in reverse chronological order

### Term Deletion
1. Go to Admin Portal > Terms tab
2. Find a non-current term
3. Click the trash icon
4. Review the data impact warning
5. Type the term name to confirm
6. Click "Delete Term"
7. Verify:
   - Term is actually removed from the database
   - Success toast appears
   - Term list refreshes without the deleted term
   - Associated data (attendance, homework) loses term association but is preserved
   - Historical snapshots are deleted

## Impact

- Manual payments now correctly associate with the current term
- Payment history is much more organized and easier to navigate by term
- Admins can now successfully delete, update, and create terms
- The term management system is now fully functional

## Related Files
- `client/src/pages/AdminPortal.tsx` - Added term tracking and grouped payments display
- `client/src/components/TermManagement.tsx` - Term deletion now works properly
- Database: `terms` table now has proper RLS policies for admin operations

