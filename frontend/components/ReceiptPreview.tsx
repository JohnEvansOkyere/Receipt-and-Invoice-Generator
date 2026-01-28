'use client'

import { generateReceiptText } from '@/utils/receiptUtils'

interface ReceiptItem {
  id: string
  name: string
  price: number
}

interface ReceiptPreviewProps {
  businessName: string
  customerName: string
  items: ReceiptItem[]
  total: number
  date: string
}

export default function ReceiptPreview({
  businessName,
  customerName,
  items,
  total,
  date
}: ReceiptPreviewProps) {
  // If no items, show empty state
  if (items.length === 0) {
    return (
      <div className="receipt-preview">
        <h3>Receipt Preview</h3>
        <div className="empty-state">
          Add items above to see receipt preview
        </div>
      </div>
    )
  }

  const receiptText = generateReceiptText({
    businessName,
    customerName,
    items,
    total,
    date
  })

  return (
    <div className="receipt-preview">
      <h3>Receipt Preview</h3>
      <div id="receipt-preview-content" className="receipt-content">
        {receiptText.split('\n').map((line, index) => {
          // Format different parts of the receipt
          if (line.trim() === '') {
            return <div key={index} className="receipt-line">&nbsp;</div>
          }
          
          // Header line (business name)
          if (index === 0 && businessName) {
            return (
              <div key={index} className="receipt-line receipt-header">
                {line}
              </div>
            )
          }
          
          // Divider lines
          if (line.includes('─') || line.includes('-')) {
            return <div key={index} className="receipt-line receipt-divider"></div>
          }
          
          // Total line
          if (line.includes('TOTAL') || line.includes('Total')) {
            return (
              <div key={index} className="receipt-line receipt-total">
                {line}
              </div>
            )
          }
          
          // Item lines (format as item row)
          if (line.includes('$') && !line.includes('TOTAL')) {
            const parts = line.split(/\s+(?=\$)/)
            if (parts.length === 2) {
              return (
                <div key={index} className="receipt-line receipt-item">
                  <span>{parts[0]}</span>
                  <span>{parts[1]}</span>
                </div>
              )
            }
          }
          
          // Regular lines
          return (
            <div key={index} className="receipt-line">
              {line}
            </div>
          )
        })}
      </div>
    </div>
  )
}
