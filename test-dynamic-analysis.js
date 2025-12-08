/**
 * Test the dynamic analysis system end-to-end
 * This simulates sending raw Figma elements from your UAT form to the backend
 */

// Simulate the raw Figma elements from your UAT Parameter VPA form
const uatFormFigmaElements = [
  // Navigation tabs - MISSING COMPONENT
  {
    id: "nav-1",
    name: "UAT Parameter Tab",
    type: "TEXT",
    depth: 1,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 500,
      textAlignHorizontal: "CENTER"
    },
    fills: [{ type: "SOLID", color: { r: 0.1, g: 0.2, b: 0.8, a: 1 } }],
    absoluteBoundingBox: { x: 100, y: 50, width: 120, height: 30 }
  },
  
  {
    id: "nav-2", 
    name: "Production Tab",
    type: "TEXT",
    depth: 1,
    visible: true,
    opacity: 0.6,
    style: {
      fontFamily: "Inter", 
      fontSize: 14,
      fontWeight: 400,
      textAlignHorizontal: "CENTER"
    },
    fills: [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4, a: 1 } }],
    absoluteBoundingBox: { x: 220, y: 50, width: 120, height: 30 }
  },

  // Form labels - MISSING TYPOGRAPHY
  {
    id: "label-1",
    name: "Callback URL",
    type: "TEXT",
    depth: 2,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: 500,
      textAlignHorizontal: "LEFT"
    },
    fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }],
    characters: "Callback URL",
    absoluteBoundingBox: { x: 50, y: 100, width: 80, height: 16 }
  },

  {
    id: "label-2",
    name: "VPA",
    type: "TEXT", 
    depth: 2,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: 500,
      textAlignHorizontal: "LEFT"
    },
    fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }],
    characters: "VPA",
    absoluteBoundingBox: { x: 350, y: 100, width: 30, height: 16 }
  },

  // Input fields - Some might match design system
  {
    id: "input-1",
    name: "Callback URL Input",
    type: "FRAME",
    depth: 2,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    strokes: [{ type: "SOLID", color: { r: 0.82, g: 0.85, b: 0.89, a: 1 } }],
    absoluteBoundingBox: { x: 50, y: 120, width: 250, height: 36 }
  },

  // Section headers - MISSING TYPOGRAPHY
  {
    id: "header-1",
    name: "Incoming IP Addresses",
    type: "TEXT",
    depth: 1,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 600,
      textAlignHorizontal: "LEFT"
    },
    fills: [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15, a: 1 } }],
    characters: "Incoming IP Addresses",
    absoluteBoundingBox: { x: 50, y: 200, width: 180, height: 20 }
  },

  // IP Address dropdown - MISSING COMPONENT
  {
    id: "ip-dropdown-1",
    name: "IPv4 Dropdown",
    type: "FRAME",
    depth: 3,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 0.94, g: 0.95, b: 0.96, a: 1 } }],
    strokes: [{ type: "SOLID", color: { r: 0.82, g: 0.85, b: 0.89, a: 1 } }],
    absoluteBoundingBox: { x: 50, y: 240, width: 80, height: 36 }
  },

  // IP input field
  {
    id: "ip-input-1",
    name: "IP Address Input",
    type: "FRAME",
    depth: 3,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    strokes: [{ type: "SOLID", color: { r: 0.82, g: 0.85, b: 0.89, a: 1 } }],
    absoluteBoundingBox: { x: 140, y: 240, width: 160, height: 36 }
  },

  // Transaction Handling section - MISSING COMPONENT
  {
    id: "transaction-header",
    name: "Transaction Handling Configuration",
    type: "TEXT",
    depth: 1,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 600,
      textAlignHorizontal: "LEFT"
    },
    fills: [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15, a: 1 } }],
    characters: "Transaction Handling Configuration",
    absoluteBoundingBox: { x: 50, y: 320, width: 280, height: 20 }
  },

  // Mode toggle cards - MISSING COMPONENT
  {
    id: "mode-online",
    name: "Online Mode Card",
    type: "FRAME",
    depth: 2,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 0.97, g: 0.98, b: 0.99, a: 1 } }],
    strokes: [{ type: "SOLID", color: { r: 0.85, g: 0.87, b: 0.89, a: 1 } }],
    absoluteBoundingBox: { x: 50, y: 400, width: 120, height: 80 }
  },

  {
    id: "mode-online-title",
    name: "Online",
    type: "TEXT",
    depth: 3,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 13,
      fontWeight: 500,
      textAlignHorizontal: "CENTER"
    },
    fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }],
    characters: "Online",
    absoluteBoundingBox: { x: 90, y: 410, width: 40, height: 16 }
  },

  // Stats text - MISSING TYPOGRAPHY
  {
    id: "mode-stats-1",
    name: "Positive: 4",
    type: "TEXT",
    depth: 3,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 11,
      fontWeight: 400,
      textAlignHorizontal: "LEFT"
    },
    fills: [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4, a: 1 } }],
    characters: "Positive: 4",
    absoluteBoundingBox: { x: 60, y: 430, width: 60, height: 14 }
  },

  // Flag option groups - MISSING COMPONENT
  {
    id: "flag-group-1",
    name: "Credit line (CL) flag Group",
    type: "FRAME",
    depth: 2,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.99, a: 1 } }],
    absoluteBoundingBox: { x: 50, y: 600, width: 200, height: 40 }
  },

  {
    id: "flag-label-1",
    name: "Credit line (CL) flag:",
    type: "TEXT",
    depth: 3,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: 400,
      textAlignHorizontal: "LEFT"
    },
    fills: [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3, a: 1 } }],
    characters: "Credit line (CL) flag:",
    absoluteBoundingBox: { x: 60, y: 610, width: 120, height: 16 }
  },

  // Radio buttons for flags
  {
    id: "radio-yes-1",
    name: "Yes Radio",
    type: "FRAME",
    depth: 3,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    strokes: [{ type: "SOLID", color: { r: 0.75, g: 0.75, b: 0.75, a: 1 } }],
    absoluteBoundingBox: { x: 180, y: 610, width: 16, height: 16 }
  },

  // Save button - might match design system
  {
    id: "save-btn",
    name: "Save Button",
    type: "FRAME",
    depth: 1,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 0.26, g: 0.4, b: 0.9, a: 1 } }],
    absoluteBoundingBox: { x: 50, y: 700, width: 100, height: 40 }
  },

  {
    id: "save-text",
    name: "Save",
    type: "TEXT",
    depth: 2,
    visible: true,
    opacity: 1,
    style: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 500,
      textAlignHorizontal: "CENTER"
    },
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    characters: "Save",
    absoluteBoundingBox: { x: 85, y: 710, width: 30, height: 20 }
  },

  // Additional missing colors
  {
    id: "section-bg-1",
    name: "Section Background",
    type: "FRAME",
    depth: 1,
    visible: true,
    opacity: 1,
    fills: [{ type: "SOLID", color: { r: 0.97, g: 0.98, b: 0.99, a: 1 } }],
    absoluteBoundingBox: { x: 40, y: 190, width: 320, height: 100 }
  },

  {
    id: "border-element",
    name: "Border Element",
    type: "FRAME",
    depth: 1,
    visible: true,
    opacity: 1,
    fills: [],
    strokes: [{ type: "SOLID", color: { r: 0.85, g: 0.87, b: 0.89, a: 1 } }],
    absoluteBoundingBox: { x: 40, y: 300, width: 320, height: 1 }
  }
];

