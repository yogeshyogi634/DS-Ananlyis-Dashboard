// Figma Plugin Main Code
console.log("Design System Analytics Plugin Loaded");

// Design System Cache
let designSystemCache = {
  components: new Set(),
  colors: new Set(),
  textStyles: new Set(),
  loaded: false
};

// Show the plugin UI
figma.showUI(__html__, { width: 320, height: 500 });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  console.log("Received message:", msg);

  if (msg.type === 'analyze-frame') {
    await analyzeCurrentFrame();
  } else if (msg.type === 'analyze-selection') {
    await analyzeSelection();
  } else if (msg.type === 'get-design-systems') {
    await getAvailableDesignSystems();
  } else if (msg.type === 'show-design-system-assets') {
    await showDesignSystemAssets();
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

async function analyzeCurrentFrame() {
  try {
    const currentPage = figma.currentPage;
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select a frame or component to analyze'
      });
      return;
    }

    const selectedNode = selection[0];
    
    if (selectedNode.type !== 'FRAME' && selectedNode.type !== 'COMPONENT') {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select a frame or component to analyze'
      });
      return;
    }

    figma.ui.postMessage({
      type: 'analysis-started',
      message: 'Starting analysis...'
    });

    const analysisData = await analyzeNode(selectedNode);
    
    figma.ui.postMessage({
      type: 'analysis-complete',
      data: Object.assign({
        frameId: selectedNode.id,
        frameName: selectedNode.name
      }, analysisData)
    });

  } catch (error) {
    console.error('Error analyzing frame:', error);
    figma.ui.postMessage({
      type: 'error',
      message: 'Error analyzing frame: ' + error.message
    });
  }
}

async function analyzeSelection() {
  try {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select elements to analyze'
      });
      return;
    }

    figma.ui.postMessage({
      type: 'analysis-started',
      message: 'Analyzing selection...'
    });

    let totalAnalysis = {
      totalElements: 0,
      dsCompliantElements: 0,
      componentUsages: {},
      colorUsages: {},
      typographyUsages: {}
    };

    for (const node of selection) {
      const nodeAnalysis = await analyzeNode(node);
      mergeAnalysisData(totalAnalysis, nodeAnalysis);
    }

    // Calculate compliance percentage for merged analysis
    totalAnalysis.compliancePercentage = totalAnalysis.totalElements > 0 ? 
      (totalAnalysis.dsCompliantElements / totalAnalysis.totalElements) * 100 : 0;

    figma.ui.postMessage({
      type: 'analysis-complete',
      data: Object.assign({
        frameId: 'selection',
        frameName: 'Selected Elements'
      }, totalAnalysis)
    });

  } catch (error) {
    console.error('Error analyzing selection:', error);
    figma.ui.postMessage({
      type: 'error',
      message: 'Error analyzing selection: ' + error.message
    });
  }
}

async function analyzeNode(node) {
  const analysis = {
    totalElements: 0,
    dsCompliantElements: 0,
    componentUsages: {},
    colorUsages: {},
    typographyUsages: {}
  };

  // Use the same traverseNode logic for both frames and other nodes
  await traverseNode(node, analysis);
  
  return Object.assign(analysis, {
    compliancePercentage: analysis.totalElements > 0 ? 
      (analysis.dsCompliantElements / analysis.totalElements) * 100 : 0
  });
}

