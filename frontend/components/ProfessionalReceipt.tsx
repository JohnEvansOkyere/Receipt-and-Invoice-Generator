'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Item {
  name: string
  description?: string
  quantity: number
  unit_price: number
  total: number
}

interface ReceiptProps {
  receiptNumber: string
  businessName: string
  businessAddress?: string
  businessCity?: string
  businessState?: string
  businessZip?: string
  businessCountry?: string
  businessPhone?: string
  businessEmail?: string
  businessTaxId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  date: string
  items: Item[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  paymentMethod?: string
  notes?: string
}

export default function ProfessionalReceipt({
  receiptNumber,
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
  date,
  items,
  subtotal,
  taxRate,
  taxAmount,
  discount,
  total,
  paymentMethod,
  notes
}: ReceiptProps) {
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

  return (
    <div id="receipt-preview-content" className="professional-receipt">
      <div className="receipt-container">
        {/* Header */}
        <div className="receipt-header">
          <div className="receipt-brand">
            <div className="brand-name">{businessName}</div>
            {businessTaxId && (
              <div className="brand-tax-id">Tax ID: {businessTaxId}</div>
            )}
          </div>
          <div className="receipt-type">
            <div className="receipt-type-label">RECEIPT</div>
            <div className="receipt-number">{receiptNumber}</div>
          </div>
        </div>

        {/* Business Info */}
        <div className="receipt-business-info">
          {formatAddress() && <div>{formatAddress()}</div>}
          {businessCountry && <div>{businessCountry}</div>}
          {businessPhone && <div>Phone: {businessPhone}</div>}
          {businessEmail && <div>Email: {businessEmail}</div>}
        </div>

        {/* Divider */}
        <div className="receipt-divider"></div>

        {/* Customer Info */}
        {(customerName || customerEmail || customerPhone || customerAddress) && (
          <>
            <div className="receipt-section-title">Bill To</div>
            <div className="receipt-customer-info">
              {customerName && <div className="customer-name">{customerName}</div>}
              {customerAddress && <div>{customerAddress}</div>}
              {customerEmail && <div>Email: {customerEmail}</div>}
              {customerPhone && <div>Phone: {customerPhone}</div>}
            </div>
            <div className="receipt-divider"></div>
          </>
        )}

        {/* Date */}
        <div className="receipt-meta">
          <div className="receipt-meta-row">
            <span>Date:</span>
            <span>{new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          {paymentMethod && (
            <div className="receipt-meta-row">
              <span>Payment Method:</span>
              <span>{paymentMethod}</span>
            </div>
          )}
        </div>

        <div className="receipt-divider"></div>

        {/* Items Table */}
        <div className="receipt-items">
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

        <div className="receipt-divider"></div>

        {/* Totals */}
        <div className="receipt-totals">
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
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <>
            <div className="receipt-divider"></div>
            <div className="receipt-notes">
              <div className="notes-title">Notes</div>
              <div className="notes-content">{notes}</div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="receipt-footer">
          <div>Thank you for your business!</div>
          <div className="footer-small">built by John Evans Okyere</div>
        </div>
      </div>
    </div>
  )
}
