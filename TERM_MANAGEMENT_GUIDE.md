# Term Management System

## Overview

The Term Management System allows administrators to manage academic terms, automatically archive student data, handle grade progression, and reset payment statuses for each new term.

## Key Features

1. **Term Transitions**: Smoothly transition between terms with automatic data archival
2. **Grade Progression**: Automatically promote students to next grade when transitioning from Term 4 to Term 1
3. **Historical Data**: View past term data in Parent and Teacher portals
4. **Payment Reset**: Fresh payment statuses for each term
5. **Data Snapshots**: Complete student performance history preserved

## System Components

### 1. Database Tables

#### `terms` Table
- Stores all academic terms
- Fields: `id`, `name`, `term_number` (1-4), `start_date`, `end_date`, `academic_year`, `is_current`
- Only one term can be marked as `is_current` at a time

#### `student_term_snapshots` Table
- Archives student data at end of each term
- Stores: grades, attendance stats, homework completion, behavior statistics, payment status
- One snapshot per student per term

#### Term-Related Foreign Keys
- `attendance.term_id`
- `homework.term_id`
- `behavior_notes.term_id`
- `student_notes.term_id`
- `class_content.term_id`
- `payments.term_id`

### 2. Edge Function: `transition-term`

**Location**: `supabase/functions/transition-term/index.ts`

**Purpose**: Handles the complete term transition process

**Process**:
1. Validates current term exists
2. Fetches all active students
3. For each student, calculates and creates snapshot:
   - Attendance statistics (present, late, absent counts)
   - Homework statistics (assigned, completed)
   - Behavior notes (positive, concern, incident counts)
   - Payment status (term fees, books)
4. Marks current term as `is_current = false`
5. Creates new term with `is_current = true`
6. If transitioning from Term 4 → Term 1:
   - Applies grade progression (Grade 1 → Grade 2, etc.)
   - Grade 6 → Grade 7

**Grade Progression Map**:
```
Grade 1 → Grade 2
Grade 2 → Grade 3
Grade 3 → Grade 4
Grade 4 → Grade 5
Grade 5 → Grade 6
Grade 6 → Grade 7
```

## Usage Guide

### For Administrators

#### Starting a New Term

1. **Navigate to Admin Portal** → **Terms Tab**

2. **Review Current Term**: Check the current term's end date

3. **Click "New Term"** button

4. **Fill in New Term Details**:
   - **Term Number**: 1, 2, 3, or 4
   - **Academic Year**: e.g., "2026" (just the year)
   - **Start Date**: First day of new term
   - **End Date**: Last day of new term
   - Note: Term name is auto-generated as "Term X - YEAR"

5. **Review Warnings**:
   - Snapshots will be created for all students
   - Payment statuses will be reset
   - If Term 4 → Term 1: Students will be promoted

6. **Click "Start New Term"**

7. **Wait for Process**: This may take a few moments for large student populations

8. **Success**: You'll see a confirmation with:
   - Number of snapshots created
   - Whether grade progression was applied

#### After Term Transition

1. **Send Invoices**: Use the Invoices tab to send term fee invoices to parents
2. **Verify Student Grades**: Check that students were promoted correctly (if applicable)
3. **Monitor Payments**: Track which parents have paid for the new term

#### Deleting a Term (If Created by Mistake)

**⚠️ Use with extreme caution!**

1. **Navigate to Terms Tab**
2. **Find the term** you want to delete (only non-current terms can be deleted)
3. **Click the trash icon** on the term card
4. **Review what will happen**:
   - Student data (attendance, homework, etc.) will be **preserved** but lose term association
   - Historical snapshots will be **permanently deleted**
5. **Type the exact term name** to confirm
6. **Click "Delete Term"**

**When to delete:**
- Term was created by mistake (wrong dates, wrong number, duplicate)
- Testing/development purposes

**When NOT to delete:**
- Never delete terms with real student data
- Never delete historical terms for record-keeping
- Use the term transition feature instead for normal operations

### For Teachers

#### Viewing Current vs Historical Data

1. **Term Selector**: At the top of the portal, use the dropdown to select which term to view
2. **Current Term**: Marked with "(Current)" label
3. **Historical Terms**: Show a "Historical Data" badge
4. **Student Details**: All student data (attendance, homework, etc.) is filtered by selected term

#### Recording Data

- **Always Records to Current Term**: When you mark attendance, assign homework, or add behavior notes, it automatically associates with the current term
- **Cannot Edit Historical Data**: Past terms are read-only

### For Parents

#### Viewing Student Progress

1. **Term Selector**: Choose which term to view from the dropdown
2. **View History**: Compare current performance with previous terms
3. **Payment Status**: Only current term payments can be made
4. **Student Progress**: See how your child has progressed across terms

