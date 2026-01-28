'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import './landing.css'

const IconFileLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
)

const IconReceiptPreview = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const IconInvoicePreview = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
)

const IconLightning = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
)

const IconPDF = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
)

const IconPhone = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
)

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="container nav-flex">
          <div className="logo">
            <IconFileLogo />
            <span>ReceiptGen</span>
          </div>
          <div className="nav-links">
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/register" className="nav-cta">Get Started Free</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-badge">Next-Generation Documentation</div>
            <h1>Professional billing <span className="text-gradient">for the modern era.</span></h1>
            <p className="hero-sub">
              Create world-class receipts and invoices in seconds. Shared via WhatsApp, 
              downloaded as PDF, and managed with surgical precision. 100% Free.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="hero-primary">Start Generating Now</Link>
              <Link href="/login" className="hero-secondary">Sign In to Dashboard</Link>
            </div>
          </div>
        </section>

        <section className="preview-section">
          <div className="container">
            <div className="interface-preview">
              <div className="preview-header">
                <div className="preview-dots"><span></span><span></span><span></span></div>
                <div className="preview-url">receiptgen.io/dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-cards">
                  <div className="preview-card">
                    <span className="p-icon"><IconReceiptPreview /></span>
                    <h3>Receipts</h3>
                  </div>
                  <div className="preview-card active">
                    <span className="p-icon"><IconInvoicePreview /></span>
                    <h3>Invoices</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="value-props">
          <div className="container grid-3">
            <div className="prop-card">
              <div className="prop-icon"><IconLightning /></div>
              <h3>Instant Generation</h3>
              <p>Built for speed. Generate documents faster than you can type a text message.</p>
            </div>
            <div className="prop-card">
              <div className="prop-icon"><IconPDF /></div>
              <h3>Premium PDFS</h3>
              <p>Documents that command respect. Clean, professional, and audit-ready.</p>
            </div>
            <div className="prop-card">
              <div className="prop-icon"><IconPhone /></div>
              <h3>WhatsApp Native</h3>
              <p>Direct sharing to WhatsApp built into the core. Reach customers where they are.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 ReceiptGen. Built for the ambitious.</p>
        </div>
      </footer>
    </div>
  )
}
