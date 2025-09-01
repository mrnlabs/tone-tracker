// PDF Export Utility
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export class PDFExporter {
  constructor() {
    this.doc = null
    this.currentY = 20
    this.pageHeight = 280 // A4 page height in mm minus margins
    this.pageWidth = 210 // A4 page width in mm
    this.margin = 20
  }

  /**
   * Initialize a new PDF document
   * @param {string} title - Document title
   * @param {string} orientation - 'portrait' or 'landscape'
   */
  init(title = 'Report', orientation = 'portrait') {
    this.doc = new jsPDF(orientation, 'mm', 'a4')
    this.addHeader(title)
    return this
  }

  /**
   * Add header with title and date
   * @param {string} title 
   */
  addHeader(title) {
    // Title
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    
    // Date
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    this.doc.text(`Generated on ${date}`, this.pageWidth - this.margin - 50, this.currentY)
    
    this.currentY += 15
    this.addSeparator()
  }

  /**
   * Add a separator line
   */
  addSeparator() {
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }

  /**
   * Add a section title
   * @param {string} title 
   */
  addSectionTitle(title) {
    this.checkPageBreak(15)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 10
  }

  /**
   * Add text content
   * @param {string} text 
   * @param {object} options 
   */
  addText(text, options = {}) {
    const {
      fontSize = 10,
      fontStyle = 'normal',
      align = 'left',
      color = [0, 0, 0]
    } = options

    this.checkPageBreak(fontSize + 2)
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', fontStyle)
    this.doc.setTextColor(...color)
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.margin * 2))
    this.doc.text(lines, this.margin, this.currentY, { align })
    this.currentY += (lines.length * (fontSize * 0.4)) + 5
  }

  /**
   * Add a table
   * @param {Array} headers 
   * @param {Array} data 
   * @param {object} options 
   */
  addTable(headers, data, options = {}) {
    const {
      headerColor = [66, 139, 202],
      alternateRowColor = [245, 245, 245],
      fontSize = 9
    } = options

    this.checkPageBreak(20)
    
    const columnWidth = (this.pageWidth - (this.margin * 2)) / headers.length
    const rowHeight = 8

    // Headers
    this.doc.setFillColor(...headerColor)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), rowHeight, 'F')
    
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 255, 255)
    
    headers.forEach((header, index) => {
      const x = this.margin + (index * columnWidth) + 2
      this.doc.text(header, x, this.currentY + 5)
    })
    
    this.currentY += rowHeight

    // Data rows
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)
    
    data.forEach((row, rowIndex) => {
      this.checkPageBreak(rowHeight + 2)
      
      // Alternate row colors
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(...alternateRowColor)
        this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), rowHeight, 'F')
      }
      
      row.forEach((cell, colIndex) => {
        const x = this.margin + (colIndex * columnWidth) + 2
        const cellText = this.doc.splitTextToSize(String(cell), columnWidth - 4)
        this.doc.text(cellText[0] || '', x, this.currentY + 5) // Only first line to fit
      })
      
      this.currentY += rowHeight
    })
    
    this.currentY += 5
  }

  /**
   * Add a chart as image
   * @param {HTMLCanvasElement|string} chartElement - Canvas element or base64 image
   * @param {object} options 
   */
  async addChart(chartElement, options = {}) {
    const {
      width = 160,
      height = 100,
      title = ''
    } = options

    this.checkPageBreak(height + 20)
    
    if (title) {
      this.addSectionTitle(title)
    }

    let imgData
    if (typeof chartElement === 'string') {
      imgData = chartElement
    } else {
      const canvas = await html2canvas(chartElement)
      imgData = canvas.toDataURL('image/png')
    }
    
    const x = (this.pageWidth - width) / 2 // Center the chart
    this.doc.addImage(imgData, 'PNG', x, this.currentY, width, height)
    this.currentY += height + 10
  }

  /**
   * Add key metrics summary
   * @param {Array} metrics - Array of {label, value, color} objects
   */
  addMetricsSummary(metrics) {
    this.addSectionTitle('Key Metrics')
    
    const metricsPerRow = 3
    const boxWidth = (this.pageWidth - (this.margin * 2) - 10) / metricsPerRow
    const boxHeight = 20
    
    metrics.forEach((metric, index) => {
      const row = Math.floor(index / metricsPerRow)
      const col = index % metricsPerRow
      
      if (col === 0) {
        this.checkPageBreak(boxHeight + 5)
      }
      
      const x = this.margin + (col * (boxWidth + 5))
      const y = this.currentY + (row * (boxHeight + 5))
      
      // Box background
      const color = metric.color || [240, 240, 240]
      if (Array.isArray(color)) {
        this.doc.setFillColor(...color)
      } else {
        this.doc.setFillColor(240, 240, 240)
      }
      this.doc.rect(x, y, boxWidth, boxHeight, 'F')
      
      // Border
      this.doc.setDrawColor(200, 200, 200)
      this.doc.rect(x, y, boxWidth, boxHeight)
      
      // Label
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(100, 100, 100)
      this.doc.text(metric.label, x + 2, y + 6)
      
      // Value
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(0, 0, 0)
      this.doc.text(String(metric.value), x + 2, y + 15)
    })
    
    const totalRows = Math.ceil(metrics.length / metricsPerRow)
    this.currentY += (totalRows * (boxHeight + 5)) + 10
  }

  /**
   * Check if we need a page break
   * @param {number} requiredHeight 
   */
  checkPageBreak(requiredHeight) {
    if (this.currentY + requiredHeight > this.pageHeight) {
      this.doc.addPage()
      this.currentY = 20
    }
  }

  /**
   * Add footer to all pages
   * @param {string} text 
   */
  addFooter(text = '') {
    const pageCount = this.doc.internal.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(150, 150, 150)
      
      // Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin - 20,
        this.pageHeight + 10
      )
      
      // Custom footer text
      if (text) {
        this.doc.text(text, this.margin, this.pageHeight + 10)
      }
    }
  }

  /**
   * Save the PDF
   * @param {string} filename 
   */
  save(filename = 'report.pdf') {
    this.addFooter('Generated by Activation Monitor System')
    this.doc.save(filename)
  }

  /**
   * Get the PDF as blob
   * @returns {Blob}
   */
  getBlob() {
    this.addFooter('Generated by Activation Monitor System')
    return this.doc.output('blob')
  }
}

// Utility functions for common report types
export const exportWarehouseDashboard = async (data) => {
  const exporter = new PDFExporter()
  exporter.init('Warehouse Dashboard Report')
  
  // Key metrics
  const metrics = [
    { label: 'Total Items', value: data.totalItems || 0, color: [59, 130, 246] },
    { label: 'Low Stock Items', value: data.lowStockItems || 0, color: [239, 68, 68] },
    { label: 'Total Value', value: `$${(data.totalValue || 0).toFixed(2)}`, color: [34, 197, 94] },
    { label: 'Active Activations', value: data.activeActivations || 0, color: [147, 51, 234] }
  ]
  exporter.addMetricsSummary(metrics)
  
  // Add charts if provided
  if (data.charts) {
    for (const chart of data.charts) {
      await exporter.addChart(chart.canvas, { title: chart.title })
    }
  }
  
  // Add tables if provided
  if (data.lowStockTable) {
    exporter.addSectionTitle('Low Stock Items')
    exporter.addTable(
      ['Product', 'SKU', 'Current', 'Reorder Level', 'Status'],
      data.lowStockTable
    )
  }
  
  return exporter
}

export default PDFExporter