/**
 * whatsappHelper.js
 * Formats WhatsApp order inquiry messages and builds wa.me redirection URLs.
 */

// Default boutique WhatsApp contact number (can be configured)
export const BOUTIQUE_WHATSAPP_PHONE = '919876543210';

/**
 * Generate WhatsApp URL for a single product item.
 * 
 * @param {Object} item - { productName, productCode, color, size, quantity, price }
 * @param {string} phone - Boutique phone number
 * @returns {string} wa.me URL with encoded message string
 */
export function getSingleItemWhatsAppUrl(item, phone = BOUTIQUE_WHATSAPP_PHONE) {
  const sizeLine = item.size ? `\nSize: ${item.size}` : '';
  const priceFormatted = Number(item.price).toLocaleString('en-IN');

  const text = 
`Hi, I am interested in ordering from Ishaa Collections:

Product: ${item.productName}
Product Code: ${item.productCode}${sizeLine}
Color: ${item.color}
Quantity: ${item.quantity}
Price: ₹${priceFormatted}

Please confirm availability and final price.`;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp URL for multiple items in customer shopping cart.
 * 
 * @param {Array} cartItems - Array of cart item objects
 * @param {string} phone - Boutique phone number
 * @returns {string} wa.me URL with encoded message string
 */
export function getCartWhatsAppUrl(cartItems, phone = BOUTIQUE_WHATSAPP_PHONE) {
  if (!cartItems || cartItems.length === 0) return '#';

  if (cartItems.length === 1) {
    return getSingleItemWhatsAppUrl(cartItems[0], phone);
  }

  let itemsListText = '';
  let grandTotal = 0;

  cartItems.forEach((item, index) => {
    const itemTotal = Number(item.price) * item.quantity;
    grandTotal += itemTotal;
    const sizePart = item.size ? `\n   Size: ${item.size}` : '';
    const priceFormatted = Number(item.price).toLocaleString('en-IN');

    itemsListText += `${index + 1}. ${item.productName}\n   Code: ${item.productCode}\n   Color: ${item.color}${sizePart}\n   Qty: ${item.quantity}\n   Price: ₹${priceFormatted}\n\n`;
  });

  const grandTotalFormatted = grandTotal.toLocaleString('en-IN');

  const text = 
`Hi, I am interested in these items from Ishaa Collections:

${itemsListText.trim()}

Total: ₹${grandTotalFormatted}

Please confirm availability and final price.`;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