async function traverseNode(node, analysis) {
  // Check if node is a component instance - this is what we use for compliance calculation
  if (node.type === 'INSTANCE') {
    try {
      const mainComponent = await node.getMainComponentAsync();
      if (mainComponent && node.visible !== false) {
        // Count this as a total component for compliance calculation
        analysis.totalElements++;
        console.log(`Counting component: ${node.name} (${node.type})`);
        
        const componentKey = mainComponent.key || mainComponent.id;
        const componentName = mainComponent.name;
        
        // Check if this component is specifically from Elara Design System
        const hasKey = !!mainComponent.key;
        
        // More comprehensive detection for Elara Design System components
        let isFromElaraDesignSystem = false;
        
        if (hasKey) {
          // Check if component name contains Elara-specific patterns
          const nameCheck = componentName.toLowerCase();
          const isElaraPattern = nameCheck.includes('sidebar') ||
                                nameCheck.includes('navbar') ||
                                nameCheck.includes('breadcrumb') ||
                                nameCheck.includes('radio') ||
                                nameCheck.includes('dropdown') ||
                                nameCheck.includes('button') ||
                                nameCheck.includes('input') ||
                                nameCheck.includes('field') ||
                                nameCheck.includes('form') ||
                                nameCheck.includes('text') ||
                                nameCheck.includes('label') ||
                                nameCheck.includes('elara') ||
                                nameCheck.includes('collapsed') ||
                                nameCheck.includes('expanded') ||
                                nameCheck.includes('master') ||
                                nameCheck.includes('state') ||
                                nameCheck.includes('primary') ||
                                nameCheck.includes('secondary') ||
                                nameCheck.includes('default');
          
          // Also check if we're in the Elara Design System file
          const inElaraFile = figma.root.name.toLowerCase().includes('elara');
          
          // Component is from Elara if it matches patterns OR we're in the Elara file
          isFromElaraDesignSystem = isElaraPattern || inElaraFile;
        }
        
        const isFromDesignSystem = isFromElaraDesignSystem;
        
        console.log(`Analyzing component: ${componentName}, key: ${mainComponent.key}, isFromDesignSystem: ${isFromDesignSystem}`);
        
        if (isFromDesignSystem) {
          analysis.dsCompliantElements++;
        }
        
        if (!analysis.componentUsages[componentKey]) {
          analysis.componentUsages[componentKey] = {
            name: componentName,
            count: 0,
            isCompliant: isFromDesignSystem
          };
        }
        analysis.componentUsages[componentKey].count++;
        
        // Don't traverse children of instances to avoid double counting
        return;
      }
    } catch (error) {
      console.log('Could not get main component:', error);
      // Continue without component analysis for this node
    }
  }

  // Only analyze fills and text styles for non-instance nodes to avoid double counting
  if (node.type !== 'INSTANCE') {
    // Analyze fills (colors)
    if ('fills' in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID') {
          const colorKey = rgbToHex(fill.color);
          
          // Check if color is from design system (has bound variable, style, or matches design system colors)
          const hasStyleId = !!fill.styleId;
          const hasDesignSystemStyle = hasStyleId && designSystemCache.loaded && designSystemCache.colors.has(fill.styleId);
          const isFromDesignSystem = hasDesignSystemStyle || !!(fill.boundVariables && (fill.boundVariables.color || fill.boundVariables.opacity));
          
          if (!analysis.colorUsages[colorKey]) {
            analysis.colorUsages[colorKey] = {
              value: colorKey,
              count: 0,
              isCompliant: isFromDesignSystem
            };
          }
          analysis.colorUsages[colorKey].count++;
        }
      }
    }

    // Analyze text styles
    if (node.type === 'TEXT') {
      const textStyleKey = node.textStyleId || 'custom-text';
      const hasTextStyleId = !!node.textStyleId;
      const hasDesignSystemTextStyle = hasTextStyleId && designSystemCache.loaded && designSystemCache.textStyles.has(node.textStyleId);
      const isFromDesignSystem = hasDesignSystemTextStyle;
      
      if (!analysis.typographyUsages[textStyleKey]) {
        analysis.typographyUsages[textStyleKey] = {
          styleId: textStyleKey,
          fontSize: node.fontSize ? node.fontSize.toString() : 'mixed',
          fontName: typeof node.fontName === 'object' ? 
            `${node.fontName.family}-${node.fontName.style}` : 
            'mixed',
          count: 0,
          isCompliant: isFromDesignSystem
        };
      }
      analysis.typographyUsages[textStyleKey].count++;
    }
  }

  // Recursively analyze children
  if ('children' in node) {
    for (const child of node.children) {
      await traverseNode(child, analysis);
    }
  }
}

function mergeAnalysisData(total, nodeAnalysis) {
  total.totalElements += nodeAnalysis.totalElements;
  total.dsCompliantElements += nodeAnalysis.dsCompliantElements;
  
  // Merge component usages
  for (const [key, value] of Object.entries(nodeAnalysis.componentUsages)) {
    if (!total.componentUsages[key]) {
      total.componentUsages[key] = Object.assign({}, value, { count: 0 });
    }
    total.componentUsages[key].count += value.count;
  }
  
  // Merge color usages
  for (const [key, value] of Object.entries(nodeAnalysis.colorUsages)) {
    if (!total.colorUsages[key]) {
      total.colorUsages[key] = Object.assign({}, value, { count: 0 });
    }
    total.colorUsages[key].count += value.count;
  }
  
  // Merge typography usages
  for (const [key, value] of Object.entries(nodeAnalysis.typographyUsages)) {
    if (!total.typographyUsages[key]) {
      total.typographyUsages[key] = Object.assign({}, value, { count: 0 });
    }
    total.typographyUsages[key].count += value.count;
  }
}

