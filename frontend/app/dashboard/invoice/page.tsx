'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import ProfessionalInvoice from '@/components/ProfessionalInvoice'
import '../receipt-invoice.css'
import '../../professional-receipt.css'

interface Item {
  name: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerTaxId, setCustomerTaxId] = useState('')
  const [items, setItems] = useState<Item[]>([
    { name: '', description: '', quantity: 1, unit_price: 0, total: 0 }
  ])
  const [taxRate, setTaxRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [status, setStatus] = useState('pending')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadBusiness()
    
    // Set default due date (30 days from now)
    const date = new Date()
    date.setDate(date.getDate() + 30)
    setDueDate(date.toISOString().split('T')[0])
  }, [router])

  const loadBusiness = async () => {
    try {
      const res = await api.get('/api/business/')
      setBusiness(res.data)
    } catch (err) {
      router.push('/dashboard/business')
    } finally {
      setLoading(false)
    }
  }

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { name: '', description: '', quantity: 1, unit_price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = discount
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100)
    const total = subtotal - discountAmount + taxAmount
    
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async () => {
    if (!business) return
    
    const { subtotal, taxAmount, total } = calculateTotals()
    const validItems = items.filter(item => item.name.trim() !== '')
    
    if (validItems.length === 0) {
      alert('Please add at least one item')
      return
    }

    if (!customerName) {
      alert('Customer name is required')
      return
    }

    try {
      await api.post('/api/invoices/', {
        customer_name: customerName,
        customer_phone: customerPhone || undefined,
        customer_tax_id: customerTaxId || undefined,
        due_date: dueDate || undefined,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount,
        total,
        payment_terms: paymentTerms || undefined,
        status,
        notes: notes || undefined,
        items: validItems
      })
      
      alert('Invoice created successfully!')
      router.push('/dashboard/history')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create invoice')
    }
  }

  const handleShareWhatsApp = () => {
    const { subtotal, taxAmount, total } = calculateTotals()
    const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
    const invoiceNumber = `INV-${Date.now().toString().slice(-8).toUpperCase()}`
    
    let invoiceText = `*INVOICE*\n\n`
    invoiceText += `*${business?.name || 'Business'}*\n`
    if (business?.address) invoiceText += `${business.address}\n`
    if (business?.phone) invoiceText += `Phone: ${business.phone}\n`
    invoiceText += `\n`
    invoiceText += `Invoice #: ${invoiceNumber}\n`
    invoiceText += `Issue Date: ${issueDate}\n`
    if (dueDateFormatted) invoiceText += `Due Date: ${dueDateFormatted}\n`
    if (customerName) invoiceText += `Bill To: ${customerName}\n`
    if (paymentTerms) invoiceText += `Payment Terms: ${paymentTerms}\n`
    invoiceText += `Status: ${status.toUpperCase()}\n`
    invoiceText += `\n`
    invoiceText += `*Items:*\n`
    items.filter(i => i.name).forEach(item => {
      invoiceText += `• ${item.name}`
      if (item.description) invoiceText += ` - ${item.description}`
      invoiceText += `\n  Qty: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${item.total.toFixed(2)}\n`
    })
    invoiceText += `\n`
    invoiceText += `Subtotal: $${subtotal.toFixed(2)}\n`
    if (discount > 0) invoiceText += `Discount: -$${discount.toFixed(2)}\n`
    if (taxRate > 0) invoiceText += `Tax (${taxRate}%): $${taxAmount.toFixed(2)}\n`
    invoiceText += `*Total Due: $${total.toFixed(2)}*\n`
    if (notes) invoiceText += `\nNotes: ${notes}\n`
    invoiceText += `\nPlease remit payment by the due date.`
    
    const encoded = encodeURIComponent(invoiceText)
    // Remove all non-digit characters from phone number (keeps only digits)
    const phone = customerPhone ? customerPhone.replace(/\D/g, '') : ''
    // Format phone number for WhatsApp (wa.me requires digits only, no + sign)
    const formattedPhone = phone.trim()
    const url = formattedPhone 
      ? `https://wa.me/${formattedPhone}?text=${encoded}` 
      : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')
  }

  const handleDownloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById('invoice-preview-content')
    if (!element) return

    await html2pdf().set({
      margin: [10, 10, 10, 10],
      filename: `invoice_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save()
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!business) return <div>Please set up your business profile first</div>

  const { subtotal, taxAmount, total } = calculateTotals()
  const invoiceNumber = `INV-${Date.now().toString().slice(-8).toUpperCase()}`

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Create Invoice</h1>
        <button onClick={() => router.push('/dashboard')} className="back-btn">← Back</button>
      </div>

      <div className="form-layout">
        <div className="form-section">
          <h2>Customer Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name *</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tax ID</label>
              <input type="text" value={customerTaxId} onChange={(e) => setCustomerTaxId(e.target.value)} />
            </div>
          </div>

          <h2>Invoice Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Payment Terms</label>
              <input type="text" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g., Net 30" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '0.875rem', background: 'var(--background)', border: '1px solid var(--surface-light)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <h2>Items</h2>
          {items.map((item, index) => (
            <div key={index} className="item-row">
              <input type="text" placeholder="Item name" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
              <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
              <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} />
              <input type="number" placeholder="Unit Price" step="0.01" value={item.unit_price || ''} onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)} />
              <span className="item-total">${item.total.toFixed(2)}</span>
              <button onClick={() => removeItem(index)} disabled={items.length === 1}>×</button>
            </div>
          ))}
          <button onClick={addItem} className="add-item-btn">+ Add Item</button>

          <h2>Additional Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label>Discount ($)</label>
              <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="totals-display">
            <div>Subtotal: ${subtotal.toFixed(2)}</div>
            {discount > 0 && <div>Discount: -${discount.toFixed(2)}</div>}
            {taxRate > 0 && <div>Tax ({taxRate}%): ${taxAmount.toFixed(2)}</div>}
            <div className="total-final">Total: ${total.toFixed(2)}</div>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="btn-primary">Save Invoice</button>
            <button onClick={handleShareWhatsApp} className="btn-secondary">Share WhatsApp</button>
            <button onClick={handleDownloadPDF} className="btn-secondary">Download PDF</button>
          </div>
        </div>

        <div className="preview-section">
          <h2>Preview</h2>
          <ProfessionalInvoice
            invoiceNumber={invoiceNumber}
            businessName={business.name}
            businessAddress={business.address}
            businessCity={business.city}
            businessState={business.state}
            businessZip={business.zip_code}
            businessCountry={business.country}
            businessPhone={business.phone}
            businessEmail={business.email}
            businessTaxId={business.tax_id}
            customerName={customerName || 'Customer Name'}
            customerPhone={customerPhone}
            customerTaxId={customerTaxId}
            issueDate={new Date().toISOString()}
            dueDate={dueDate}
            items={items.filter(i => i.name)}
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
            discount={discount}
            total={total}
            paymentTerms={paymentTerms}
            status={status}
            notes={notes}
          />
        </div>
      </div>
    </div>
  )
}
