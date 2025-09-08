/**
 * Password Hash Generator
 * Generates SHA-256 hashes that match the admin service implementation
 * Run this in browser console to get correct password hashes
 */

async function generatePasswordHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'cebu_tourist_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate hashes for default passwords
(async () => {
  console.log('Generating password hashes...');
  
  const admin123Hash = await generatePasswordHash('admin123');
  const manager123Hash = await generatePasswordHash('manager123');
  
  console.log('admin123 hash:', admin123Hash);
  console.log('manager123 hash:', manager123Hash);
  
  console.log('\nSQL for admin users:');
  console.log(`-- admin@cebutourist.com (password: admin123)`);
  console.log(`'${admin123Hash}'`);
  console.log(`-- manager@cebutourist.com (password: manager123)`);
  console.log(`'${manager123Hash}'`);
})();
