# Term Management System - Deployment Checklist

## ✅ Implementation Complete

### Database Changes
- ✅ Created `student_term_snapshots` table via migration
- ✅ Existing `terms` table properly configured
- ✅ All relevant tables have `term_id` foreign keys:
  - `attendance`
  - `homework`
  - `behavior_notes`
  - `student_notes`
  - `class_content`
  - `payments`

### Backend
- ✅ Deployed Edge Function: `transition-term`
  - Handles term transitions
  - Creates student snapshots
  - Manages grade progression
  - Resets payment statuses

### Frontend

#### Admin Portal
- ✅ New "Terms" tab in navigation
- ✅ `TermManagement` component with:
  - List of all terms (current and past)
  - "New Term" button
  - Term transition dialog
  - Warnings about data archival and grade progression
  - Success confirmations

#### Teacher Portal
- ✅ Term selector dropdown
- ✅ Historical data viewing
- ✅ All queries filtered by selected term:
  - Attendance
  - Homework
  - Behavior notes
  - Student notes
  - Class content

#### Parent Portal
- ✅ Term selector dropdown
- ✅ Historical data viewing
- ✅ All queries filtered by selected term:
  - Attendance
  - Homework
  - Behavior notes
  - Student notes
  - Class content

## 🚀 Deployment Steps

### 1. Deploy Edge Function (Already Done ✅)
```bash
# Already deployed to Supabase
# Function ID: 441d2c42-9821-4105-a05f-3f0b0308c6fd
```

### 2. Run Database Migration (Already Done ✅)
```bash
# Migration already applied: create_student_term_snapshots
# Created table: student_term_snapshots
```

### 3. Build and Deploy Frontend
```bash
# From project root
cd /Users/ayaanabdiwahab/madrasah-app
npm run build

# Deploy to Vercel
vercel --prod

# Or push to git if auto-deploy is configured
git add .
git commit -m "Add comprehensive term management system"
git push origin main
```

### 4. Initial Setup (Admin Must Do)

After deployment, an administrator must:

1. **Log into Admin Portal**
2. **Navigate to Terms Tab**
3. **Create First Term**:
   - Click "New Term" (will need to create manually in database first time)
   - Or use SQL:
   ```sql
   INSERT INTO terms (name, term_number, start_date, end_date, academic_year, is_current)
   VALUES ('Term 1 - 2026', 1, '2026-02-01', '2026-04-30', '2026', true);
   ```

## 📋 Testing Checklist

### Admin Portal
- [ ] Navigate to Terms tab
- [ ] View existing terms
- [ ] Click "New Term" button
- [ ] Fill in all fields
- [ ] Review warnings
- [ ] Submit term transition
- [ ] Verify success message
- [ ] Check snapshots were created
- [ ] Verify grade progression (if Term 4 → Term 1)

### Teacher Portal
- [ ] See term selector at top
- [ ] Select current term
- [ ] Select historical term
- [ ] View student details
- [ ] Verify data filters correctly
- [ ] Check "Historical Data" badge shows for past terms
- [ ] Try to add attendance (should use current term)

### Parent Portal
- [ ] See term selector at top
- [ ] Select current term
- [ ] Select historical term
- [ ] View student progress
- [ ] Compare across terms
- [ ] Check payment status (only current term)

### Database Verification
```sql
-- Check terms
SELECT * FROM terms ORDER BY created_at DESC;

-- Check current term
SELECT * FROM terms WHERE is_current = true;

-- Check snapshots
SELECT COUNT(*) FROM student_term_snapshots;

-- Check term filtering works
SELECT COUNT(*) FROM attendance WHERE term_id IS NOT NULL;
SELECT COUNT(*) FROM homework WHERE term_id IS NOT NULL;
SELECT COUNT(*) FROM behavior_notes WHERE term_id IS NOT NULL;
```

## ⚠️ Important Notes

### Before Going Live

1. **Backup Database**: Create a snapshot before first term transition
2. **Test in Staging**: If possible, test full workflow in staging environment
3. **Notify Users**: Inform teachers and parents about new feature
4. **Create Training Materials**: Share the TERM_MANAGEMENT_GUIDE.md
5. **Set Current Term**: Ensure current term exists before teachers/parents log in

### Data Migration for Existing Data

If you have existing data without term_id:

```sql
-- Create a "Legacy" term for old data
INSERT INTO terms (name, term_number, start_date, end_date, academic_year, is_current)
VALUES ('Legacy Data', 1, '2025-01-01', '2025-12-31', '2025', false);

-- Get the legacy term ID
-- Then update existing records:
UPDATE attendance SET term_id = [legacy_term_id] WHERE term_id IS NULL;
UPDATE homework SET term_id = [legacy_term_id] WHERE term_id IS NULL;
UPDATE behavior_notes SET term_id = [legacy_term_id] WHERE term_id IS NULL;
UPDATE student_notes SET term_id = [legacy_term_id] WHERE term_id IS NULL;
UPDATE class_content SET term_id = [legacy_term_id] WHERE term_id IS NULL;
UPDATE payments SET term_id = [legacy_term_id] WHERE term_id IS NULL;
```

## 🔧 Configuration

### Environment Variables
No new environment variables required. Uses existing Supabase configuration:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Edge Function Settings
- JWT verification: ✅ Enabled
- CORS: ✅ Configured
- Timeout: Default (uses service role key)

## 📊 Monitoring

### Key Metrics to Watch

1. **Term Transitions**:
   - Duration of transition
   - Number of snapshots created
   - Any errors during process

2. **Performance**:
   - Query performance with term filtering
   - Load times in Parent/Teacher portals
   - Snapshot creation time

3. **Data Integrity**:
   - Verify all new records have term_id
   - Check snapshot completeness
   - Validate grade progressions

### Logs to Monitor

```bash
# Supabase Edge Function logs
# Check for errors during term transitions
supabase functions logs transition-term

# Database logs
# Monitor slow queries
# Check for missing term_id values
```

## 🎯 Success Criteria

- [x] Database schema complete
- [x] Edge Function deployed
- [x] Frontend updated (all portals)
- [x] No linter errors
- [x] Documentation complete
- [ ] Tested in production
- [ ] First term transition successful
- [ ] Parents and teachers using successfully

## 📞 Support

If issues arise:
1. Check Supabase logs
2. Review TERM_MANAGEMENT_GUIDE.md
3. Test Edge Function manually
4. Verify database state
5. Check browser console for frontend errors

---

**Deployment Date**: _To be filled after deployment_
**Deployed By**: _To be filled_
**First Term Transition**: _To be scheduled_