// Function to test the API call
async function testDynamicAnalysis() {
  console.log('🧪 Testing Dynamic Analysis System');
  console.log('=================================');
  
  const payload = {
    designSystemId: 'elara-ds-1',
    frameId: 'uat-param-frame-test',
    frameName: 'UAT Parameter VPA Form (Test)',
    figmaElements: uatFormFigmaElements
  };
  
  console.log(`📤 Sending ${uatFormFigmaElements.length} Figma elements for analysis...`);
  
  try {
    const response = await fetch('http://localhost:3001/api/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Analysis completed successfully!');
    console.log('');
    console.log('📊 Results:');
    console.log(`   Total Elements: ${result.analysis.totalElements}`);
    console.log(`   DS Compliant: ${result.analysis.dsCompliantElements}`);
    console.log(`   Compliance: ${result.analysis.compliancePercentage.toFixed(1)}%`);
    console.log('');
    
    if (result.missingElements) {
      console.log('🔴 Missing Components:', result.missingElements.missingComponents?.length || 0);
      result.missingElements.missingComponents?.forEach((comp, i) => {
        console.log(`   ${i + 1}. ${comp.name} (${comp.type}) - ${comp.count} instances`);
      });
      console.log('');
      
      console.log('🟠 Missing Colors:', result.missingElements.missingColors?.length || 0);
      result.missingElements.missingColors?.forEach((color, i) => {
        console.log(`   ${i + 1}. ${color.name || 'Unnamed'} (${color.value}) - ${color.count} uses`);
      });
      console.log('');
      
      console.log('🟣 Missing Typography:', result.missingElements.missingTypography?.length || 0);
      result.missingElements.missingTypography?.forEach((typo, i) => {
        console.log(`   ${i + 1}. ${typo.fontFamily} ${typo.fontSize} ${typo.fontWeight} - ${typo.count} instances`);
      });
      console.log('');
      
      if (result.missingElements.suggestions?.length > 0) {
        console.log('💡 Suggestions:');
        result.missingElements.suggestions.forEach((suggestion, i) => {
          console.log(`   ${i + 1}. ${suggestion}`);
        });
      }
    }
    
    console.log('');
    console.log('🎯 Test completed! The system should now show these missing elements in the dashboard.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Make sure:');
    console.log('   1. Backend server is running (npm run dev in backend/)');
    console.log('   2. MongoDB is connected');
    console.log('   3. API is accessible at http://localhost:3001');
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = await import('node-fetch').then(m => m.default);
  global.fetch = fetch;
  testDynamicAnalysis();
}

export { uatFormFigmaElements, testDynamicAnalysis };