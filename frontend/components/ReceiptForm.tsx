'use client'

import { useState, useEffect } from 'react'
import ReceiptPreview from './ReceiptPreview'
import { generateReceiptText, formatPhoneNumber } from '@/utils/receiptUtils'

// Interface for receipt item
interface ReceiptItem {
  id: string
  name: string
  price: number
}

export default function ReceiptForm() {
  // Form state
  const [businessName, setBusinessName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', name: '', price: 0 }
  ])
  const [date, setDate] = useState('')

  // Initialize date on component mount
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    setDate(formattedDate)
  }, [])

  // Calculate total whenever items change
  const total = items.reduce((sum, item) => sum + (item.price || 0), 0)

  // Add new item row
  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', price: 0 }])
  }

  // Remove item row
  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  // Update item name
  const handleItemNameChange = (id: string, name: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, name } : item
    ))
  }

  // Update item price
  const handleItemPriceChange = (id: string, price: string) => {
    const numPrice = parseFloat(price) || 0
    setItems(items.map(item =>
      item.id === id ? { ...item, price: numPrice } : item
    ))
  }

  // Generate receipt text for WhatsApp
  const handleShareToWhatsApp = () => {
    const receiptText = generateReceiptText({
      businessName,
      customerName,
      items: items.filter(item => item.name.trim() !== ''),
      total,
      date
    })

    // Encode the receipt text for URL
    const encodedText = encodeURIComponent(receiptText)

    // If phone number is provided, create direct chat link
    // Otherwise, just open WhatsApp with the text
    if (customerPhone.trim()) {
      const formattedPhone = formatPhoneNumber(customerPhone)
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`
      window.open(whatsappUrl, '_blank')
    } else {
      // Open WhatsApp without specific number (user can choose contact)
      const whatsappUrl = `https://wa.me/?text=${encodedText}`
      window.open(whatsappUrl, '_blank')
    }
  }

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    const receiptElement = document.getElementById('receipt-preview-content')
    
    if (!receiptElement) {
      alert('Receipt preview not found. Please ensure you have items in your receipt.')
      return
    }

    try {
      // Dynamically import html2pdf.js (client-side only)
      // @ts-ignore - html2pdf.js doesn't have TypeScript definitions
      const html2pdf = (await import('html2pdf.js')).default

      // Configure PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `receipt_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      }

      // Generate and download PDF
      await html2pdf()
        .set(opt)
        .from(receiptElement)
        .save()
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <div>
      {/* Business Information */}
      <div className="form-group">
        <label htmlFor="businessName">Business Name (Optional)</label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter your business name"
        />
      </div>

      {/* Customer Information */}
      <div className="form-group">
        <label htmlFor="customerName">Customer Name (Optional)</label>
        <input
          type="text"
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="customerPhone">Customer WhatsApp Number (Optional)</label>
        <input
          type="tel"
          id="customerPhone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="e.g., +1234567890 or 1234567890"
        />
        <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
          Include country code (e.g., +1 for US, +91 for India)
        </small>
      </div>

      {/* Items Section */}
      <div className="items-section">
        <div className="items-header">
          <h3>Items</h3>
          <button
            type="button"
            className="add-item-btn"
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>

        {items.map((item) => (
          <div key={item.id} className="item-row">
            <input
              type="text"
              placeholder="Item name"
              value={item.name}
              onChange={(e) => handleItemNameChange(item.id, e.target.value)}
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price || ''}
              onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
              min="0"
              step="0.01"
            />
            <button
              type="button"
              className="remove-item-btn"
              onClick={() => handleRemoveItem(item.id)}
              disabled={items.length === 1}
              style={{ opacity: items.length === 1 ? 0.5 : 1 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Total Display */}
      <div className="total-section">
        <div className="total-label">Total Amount</div>
        <div className="total-amount">
          ${total.toFixed(2)}
        </div>
      </div>

      {/* Receipt Preview */}
      <ReceiptPreview
        businessName={businessName}
        customerName={customerName}
        items={items.filter(item => item.name.trim() !== '')}
        total={total}
        date={date}
      />

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          type="button"
          className="btn btn-whatsapp"
          onClick={handleShareToWhatsApp}
          disabled={items.filter(item => item.name.trim() !== '').length === 0}
        >
          <span>📱</span>
          Share to WhatsApp
        </button>
        <button
          type="button"
          className="btn btn-pdf"
          onClick={handleDownloadPDF}
          disabled={items.filter(item => item.name.trim() !== '').length === 0}
        >
          <span>📄</span>
          Download PDF
        </button>
      </div>
    </div>
  )
}
