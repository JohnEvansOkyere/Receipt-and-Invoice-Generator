'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import '../dashboard.css'

const IconReceiptSmall = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const IconInvoiceSmall = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
)

export default function HistoryPage() {
  const [loading, setLoading] = useState(true)
  const [receipts, setReceipts] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'receipts' | 'invoices'>('receipts')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await api.get('/api/history/')
      setReceipts(res.data.receipts || [])
      setInvoices(res.data.invoices || [])
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) return null

  return (
    <div className="history-page">
      <header className="page-header-simple">
        <div className="header-text">
          <h1>Document History</h1>
          <p>View and manage your generated receipts and invoices.</p>
        </div>
      </header>

      <div className="history-container-premium">
        <div className="history-tabs-premium">
          <button 
            className={`tab-btn-premium ${activeTab === 'receipts' ? 'active' : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            Receipts <span className="tab-count">{receipts.length}</span>
          </button>
          <button 
            className={`tab-btn-premium ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices <span className="tab-count">{invoices.length}</span>
          </button>
        </div>

        <div className="history-list-premium">
          {activeTab === 'receipts' ? (
            receipts.length === 0 ? (
              <div className="empty-history">No receipts found.</div>
            ) : (
              receipts.map((item) => (
                <div key={item.id} className="history-card-premium">
                  <div className="h-card-main">
                    <div className="h-card-icon"><IconReceiptSmall /></div>
                    <div className="h-card-details">
                      <h3>{item.receipt_number}</h3>
                      <p>{item.customer_name || 'No Customer'} • {formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="h-card-side">
                    <span className="h-card-amount">{formatCurrency(item.total)}</span>
                    <button className="h-card-action">View PDF</button>
                  </div>
                </div>
              ))
            )
          ) : (
            invoices.length === 0 ? (
              <div className="empty-history">No invoices found.</div>
            ) : (
              invoices.map((item) => (
                <div key={item.id} className="history-card-premium">
                  <div className="h-card-main">
                    <div className="h-card-icon"><IconInvoiceSmall /></div>
                    <div className="h-card-details">
                      <h3>{item.invoice_number}</h3>
                      <p>{item.customer_name} • {formatDate(item.issue_date)}</p>
                    </div>
                  </div>
                  <div className="h-card-side">
                    <span className={`h-status-badge ${item.status}`}>{item.status}</span>
                    <span className="h-card-amount">{formatCurrency(item.total)}</span>
                    <button className="h-card-action">View PDF</button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  )
}
