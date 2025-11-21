/**
 * Script to import existing parent and student data from CSV into Supabase
 * 
 * CSV Format:
 * parent_id,parent_name,studentid,child,child_grade,child_dob,child_quran_level,child_school,child_medical_issues,address,parent_number,parent_email,paid_for_books,paid_term_fees
 * 
 * Usage: This will be run via Supabase MCP server to import the data
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

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

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.split(',').every(cell => !cell.trim())) continue // Skip empty rows

    // Handle quoted fields (e.g., addresses with commas)
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim()) // Add last value

    if (values.length >= headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      rows.push(row as CSVRow)
    }
  }

  return rows
}

function parseParentName(parentName: string): {
  parent1_first_name: string
  parent1_last_name: string
  parent2_first_name?: string
  parent2_last_name?: string
} {
  // Format: "First Last / First Last" or "First Last"
  const parts = parentName.split('/').map(p => p.trim())
  const parent1 = parts[0].split(' ').filter(Boolean)
  const parent2 = parts[1] ? parts[1].split(' ').filter(Boolean) : null

  return {
    parent1_first_name: parent1[0] || '',
    parent1_last_name: parent1.slice(1).join(' ') || '',
    parent2_first_name: parent2 ? (parent2[0] || undefined) : undefined,
    parent2_last_name: parent2 ? (parent2.slice(1).join(' ') || undefined) : undefined,
  }
}

function parsePhoneNumber(phoneStr: string): { parent1_mobile?: string; parent2_mobile?: string } {
  const phones = phoneStr.split('/').map(p => p.trim()).filter(Boolean)
  return {
    parent1_mobile: phones[0] || undefined,
    parent2_mobile: phones[1] || undefined,
  }
}

function parseAddress(address: string): { address?: string; postcode?: string } {
  // Try to extract postcode (usually at the end, 4 digits)
  const postcodeMatch = address.match(/\b(\d{4})\b/)
  const postcode = postcodeMatch ? postcodeMatch[1] : undefined
  const addr = address.replace(/\b\d{4}\b/, '').trim()
  
  return {
    address: addr || undefined,
    postcode: postcode,
  }
}

function parseChildName(childName: string): { first_name: string; last_name: string } {
  const parts = childName.split(' ').filter(Boolean)
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' ') || '',
  }
}

async function importCSVData() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Read CSV file
  const csvPath = './Madrasah Abu Bakr As Siddiq - Database - Families (1).csv'
  const csvText = await Deno.readTextFile(csvPath)
  const rows = parseCSV(csvText)

  console.log(`Found ${rows.length} rows to import`)

  // Group by parent_id to handle multiple children per parent
  const parentMap = new Map<string, CSVRow[]>()
  for (const row of rows) {
    if (!row.parent_id || row.parent_id.trim() === '') continue
    if (!parentMap.has(row.parent_id)) {
      parentMap.set(row.parent_id, [])
    }
    parentMap.get(row.parent_id)!.push(row)
  }

  console.log(`Found ${parentMap.size} unique parents`)

  const importedParents = new Map<string, number>() // parent_id -> database id
  let successCount = 0
  let errorCount = 0

  for (const [parentId, childrenRows] of parentMap) {
    try {
      // Use first row for parent data
      const firstRow = childrenRows[0]
      if (!firstRow.parent_email || firstRow.parent_email.trim() === '') {
        console.log(`Skipping parent ${parentId}: no email`)
        continue
      }

      const parentName = parseParentName(firstRow.parent_name)
      const phones = parsePhoneNumber(firstRow.parent_number)
      const address = parseAddress(firstRow.address)

      // Check if parent already exists
      const { data: existingParent } = await supabase
        .from('parents')
        .select('id, parent_id')
        .eq('parent_id', parentId)
        .maybeSingle()

      let dbParentId: number

      if (existingParent) {
        // Update existing parent
        const { error } = await supabase
          .from('parents')
          .update({
            parent1_first_name: parentName.parent1_first_name,
            parent1_last_name: parentName.parent1_last_name,
            parent1_email: firstRow.parent_email.trim(),
            parent1_mobile: phones.parent1_mobile,
            parent1_address: address.address,
            parent1_postcode: address.postcode,
            parent2_first_name: parentName.parent2_first_name,
            parent2_last_name: parentName.parent2_last_name,
            parent2_mobile: phones.parent2_mobile,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingParent.id)

        if (error) throw error
        dbParentId = existingParent.id
        console.log(`Updated parent ${parentId} (${firstRow.parent_email})`)
      } else {
        // Create new parent
        const { data: newParent, error } = await supabase
          .from('parents')
          .insert({
            parent_id: parentId,
            parent1_first_name: parentName.parent1_first_name,
            parent1_last_name: parentName.parent1_last_name,
            parent1_email: firstRow.parent_email.trim(),
            parent1_mobile: phones.parent1_mobile,
            parent1_address: address.address,
            parent1_postcode: address.postcode,
            parent1_relationship: 'Parent',
            parent2_first_name: parentName.parent2_first_name,
            parent2_last_name: parentName.parent2_last_name,
            parent2_mobile: phones.parent2_mobile,
            parent2_relationship: parentName.parent2_first_name ? 'Parent' : undefined,
          })
          .select('id')
          .single()

        if (error) throw error
        dbParentId = newParent.id
        console.log(`Created parent ${parentId} (${firstRow.parent_email})`)
      }

      importedParents.set(parentId, dbParentId)

      // Import children
      for (const row of childrenRows) {
        if (!row.child || row.child.trim() === '') continue

        const childName = parseChildName(row.child)
        const medicalIssues = row.child_medical_issues && row.child_medical_issues.trim() !== '' 
          ? 'yes' 
          : 'no'

        // Check if student already exists
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('student_id', row.studentid)
          .maybeSingle()

        if (existingStudent) {
          // Update existing student
          const { error } = await supabase
            .from('students')
            .update({
              first_name: childName.first_name,
              last_name: childName.last_name,
              grade: row.child_grade || '',
              date_of_birth: row.child_dob || null,
              current_school: row.child_school || null,
              quran_level: row.child_quran_level || null,
              medical_issues: medicalIssues,
              medical_details: row.child_medical_issues || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingStudent.id)

          if (error) {
            console.error(`Error updating student ${row.studentid}:`, error)
          } else {
            console.log(`  Updated student ${row.studentid} (${row.child})`)
          }
        } else {
          // Create new student
          const { error } = await supabase
            .from('students')
            .insert({
              student_id: row.studentid,
              parent_id: dbParentId,
              first_name: childName.first_name,
              last_name: childName.last_name,
              grade: row.child_grade || '',
              date_of_birth: row.child_dob || null,
              current_school: row.child_school || null,
              quran_level: row.child_quran_level || null,
              medical_issues: medicalIssues,
              medical_details: row.child_medical_issues || null,
            })

          if (error) {
            console.error(`Error creating student ${row.studentid}:`, error)
          } else {
            console.log(`  Created student ${row.studentid} (${row.child})`)
          }
        }
      }

      successCount++
    } catch (error) {
      console.error(`Error processing parent ${parentId}:`, error)
      errorCount++
    }
  }

  console.log(`\nImport complete!`)
  console.log(`Successfully imported: ${successCount} parents`)
  console.log(`Errors: ${errorCount}`)
}

// Run if executed directly
if (import.meta.main) {
  importCSVData().catch(console.error)
}
