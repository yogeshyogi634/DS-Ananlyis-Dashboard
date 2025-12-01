// Ultra simple working plugin
try {
  console.log("Plugin starting...");
  
  figma.showUI(`
    <div style="padding:20px;font-family:Arial;">
      <h2>✅ PLUGIN WORKS!</h2>
      <p>Success! The plugin is working correctly.</p>
      <button onclick="parent.postMessage({pluginMessage:{type:'test'}}, '*')" 
              style="padding:10px;background:#007ACC;color:white;border:none;border-radius:4px;">
        Test Button
      </button>
      <button onclick="parent.postMessage({pluginMessage:{type:'close'}}, '*')" 
              style="padding:10px;background:#666;color:white;border:none;border-radius:4px;margin-left:10px;">
        Close
      </button>
    </div>
  `, { width: 300, height: 180 });

  figma.ui.onmessage = (msg) => {
    console.log("Message received:", msg);
    
    if (msg.type === 'test') {
      figma.notify("Test button clicked! Plugin is working! 🎉");
    }
    
    if (msg.type === 'close') {
      figma.closePlugin();
    }
  };
  
  console.log("Plugin loaded successfully!");
  
} catch (error) {
  console.error("Plugin error:", error);
  figma.notify("Plugin error: " + error.message);
}