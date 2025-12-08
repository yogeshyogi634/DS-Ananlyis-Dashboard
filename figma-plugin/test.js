// Minimal test plugin
console.log("Test plugin starting...");

figma.showUI(`
<div style="padding: 20px; font-family: sans-serif;">
  <h2>🎨 Test Plugin Working!</h2>
  <p>Plugin is loaded successfully.</p>
  <button onclick="parent.postMessage({pluginMessage: {type: 'close'}}, '*')" 
          style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
    Close
  </button>
</div>
`, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

console.log("Test plugin setup complete");