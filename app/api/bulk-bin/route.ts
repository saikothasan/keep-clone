import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

// Define the structure of our bin data
interface BinData {
  number: string
  country: string
  flag: string
  vendor: string
  type: string
  level: string
  bank_name: string
}

export async function POST(request: NextRequest) {
  try {
    const { bins } = await request.json()
    
    if (!bins || !Array.isArray(bins) || bins.length === 0) {
      return NextResponse.json({ error: "Valid BINs array is required" }, { status: 400 })
    }
    
    if (bins.length > 50) {
      return NextResponse.json({ error: "Maximum 50 BINs allowed at once" }, { status: 400 })
    }

    // Read the CSV file
    const filePath = path.join(process.cwd(), "public", "bins_all.csv")
    const fileContent = fs.readFileSync(filePath, "utf8")
    
    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as BinData[]
    
    // Find matching bins
    const results = bins.map(bin => {
      return records.find(record => record.number.startsWith(bin))
    }).filter(Boolean) as BinData[]
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error processing bulk BIN request:", error)
    return NextResponse.json({ error: "Failed to process bulk BIN request" }, { status: 500 })
  }
}
