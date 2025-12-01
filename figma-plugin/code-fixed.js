console.log("Fixed Design System Analytics Plugin Starting...");

// Self-contained UI to avoid file loading issues
const uiHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DS Analytics - Working</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 16px;
      background: #f0f0f0;
      font-size: 14px;
    }
    
    .container {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h1 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }
    
    button {
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .btn-primary {
      background: #0066cc;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0052a3;
    }
    
    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
    }
    
    .status {
      padding: 12px;
      margin: 12px 0;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
    }
    
    .status-success { background: #d4edda; color: #155724; }
    .status-error { background: #f8d7da; color: #721c24; }
    .status-info { background: #d1ecf1; color: #0c5460; }
    
    .results {
      margin-top: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    
    .compliance-score {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin: 16px 0;
    }
    
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 DS Analytics (Fixed)</h1>
    <div id="status" class="status status-info">
      Plugin loaded! Select a frame and click analyze.
    </div>
    
    <button id="testBtn" class="btn-primary">
      Test Analysis
    </button>
    
    <button id="closeBtn" class="btn-secondary">
      Close Plugin
    </button>
    
    <div id="results" class="results hidden">
      <h3>Analysis Results</h3>
      <div id="complianceScore" class="compliance-score">--</div>
      <div class="metric">
        <span>Frame:</span>
        <span id="frameName">--</span>
      </div>
      <div class="metric">
        <span>Total Elements:</span>
        <span id="totalElements">--</span>
      </div>
      <div class="metric">
        <span>Compliant:</span>
        <span id="compliantElements">--</span>
      </div>
    </div>
  </div>

  <script>
    const testBtn = document.getElementById('testBtn');
    const closeBtn = document.getElementById('closeBtn');
    const status = document.getElementById('status');
    const results = document.getElementById('results');
    const complianceScore = document.getElementById('complianceScore');
    const frameName = document.getElementById('frameName');
    const totalElements = document.getElementById('totalElements');
    const compliantElements = document.getElementById('compliantElements');
    
    testBtn.addEventListener('click', () => {
      status.textContent = 'Analyzing...';
      status.className = 'status status-info';
      results.classList.add('hidden');
      
      parent.postMessage({ 
        pluginMessage: { type: 'test-analysis' } 
      }, '*');
    });
    
    closeBtn.addEventListener('click', () => {
      parent.postMessage({ 
        pluginMessage: { type: 'close' } 
      }, '*');
    });
    
    window.onmessage = (event) => {
      const { type, data, message } = event.data.pluginMessage;
      
      console.log('UI received:', type, data);
      
      switch (type) {
        case 'plugin-loaded':
          status.textContent = message;
          status.className = 'status status-success';
          break;
          
        case 'analysis-complete':
          status.textContent = 'Analysis complete!';
          status.className = 'status status-success';
          
          complianceScore.textContent = data.compliancePercentage.toFixed(1) + '%';
          complianceScore.style.color = data.compliancePercentage >= 70 ? '#28a745' : '#dc3545';
          
          frameName.textContent = data.frameName;
          totalElements.textContent = data.totalElements;
          compliantElements.textContent = data.dsCompliantElements;
          
          results.classList.remove('hidden');
          break;
          
        case 'error':
          status.textContent = message;
          status.className = 'status status-error';
          results.classList.add('hidden');
          break;
      }
    };
    
    console.log('UI script loaded');
  </script>
</body>
</html>
`;

figma.showUI(uiHTML, { 
  width: 300, 
  height: 450,
  themeColors: true 
});

// Test message
figma.ui.postMessage({
  type: 'plugin-loaded',
  message: 'Plugin loaded successfully!'
});

// Listen for UI messages
figma.ui.onmessage = (msg) => {
  console.log("Received message:", msg);
  
  if (msg.type === 'test-analysis') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select a frame or element to analyze'
      });
      return;
    }
    
    // Mock analysis data
    const mockAnalysis = {
      frameId: selection[0].id,
      frameName: selection[0].name,
      totalElements: Math.floor(Math.random() * 50) + 10,
      dsCompliantElements: Math.floor(Math.random() * 30) + 5
    };
    
    mockAnalysis.compliancePercentage = 
      (mockAnalysis.dsCompliantElements / mockAnalysis.totalElements) * 100;
    
    figma.ui.postMessage({
      type: 'analysis-complete',
      data: mockAnalysis
    });
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

console.log("Plugin setup complete");