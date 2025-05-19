/**
 * Utility functions for logging order information
 */

/**
 * Logs detailed order information to the console
 * @param {Object} order - The order object to log
 * @param {string} source - The source of the order (e.g., 'external', 'shopify')
 */
export function logOrderDetails(order, source = 'external') {
  console.log('\n📦 Order Information Log');
  console.log('=====================');
  console.log(`Source: ${source}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Log basic order information
  if (order.id) console.log(`Order ID: ${order.id}`);
  if (order.name) console.log(`Order Name: ${order.name}`);
  if (order.email) console.log(`Customer Email: ${order.email}`);
  
  // Log line items if present
  if (order.line_items && order.line_items.length > 0) {
    console.log('\nLine Items:');
    order.line_items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  Title: ${item.title}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Price: ${item.price}`);
    });
  }
  
  // Log shipping information if present
  if (order.shipping_address) {
    console.log('\nShipping Address:');
    console.log(`  Name: ${order.shipping_address.name}`);
    console.log(`  Address: ${order.shipping_address.address1}`);
    if (order.shipping_address.address2) console.log(`  Address 2: ${order.shipping_address.address2}`);
    console.log(`  City: ${order.shipping_address.city}`);
    console.log(`  Province: ${order.shipping_address.province}`);
    console.log(`  Country: ${order.shipping_address.country}`);
    console.log(`  Zip: ${order.shipping_address.zip}`);
  }
  
  // Log total information
  if (order.total_price) console.log(`\nTotal Price: ${order.total_price}`);
  if (order.currency) console.log(`Currency: ${order.currency}`);
  
  console.log('\n=====================\n');
}

/**
 * Logs order processing status
 * @param {string} status - The status of the order processing
 * @param {string} message - Additional message to log
 * @param {Object} [error] - Error object if any
 */
export function logOrderStatus(status, message, error = null) {
  const timestamp = new Date().toISOString();
  console.log(`\n🔄 Order Processing Status [${timestamp}]`);
  console.log(`Status: ${status}`);
  console.log(`Message: ${message}`);
  if (error) {
    console.error('Error Details:', error);
  }
  console.log('=====================\n');
} 