import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

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
    if (!line || line.split(',').every(cell => !cell.trim())) continue

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
    values.push(current.trim())

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Get CSV data from request body
    const { csvData } = await req.json()
    if (!csvData) {
      return new Response(
        JSON.stringify({ error: "CSV data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const rows = parseCSV(csvData)
    console.log(`Found ${rows.length} rows to import`)

    // Group by parent_id
    const parentMap = new Map<string, CSVRow[]>()
    for (const row of rows) {
      if (!row.parent_id || row.parent_id.trim() === '' || row.parent_id === 'P20' || row.parent_id === 'P21') continue
      if (!parentMap.has(row.parent_id)) {
        parentMap.set(row.parent_id, [])
      }
      parentMap.get(row.parent_id)!.push(row)
    }

    console.log(`Found ${parentMap.size} unique parents`)

    const importedParents = new Map<string, number>()
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const [parentId, childrenRows] of parentMap) {
      try {
        const firstRow = childrenRows[0]
        if (!firstRow.parent_email || firstRow.parent_email.trim() === '') {
          console.log(`Skipping parent ${parentId}: no email`)
          continue
        }

        const parentName = parseParentName(firstRow.parent_name)
        const phones = parsePhoneNumber(firstRow.parent_number)
        const address = parseAddress(firstRow.address)

        // Check if parent exists
        const { data: existingParent } = await supabaseClient
          .from('parents')
          .select('id, parent_id')
          .eq('parent_id', parentId)
          .maybeSingle()

        let dbParentId: number

        if (existingParent) {
          const { error } = await supabaseClient
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
        } else {
          const { data: newParent, error } = await supabaseClient
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
        }

        importedParents.set(parentId, dbParentId)

        // Import children
        for (const row of childrenRows) {
          if (!row.child || row.child.trim() === '') continue

          const childName = parseChildName(row.child)
          const medicalIssues = row.child_medical_issues && row.child_medical_issues.trim() !== '' 
            ? 'yes' 
            : 'no'

          const { data: existingStudent } = await supabaseClient
            .from('students')
            .select('id')
            .eq('student_id', row.studentid)
            .maybeSingle()

          if (existingStudent) {
            const { error } = await supabaseClient
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
              errors.push(`Error updating student ${row.studentid}: ${error.message}`)
            }
          } else {
            const { error } = await supabaseClient
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
              errors.push(`Error creating student ${row.studentid}: ${error.message}`)
            }
          }
        }

        successCount++
      } catch (error: any) {
        errorCount++
        errors.push(`Error processing parent ${parentId}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported: successCount,
        errors: errorCount,
        errorDetails: errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

