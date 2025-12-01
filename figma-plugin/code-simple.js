// Simple test version
console.log("Design System Analytics Plugin Starting...");

// Show a simple UI
figma.showUI(__html__, { 
  width: 300, 
  height: 400,
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
    // Simple test analysis
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