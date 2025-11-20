/**
 * Script to import CSV data into Supabase
 * Run with: npx tsx scripts/import-csv-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CSVRow {
  parent_id: string
  parent_name: string
  studentid: string
  child: string
  child_grade: string
  child_dob: string
  child_quran_level: string
  child_school: string
  child_medical_issues: string
  address: string
  parent_number: string
  parent_email: string
  paid_for_books: string
  paid_term_fees: string
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    return row as CSVRow
  })
}

function parseParentName(name: string): { firstName: string; lastName: string } {
  const parts = name.split('/').map(p => p.trim())[0] // Take first parent
  const nameParts = parts.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  return { firstName, lastName }
}

function parsePhoneNumber(phone: string): string {
  // Take first phone number if multiple
  return phone.split('/').map(p => p.trim())[0] || ''
}

async function importData() {
  const csvPath = path.join(__dirname, '../Madrasah Abu Bakr As Siddiq - Database - Families (1).csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csvContent)

  console.log(`Found ${rows.length} rows to import`)

  // Group by parent_id
  const parentsMap = new Map<string, { parent: any; students: any[] }>()

  for (const row of rows) {
    if (!row.parent_id || row.parent_id === 'P20' || row.parent_id === 'P21') {
      continue // Skip empty rows
    }

    if (!parentsMap.has(row.parent_id)) {
      const { firstName, lastName } = parseParentName(row.parent_name)
      const parent = {
        parent_id: row.parent_id,
        parent1_first_name: firstName,
        parent1_last_name: lastName,
        parent1_email: row.parent_email || '',
        parent1_mobile: parsePhoneNumber(row.parent_number),
        parent1_address: row.address || '',
        parent1_postcode: '', // Extract from address if needed
      }
      parentsMap.set(row.parent_id, { parent, students: [] })
    }

    // Add student
    if (row.studentid && row.child) {
      const nameParts = row.child.split(' ')
      const student = {
        student_id: row.studentid,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        date_of_birth: row.child_dob || null,
        grade: row.child_grade || '',
        current_school: row.child_school || '',
        quran_level: row.child_quran_level || '',
        medical_issues: row.child_medical_issues ? 'yes' : 'no',
        medical_details: row.child_medical_issues || null,
      }
      parentsMap.get(row.parent_id)!.students.push(student)
    }
  }

  console.log(`Processing ${parentsMap.size} parents...`)

  // Import parents and students
  for (const [parentId, { parent, students }] of parentsMap.entries()) {
    try {
      // Check if parent exists
      const { data: existingParent } = await supabase
        .from('parents')
        .select('id')
        .eq('parent_id', parentId)
        .single()

      let parentDbId: number

      if (existingParent) {
        // Update existing parent
        const { data: updatedParent, error: updateError } = await supabase
          .from('parents')
          .update(parent)
          .eq('id', existingParent.id)
          .select()
          .single()

        if (updateError) {
          console.error(`Error updating parent ${parentId}:`, updateError)
          continue
        }
        parentDbId = updatedParent.id
      } else {
        // Insert new parent
        const { data: newParent, error: insertError } = await supabase
          .from('parents')
          .insert(parent)
          .select()
          .single()

        if (insertError) {
          console.error(`Error inserting parent ${parentId}:`, insertError)
          continue
        }
        parentDbId = newParent.id
      }

      // Import students
      for (const student of students) {
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('student_id', student.student_id)
          .single()

        const studentData = {
          ...student,
          parent_id: parentDbId,
        }

        if (existingStudent) {
          await supabase
            .from('students')
            .update(studentData)
            .eq('id', existingStudent.id)
        } else {
          await supabase
            .from('students')
            .insert(studentData)
        }
      }

      console.log(`✓ Imported parent ${parentId} with ${students.length} students`)
    } catch (error) {
      console.error(`Error processing parent ${parentId}:`, error)
    }
  }

  console.log('Import complete!')
}

importData().catch(console.error)

