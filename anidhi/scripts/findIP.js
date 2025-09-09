// Run this script to find your computer's IP address
// Usage: node scripts/findIP.js

const os = require('os');

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`\n🌐 Your computer's IP address: ${iface.address}`);
                console.log(`📱 Use this URL in your mobile app: http://${iface.address}:5000`);
                console.log(`\n📝 Update your API configuration with:`);
                console.log(`   const YOUR_COMPUTER_IP = '${iface.address}';`);
                return iface.address;
            }
        }
    }
    
    console.log('❌ Could not find a local IP address');
    return null;
}

getLocalIPAddress();
