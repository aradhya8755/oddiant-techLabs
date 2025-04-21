import ExcelJS from "exceljs"

interface ContactSubmission {
  name: string
  email: string
  phone?: string
  company?: string
  service: string
  message: string
  createdAt: Date
}

export async function generateExcel(submissions: ContactSubmission[]): Promise<Buffer> {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Contact Submissions")

  // Define columns
  worksheet.columns = [
    { header: "Date", key: "createdAt", width: 20 },
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Company", key: "company", width: 25 },
    { header: "Service", key: "service", width: 20 },
    { header: "Message", key: "message", width: 50 },
  ]

  // Style the header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  }

  // Add data rows
  submissions.forEach((submission) => {
    worksheet.addRow({
      createdAt: submission.createdAt,
      name: submission.name,
      email: submission.email,
      phone: submission.phone || "N/A",
      company: submission.company || "N/A",
      service: submission.service,
      message: submission.message,
    })
  })

  // Format date column
  worksheet.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm:ss"

  // Generate buffer
  return await workbook.xlsx.writeBuffer()
}