function rgbToHex(rgb) {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

async function loadDesignSystemData() {
  try {
    console.log("Loading design system data...");
    console.log("Current file name:", figma.root.name);
    
    // Get all local components (from the design system file if it's open)
    const localComponents = figma.root.findAll(node => node.type === 'COMPONENT');
    const localComponentSets = figma.root.findAll(node => node.type === 'COMPONENT_SET');
    
    console.log(`Found ${localComponents.length} components and ${localComponentSets.length} component sets`);
    
    // Cache component keys and names
    designSystemCache.components.clear();
    
    localComponents.forEach(comp => {
      // Cache all components from the design system file, not just those with keys
      designSystemCache.components.add(comp.key || comp.id);
      designSystemCache.components.add(comp.id);
      designSystemCache.components.add(comp.name);
      console.log(`Cached DS component: ${comp.name} (key: ${comp.key || 'no key'}, id: ${comp.id})`);
    });
    
    localComponentSets.forEach(compSet => {
      if (compSet.key) {
        designSystemCache.components.add(compSet.key);
        designSystemCache.components.add(compSet.id);
        designSystemCache.components.add(compSet.name);
      }
      // Also add child components
      compSet.children.forEach(child => {
        if (child.type === 'COMPONENT' && child.key) {
          designSystemCache.components.add(child.key);
          designSystemCache.components.add(child.id);
          designSystemCache.components.add(child.name);
        }
      });
    });
    
    // Cache local styles
    designSystemCache.colors.clear();
    designSystemCache.textStyles.clear();
    
    // Get local paint styles (colors)
    const localPaintStyles = figma.getLocalPaintStyles();
    localPaintStyles.forEach(style => {
      designSystemCache.colors.add(style.id);
      designSystemCache.colors.add(style.name);
    });
    
    // Get local text styles
    const localTextStyles = figma.getLocalTextStyles();
    localTextStyles.forEach(style => {
      designSystemCache.textStyles.add(style.id);
      designSystemCache.textStyles.add(style.name);
    });
    
    designSystemCache.loaded = true;
    
    console.log(`Loaded design system: ${designSystemCache.components.size} components, ${designSystemCache.colors.size} colors, ${designSystemCache.textStyles.size} text styles`);
    console.log('Design system components:', Array.from(designSystemCache.components));
    
  } catch (error) {
    console.error("Error loading design system data:", error);
  }
}

async function showDesignSystemAssets() {
  try {
    await loadDesignSystemData();
    
    // Get detailed information about all assets
    const localComponents = figma.root.findAll(node => node.type === 'COMPONENT');
    const localComponentSets = figma.root.findAll(node => node.type === 'COMPONENT_SET');
    const localPaintStyles = figma.getLocalPaintStyles();
    const localTextStyles = figma.getLocalTextStyles();
    
    const assetsData = {
      components: localComponents.map(comp => ({
        id: comp.id,
        key: comp.key,
        name: comp.name,
        type: 'COMPONENT',
        description: comp.description || ''
      })),
      componentSets: localComponentSets.map(compSet => ({
        id: compSet.id,
        key: compSet.key,
        name: compSet.name,
        type: 'COMPONENT_SET',
        childrenCount: compSet.children.length,
        children: compSet.children.map(child => ({
          id: child.id,
          key: child.key,
          name: child.name
        }))
      })),
      colors: localPaintStyles.map(style => ({
        id: style.id,
        name: style.name,
        type: 'COLOR',
        description: style.description || ''
      })),
      textStyles: localTextStyles.map(style => ({
        id: style.id,
        name: style.name,
        type: 'TEXT_STYLE',
        description: style.description || ''
      }))
    };
    
    figma.ui.postMessage({
      type: 'design-system-assets-loaded',
      data: assetsData
    });
    
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Error loading design system assets: ' + error.message
    });
  }
}

async function getAvailableDesignSystems() {
  try {
    // Force load design system data 
    await loadDesignSystemData();
    
    figma.ui.postMessage({
      type: 'design-systems-loaded',
      data: [
        {
          id: '1',  // Use correct design system ID
          name: 'Elara Design System',
          figmaFileId: 'P3AoC4JoQOlEoKRRKhwGLx',
          componentsCount: designSystemCache.components.size,
          colorsCount: designSystemCache.colors.size,
          textStylesCount: designSystemCache.textStyles.size
        }
      ]
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Error loading design systems: ' + error.message
    });
  }
}

// Initialize the plugin
async function initializePlugin() {
  try {
    await loadDesignSystemData();
    figma.ui.postMessage({
      type: 'plugin-loaded',
      message: 'Plugin loaded successfully'
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'plugin-loaded',
      message: 'Plugin loaded successfully'
    });
  }
}

initializePlugin();