## Best Practices

### Timing Term Transitions

1. **End of Term**: Run transition on the last day or first day of break
2. **Before New Students**: Ensure all current term data is complete
3. **After Final Payments**: Record any late payments before transition
4. **Communication**: Notify parents and teachers before transition

### Term Structure

**4 Terms Per Year**:
- Term 1: Start of academic year (e.g., Feb-Apr)
- Term 2: Second quarter (e.g., May-Jul)
- Term 3: Third quarter (e.g., Aug-Oct)
- Term 4: Final term (e.g., Nov-Jan)

**Academic Year**: Single year identifier (e.g., 2025, 2026)

### Data Integrity

1. **Before Transition**:
   - Verify all attendance is marked
   - Complete all pending homework
   - Finalize all behavior notes
   - Ensure teacher assignments are correct

2. **After Transition**:
   - Verify snapshots were created: Check student count
   - Verify grade progressions (if Term 4 → 1)
   - Test a few student records in historical view
   - Send out new term invoices

### Grade 7 Students

- Students promoted to Grade 7 will appear with that grade
- Currently, the system supports up to Grade 7
- Consider creating a graduation/completion workflow for Grade 7 students completing Term 4

## Troubleshooting

### Issue: Term transition fails

**Causes**:
- Invalid term number (must be 1-4)
- Missing required fields
- Database connection issues

**Solutions**:
1. Check all form fields are filled correctly
2. Ensure term number is between 1 and 4
3. Check browser console for errors
4. Contact system administrator

### Issue: Grade progression didn't apply

**Causes**:
- Not transitioning from Term 4 to Term 1
- Students already at Grade 7

**Solutions**:
- Grade progression only happens Term 4 → Term 1
- Manually adjust grades if needed in Admin Portal

### Issue: Historical data not showing

**Causes**:
- Term not selected
- No data recorded in that term
- Database query filtering issue

**Solutions**:
1. Ensure term is selected in dropdown
2. Verify data exists for that term in Admin Portal
3. Check term_id on records in database

### Issue: Can't see term selector

**Causes**:
- No terms created yet
- Database connection issues

**Solutions**:
1. Admin must create first term
2. Check Supabase connection

## Technical Details

### Edge Function Deployment

```bash
# Deploy the transition-term function
supabase functions deploy transition-term

# Test locally
supabase functions serve transition-term
```

### Database Query Examples

```sql
-- Get current term
SELECT * FROM terms WHERE is_current = true;

-- Get all snapshots for a student
SELECT * FROM student_term_snapshots WHERE student_id = 123 ORDER BY snapshot_date DESC;

-- Get attendance for current term
SELECT * FROM attendance WHERE term_id = (SELECT id FROM terms WHERE is_current = true);

-- View term statistics
SELECT 
  t.name,
  COUNT(sts.id) as snapshot_count
FROM terms t
LEFT JOIN student_term_snapshots sts ON sts.term_id = t.id
GROUP BY t.id, t.name
ORDER BY t.created_at DESC;
```

### API Endpoint

**URL**: `{SUPABASE_URL}/functions/v1/transition-term`

**Method**: POST

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer {ANON_KEY}`

**Body**:
```json
{
  "currentTermId": 1,
  "newTermName": "Term 2 - 2026/2027",
  "newTermNumber": 2,
  "newStartDate": "2026-05-01",
  "newEndDate": "2026-07-15",
  "newAcademicYear": "2026/2027"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Term transition completed successfully",
  "newTerm": { /* new term object */ },
  "snapshotsCreated": 45,
  "gradeProgressionApplied": false
}
```

## Future Enhancements

### Potential Features

1. **Automatic Term Creation**: Schedule terms in advance
2. **Term Templates**: Save term structures for reuse
3. **Bulk Grade Adjustments**: Handle special cases (repeating students, accelerated students)
4. **Term Reports**: Automated term summary reports
5. **Parent Notifications**: Auto-notify parents of new term
6. **Gradual Transition**: Roll over one grade at a time
7. **Term Comparison**: Side-by-side term comparisons for students
8. **Export Snapshots**: Download term data as CSV/PDF

### Roadmap

- **Phase 1**: ✅ Basic term transitions and snapshots
- **Phase 2**: ⏳ Enhanced reporting and analytics
- **Phase 3**: ⏳ Automated workflows and notifications
- **Phase 4**: ⏳ Advanced grade progression options

## Support

For issues or questions:
1. Check this documentation
2. Review the Troubleshooting section
3. Contact system administrator
4. Check Supabase logs for errors

---

**Last Updated**: January 2026
**Version**: 1.0

