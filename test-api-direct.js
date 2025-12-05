import http from 'http';

// Direct API test - bypasses Figma plugin
const testAnalysisAPI = () => {
  const testData = {
    designSystemId: 'elara-ds-1',
    frameId: 'test-frame-123',
    frameName: 'UAT Parameter VPA Test',
    figmaElements: [
      // Tab navigation - should be detected as missing
      {
        id: 'nav-tab-1',
        name: 'UAT Parameter Tab',
        type: 'TEXT',
        visible: true,
        opacity: 1,
        style: {
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 500
        },
        fills: [{ 
          type: 'SOLID', 
          color: { r: 0.1, g: 0.3, b: 0.8, a: 1 }
        }]
      },
      
      // Section header with missing typography
      {
        id: 'section-header-1',
        name: 'Incoming IP Addresses',
        type: 'TEXT', 
        visible: true,
        opacity: 1,
        style: {
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 600 // This weight might not be in design system
        },
        fills: [{ 
          type: 'SOLID', 
          color: { r: 0.15, g: 0.15, b: 0.15, a: 1 }
        }],
        characters: 'Incoming IP Addresses'
      },
      
      // Custom dropdown component - should be missing
      {
        id: 'custom-dropdown-1', 
        name: 'IPv4 Custom Dropdown',
        type: 'FRAME',
        visible: true,
        opacity: 1,
        fills: [{ 
          type: 'SOLID', 
          color: { r: 0.94, g: 0.95, b: 0.96, a: 1 } // Custom color
        }],
        absoluteBoundingBox: { x: 100, y: 200, width: 120, height: 36 }
      },
      
      // Mode selection card - custom component
      {
        id: 'mode-card-1',
        name: 'Online Mode Selection Card', 
        type: 'FRAME',
        visible: true,
        opacity: 1,
        fills: [{ 
          type: 'SOLID', 
          color: { r: 0.97, g: 0.98, b: 0.99, a: 1 } // Custom background
        }],
        absoluteBoundingBox: { x: 50, y: 300, width: 140, height: 80 }
      },
      
      // Small stats text with custom typography
      {
        id: 'stats-text-1',
        name: 'Positive: 4',
        type: 'TEXT',
        visible: true,
        opacity: 1,
        style: {
          fontFamily: 'Inter',
          fontSize: 11, // Small size that might not be in design system
          fontWeight: 400
        },
        fills: [{ 
          type: 'SOLID', 
          color: { r: 0.4, g: 0.4, b: 0.4, a: 1 }
        }],
        characters: 'Positive: 4'
      },
      
      // Flag radio group - custom component
      {
        id: 'flag-group-1',
        name: 'Credit Line Flag Group',
        type: 'FRAME',
        visible: true,
        opacity: 1,
        fills: [{ 
          type: 'SOLID', 
          color: { r: 0.98, g: 0.98, b: 0.99, a: 1 }
        }],
        absoluteBoundingBox: { x: 50, y: 500, width: 250, height: 40 }
      },
      
      // Border element with custom stroke color
      {
        id: 'border-1',
        name: 'Section Border',
        type: 'FRAME',
        visible: true,
        opacity: 1,
        fills: [],
        strokes: [{ 
          type: 'SOLID', 
          color: { r: 0.85, g: 0.87, b: 0.89, a: 1 } // Custom border color
        }],
        absoluteBoundingBox: { x: 40, y: 250, width: 300, height: 1 }
      }
    ]
  };

  const postData = JSON.stringify(testData);

  console.log('🧪 Testing Analysis API Directly');
  console.log('================================');
  console.log(`📤 Sending ${testData.figmaElements.length} test elements to backend...`);
  console.log('');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/analysis',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log('📋 Response Headers:', res.headers);
    console.log('');

    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        
        if (res.statusCode === 201) {
          console.log('✅ Analysis completed successfully!');
          console.log('');
          console.log('📊 Analysis Results:');
          console.log(`   Analysis ID: ${result.analysis?.id}`);
          console.log(`   Total Elements: ${result.analysis?.totalElements || 0}`);
          console.log(`   DS Compliant: ${result.analysis?.dsCompliantElements || 0}`);
          console.log(`   Compliance: ${(result.analysis?.compliancePercentage || 0).toFixed(1)}%`);
          console.log('');
          
          if (result.missingElements) {
            console.log('🔍 Missing Elements Found:');
            console.log(`   Components: ${result.missingElements.missingComponents?.length || 0}`);
            console.log(`   Colors: ${result.missingElements.missingColors?.length || 0}`);
            console.log(`   Typography: ${result.missingElements.missingTypography?.length || 0}`);
            console.log('');
            
            if (result.missingElements.missingComponents?.length > 0) {
              console.log('🔴 Missing Components:');
              result.missingElements.missingComponents.forEach((comp, i) => {
                console.log(`   ${i + 1}. ${comp.name} (${comp.type || 'component'}) - ${comp.count || 1} instances`);
              });
              console.log('');
            }
            
            if (result.missingElements.missingColors?.length > 0) {
              console.log('🟠 Missing Colors:');
              result.missingElements.missingColors.forEach((color, i) => {
                console.log(`   ${i + 1}. ${color.name || 'Unnamed'} (${color.value}) - ${color.count || 1} uses`);
              });
              console.log('');
            }
            
            if (result.missingElements.missingTypography?.length > 0) {
              console.log('🟣 Missing Typography:');
              result.missingElements.missingTypography.forEach((typo, i) => {
                console.log(`   ${i + 1}. ${typo.fontFamily} ${typo.fontSize} weight:${typo.fontWeight} - ${typo.count || 1} uses`);
              });
              console.log('');
            }
          } else {
            console.log('⚠️  No missing elements data in response');
          }
          
          console.log('🎯 If you see missing elements above, the backend is working correctly!');
          console.log('📱 Check your frontend dashboard to see if they appear there.');
          
        } else {
          console.log('❌ Error response:', result);
        }
        
      } catch (error) {
        console.log('❌ Failed to parse response:', responseData);
        console.log('Error:', error.message);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Request failed:', e.message);
    console.log('');
    console.log('🔧 Make sure:');
    console.log('   1. Backend server is running: cd backend && npm run dev');
    console.log('   2. Server is accessible on http://localhost:3001');
    console.log('   3. No firewall blocking the connection');
  });

  req.write(postData);
  req.end();
};

// Run the test
testAnalysisAPI();