'use client'

interface Item {
  name: string
  description?: string
  quantity: number
  unit_price: number
  total: number
}

interface InvoiceProps {
  invoiceNumber: string
  businessName: string
  businessAddress?: string
  businessCity?: string
  businessState?: string
  businessZip?: string
  businessCountry?: string
  businessPhone?: string
  businessEmail?: string
  businessTaxId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  customerTaxId?: string
  issueDate: string
  dueDate?: string
  items: Item[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  paymentTerms?: string
  status: string
  notes?: string
}

export default function ProfessionalInvoice({
  invoiceNumber,
  businessName,
  businessAddress,
  businessCity,
  businessState,
  businessZip,
  businessCountry,
  businessPhone,
  businessEmail,
  businessTaxId,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerTaxId,
  issueDate,
  dueDate,
  items,
  subtotal,
  taxRate,
  taxAmount,
  discount,
  total,
  paymentTerms,
  status,
  notes
}: InvoiceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatAddress = () => {
    const parts = [businessAddress, businessCity, businessState, businessZip].filter(Boolean)
    return parts.join(', ')
  }

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#10B981'
      case 'overdue':
        return '#EF4444'
      case 'cancelled':
        return '#6B7280'
      default:
        return '#F59E0B'
    }
  }

  return (
    <div id="invoice-preview-content" className="professional-invoice">
      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand">
            <div className="brand-name">{businessName}</div>
            {businessTaxId && (
              <div className="brand-tax-id">Tax ID: {businessTaxId}</div>
            )}
          </div>
          <div className="invoice-type">
            <div className="invoice-type-label">INVOICE</div>
            <div className="invoice-number">{invoiceNumber}</div>
            <div className="invoice-status" style={{ color: getStatusColor() }}>
              {status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="invoice-business-info">
          {formatAddress() && <div>{formatAddress()}</div>}
          {businessCountry && <div>{businessCountry}</div>}
          {businessPhone && <div>Phone: {businessPhone}</div>}
          {businessEmail && <div>Email: {businessEmail}</div>}
        </div>

        {/* Divider */}
        <div className="invoice-divider"></div>

        {/* Two Column Layout */}
        <div className="invoice-two-column">
          {/* Bill To */}
          <div className="invoice-column">
            <div className="invoice-section-title">Bill To</div>
            <div className="invoice-customer-info">
              <div className="customer-name">{customerName}</div>
              {customerAddress && <div>{customerAddress}</div>}
              {customerEmail && <div>Email: {customerEmail}</div>}
              {customerPhone && <div>Phone: {customerPhone}</div>}
              {customerTaxId && <div>Tax ID: {customerTaxId}</div>}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="invoice-column">
            <div className="invoice-meta">
              <div className="invoice-meta-row">
                <span>Invoice Date:</span>
                <span>{new Date(issueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {dueDate && (
                <div className="invoice-meta-row">
                  <span>Due Date:</span>
                  <span>{new Date(dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              {paymentTerms && (
                <div className="invoice-meta-row">
                  <span>Payment Terms:</span>
                  <span>{paymentTerms}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Items Table */}
        <div className="invoice-items">
          <table className="items-table">
            <thead>
              <tr>
                <th className="item-name">Item Name</th>
                <th className="item-description">Description</th>
                <th className="item-quantity">QTY</th>
                <th className="item-price">UNIT</th>
                <th className="item-total">RICE AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="item-name">{item.name}</td>
                  <td className="item-description">{item.description || '-'}</td>
                  <td className="item-quantity">{item.quantity}</td>
                  <td className="item-price">{formatCurrency(item.unit_price)}</td>
                  <td className="item-total">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-divider"></div>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="total-row">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="total-row">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="total-row total-final">
            <span>Total Due</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <>
            <div className="invoice-divider"></div>
            <div className="invoice-notes">
              <div className="notes-title">Notes</div>
              <div className="notes-content">{notes}</div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="invoice-footer">
          <div>Please remit payment by the due date.</div>
          <div className="footer-small">built by John Evans Okyere</div>
        </div>
      </div>
    </div>
  )
}
