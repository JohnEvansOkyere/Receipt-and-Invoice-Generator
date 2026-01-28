'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import api from '@/lib/api'
import './dashboard.css'

const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
)

const IconReceipt = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const IconInvoice = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
)

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)

      try {
        const businessRes = await api.get('/api/business/')
        setBusiness(businessRes.data)
      } catch (err) {
        setBusiness(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  return (
    <>
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Welcome back, {user?.email?.split('@')[0]}</h1>
          <p>What would you like to create today?</p>
        </div>
      </header>

      {!business && (
        <div className="onboarding-alert">
          <div className="alert-content">
            <span className="alert-icon"><IconAlert /></span>
            <div className="alert-text">
              <h3>Complete your business profile</h3>
              <p>You need to set up your business details before creating receipts or invoices.</p>
            </div>
          </div>
          <Link href="/dashboard/business" className="alert-button">
            Set Up Now
          </Link>
        </div>
      )}

      <div className="action-grid">
        <Link href="/dashboard/receipt" className="action-card premium">
          <div className="card-visual">
            <IconReceipt />
          </div>
          <div className="card-info">
            <h2>Create Receipt</h2>
            <p>Quickly generate a professional receipt for your customer.</p>
            <span className="card-link">Get Started →</span>
          </div>
        </Link>

        <Link href="/dashboard/invoice" className="action-card secondary">
          <div className="card-visual">
            <IconInvoice />
          </div>
          <div className="card-info">
            <h2>Create Invoice</h2>
            <p>Generate a detailed invoice with payment terms and status tracking.</p>
            <span className="card-link">Get Started →</span>
          </div>
        </Link>
      </div>

      <section className="stats-section">
        <h2>Quick Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Business Name</span>
            <span className="stat-value">{business?.name || 'Not set'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Account Type</span>
            <span className="stat-value">Free Professional</span>
          </div>
        </div>
      </section>
    </>
  )
}
