console.log("Minimal test plugin starting...");

figma.showUI(`
<html>
<head><title>Test</title></head>
<body style="padding: 20px; font-family: Arial, sans-serif;">
  <h1>🎉 Plugin Working!</h1>
  <p>This proves the plugin is loading correctly.</p>
  <button onclick="parent.postMessage({pluginMessage: {type: 'close'}}, '*')" 
          style="padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 4px;">
    Close
  </button>
</body>
</html>
`, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

console.log("Minimal test plugin loaded successfully");