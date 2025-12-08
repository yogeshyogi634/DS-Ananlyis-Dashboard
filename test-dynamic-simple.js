/**
 * Simple test for dynamic analysis using curl command
 * This demonstrates the expected missing elements from your UAT form
 */

// Sample UAT form elements for testing
const testPayload = {
  "designSystemId": "elara-ds-1",
  "frameId": "uat-param-frame-test", 
  "frameName": "UAT Parameter VPA Form",
  "figmaElements": [
    // Tab navigation - MISSING COMPONENT
    {
      "id": "nav-1",
      "name": "UAT Parameter Tab",
      "type": "TEXT",
      "style": {
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": 500
      },
      "fills": [{"type": "SOLID", "color": {"r": 0.1, "g": 0.2, "b": 0.8, "a": 1}}]
    },
    // Section header - MISSING TYPOGRAPHY  
    {
      "id": "header-1",
      "name": "Incoming IP Addresses",
      "type": "TEXT",
      "style": {
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": 600
      },
      "fills": [{"type": "SOLID", "color": {"r": 0.15, "g": 0.15, "b": 0.15, "a": 1}}]
    },
    // IP dropdown - MISSING COMPONENT
    {
      "id": "ip-dropdown-1", 
      "name": "IPv4 Dropdown",
      "type": "FRAME",
      "fills": [{"type": "SOLID", "color": {"r": 0.94, "g": 0.95, "b": 0.96, "a": 1}}]
    },
    // Mode card - MISSING COMPONENT
    {
      "id": "mode-online",
      "name": "Online Mode Card", 
      "type": "FRAME",
      "fills": [{"type": "SOLID", "color": {"r": 0.97, "g": 0.98, "b": 0.99, "a": 1}}]
    },
    // Small stats text - MISSING TYPOGRAPHY
    {
      "id": "stats-text",
      "name": "Positive: 4",
      "type": "TEXT",
      "style": {
        "fontFamily": "Inter", 
        "fontSize": 11,
        "fontWeight": 400
      },
      "fills": [{"type": "SOLID", "color": {"r": 0.4, "g": 0.4, "b": 0.4, "a": 1}}]
    },
    // Flag radio group - MISSING COMPONENT
    {
      "id": "flag-group",
      "name": "Credit line flag Group",
      "type": "FRAME", 
      "fills": [{"type": "SOLID", "color": {"r": 0.98, "g": 0.98, "b": 0.99, "a": 1}}]
    },
    // Missing border color
    {
      "id": "border",
      "name": "Section Border",
      "type": "FRAME",
      "strokes": [{"type": "SOLID", "color": {"r": 0.85, "g": 0.87, "b": 0.89, "a": 1}}]
    }
  ]
};

console.log('🧪 Dynamic Analysis Test Data');
console.log('============================');
console.log('');
console.log('📤 Test payload created with:');
console.log(`   - ${testPayload.figmaElements.length} Figma elements`);
console.log(`   - Frame: ${testPayload.frameName}`);
console.log(`   - Design System: ${testPayload.designSystemId}`);
console.log('');

console.log('🔬 Expected Missing Elements:');
console.log('');
console.log('🔴 Missing Components:');
console.log('   1. Tab Navigation (UAT Parameter Tab)');
console.log('   2. IP Address Dropdown (IPv4 Dropdown)'); 
console.log('   3. Mode Selection Card (Online Mode Card)');
console.log('   4. Flag Option Group (Credit line flag Group)');
console.log('');

console.log('🟠 Missing Colors:');
console.log('   1. Dropdown Background (#f0f2f5)');
console.log('   2. Card Background (#f7f8f9)');
console.log('   3. Section Background (#fafbfc)');
console.log('   4. Border Color (#d9dde0)');
console.log('');

console.log('🟣 Missing Typography:');
console.log('   1. Inter 14px 600 (Section headers)');
console.log('   2. Inter 11px 400 (Stats/helper text)');
console.log('   3. Inter 14px 500 (Tab text)');
console.log('');

console.log('💻 To test this, run:');
console.log('');
console.log('1. Start your backend server:');
console.log('   cd backend && npm run dev');
console.log('');
console.log('2. Use the updated Figma plugin:');
console.log('   - Copy manifest-dynamic.json to manifest.json');
console.log('   - Use code-dynamic.js as your main plugin code');
console.log('   - Run the plugin on your UAT Parameter VPA frame');
console.log('');
console.log('3. Or test with curl:');
console.log(`   curl -X POST http://localhost:3001/api/analysis \\`);
console.log(`     -H "Content-Type: application/json" \\`);
console.log(`     -d '${JSON.stringify(testPayload)}'`);
console.log('');

console.log('📊 After analysis, check the dashboard at:');
console.log('   http://localhost:5173');
console.log('');
console.log('✅ You should now see the missing elements from your UAT form!');

// Export for use in other files
if (typeof module !== 'undefined') {
  module.exports = { testPayload };
}