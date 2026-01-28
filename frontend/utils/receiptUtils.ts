/**
 * Utility functions for receipt generation and formatting
 */

interface ReceiptItem {
  id: string
  name: string
  price: number
}

interface ReceiptData {
  businessName: string
  customerName: string
  items: ReceiptItem[]
  total: number
  date: string
}

/**
 * Formats a phone number for WhatsApp (removes all non-digit characters except +)
 * @param phone - Phone number string (e.g., "+1 234-567-8900" or "1234567890")
 * @returns Formatted phone number (e.g., "1234567890" or "+1234567890")
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all spaces, dashes, parentheses, and other non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // If it starts with +, keep it; otherwise ensure it's just digits
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  return cleaned
}

/**
 * Formats a number as currency
 * @param amount - Number to format
 * @returns Formatted currency string (e.g., "$10.50")
 */
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Generates formatted receipt text
 * @param data - Receipt data object
 * @returns Formatted receipt text string
 */
export function generateReceiptText(data: ReceiptData): string {
  const { businessName, customerName, items, total, date } = data
  
  let receipt = ''
  
  // Header: Business Name (if provided)
  if (businessName.trim()) {
    receipt += `${businessName.trim()}\n`
    receipt += '─'.repeat(Math.max(30, businessName.length)) + '\n'
  } else {
    receipt += 'RECEIPT\n'
    receipt += '─'.repeat(30) + '\n'
  }
  
  // Date
  receipt += `Date: ${date}\n`
  
  // Customer Name (if provided)
  if (customerName.trim()) {
    receipt += `Customer: ${customerName.trim()}\n`
  }
  
  receipt += '\n'
  receipt += '─'.repeat(30) + '\n'
  receipt += 'ITEMS\n'
  receipt += '─'.repeat(30) + '\n'
  
  // Items list
  items.forEach((item) => {
    if (item.name.trim()) {
      const itemName = item.name.trim()
      const itemPrice = formatCurrency(item.price || 0)
      
      // Format: "Item Name                    $10.50"
      // Pad item name to align prices
      const maxNameLength = 20
      const paddedName = itemName.length > maxNameLength 
        ? itemName.substring(0, maxNameLength - 3) + '...'
        : itemName.padEnd(maxNameLength)
      
      receipt += `${paddedName} ${itemPrice}\n`
    }
  })
  
  receipt += '─'.repeat(30) + '\n'
  
  // Total
  receipt += `TOTAL${' '.repeat(15)}${formatCurrency(total)}\n`
  
  receipt += '\n'
  receipt += 'Thank you for your business!\n'
  
  return receipt
}
