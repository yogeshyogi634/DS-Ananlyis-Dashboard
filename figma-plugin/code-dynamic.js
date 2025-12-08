// Enhanced Figma Plugin - Sends RAW Figma Elements for Dynamic Analysis
console.log("Design System Analytics Plugin with Dynamic Analysis Loaded");

// Show the plugin UI
figma.showUI(__html__, { width: 320, height: 500 });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  console.log("Received message:", msg);

  if (msg.type === 'analyze-frame') {
    await analyzeCurrentFrameDynamic();
  } else if (msg.type === 'analyze-selection') {
    await analyzeSelectionDynamic();
  } else if (msg.type === 'get-design-systems') {
    await getAvailableDesignSystems();
  } else if (msg.type === 'show-design-system-assets') {
    await showDesignSystemAssets();
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// NEW: Extract raw Figma elements for dynamic backend analysis
async function analyzeCurrentFrameDynamic() {
  try {
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
      message: 'Extracting Figma elements for dynamic analysis...'
    });

    // Extract raw Figma elements
    const figmaElements = await extractFigmaElements(selectedNode);
    
    console.log(`Extracted ${figmaElements.length} raw Figma elements for analysis`);

    figma.ui.postMessage({
      type: 'analysis-complete',
      data: {
        frameId: selectedNode.id,
        frameName: selectedNode.name,
        figmaElements: figmaElements, // Send raw elements for backend analysis
        totalElements: figmaElements.length,
        extractedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error extracting Figma elements:', error);
    figma.ui.postMessage({
      type: 'error',
      message: 'Error extracting elements: ' + error.message
    });
  }
}

// NEW: Extract raw Figma elements from selection
async function analyzeSelectionDynamic() {
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
      message: 'Extracting selected elements...'
    });

    let allElements = [];
    
    // Extract elements from each selected node
    for (const node of selection) {
      const elements = await extractFigmaElements(node);
      allElements.push(...elements);
    }

    console.log(`Extracted ${allElements.length} raw Figma elements from selection`);

    figma.ui.postMessage({
      type: 'analysis-complete',
      data: {
        frameId: 'selection',
        frameName: `Selection (${selection.length} items)`,
        figmaElements: allElements,
        totalElements: allElements.length,
        extractedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error extracting selection:', error);
    figma.ui.postMessage({
      type: 'error',
      message: 'Error extracting selection: ' + error.message
    });
  }
}

// NEW: Extract comprehensive Figma element data
async function extractFigmaElements(node) {
  const elements = [];
  
  async function traverse(currentNode, depth = 0) {
    // Skip invisible nodes
    if (currentNode.visible === false) return;
    
    // Extract element data
    const element = await extractElementData(currentNode, depth);
    if (element) {
      elements.push(element);
    }
    
    // Traverse children
    if ('children' in currentNode) {
      for (const child of currentNode.children) {
        await traverse(child, depth + 1);
      }
    }
  }
  
  await traverse(node);
  return elements;
}

// NEW: Extract detailed element data for analysis
async function extractElementData(node, depth) {
  try {
    const element = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth: depth,
      visible: node.visible,
      opacity: node.opacity || 1,
      absoluteBoundingBox: null,
      fills: [],
      strokes: [],
      effects: [],
      style: null,
      componentId: null,
      componentSetId: null,
      children: []
    };

    // Add bounding box if available
    if ('absoluteBoundingBox' in node && node.absoluteBoundingBox) {
      element.absoluteBoundingBox = {
        x: node.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y,
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height
      };
    }

    // Extract fills (colors/gradients)
    if ('fills' in node && node.fills) {
      element.fills = node.fills.map(fill => {
        if (fill.type === 'SOLID') {
          return {
            type: fill.type,
            color: {
              r: fill.color.r,
              g: fill.color.g,
              b: fill.color.b,
              a: fill.opacity || 1
            }
          };
        }
        return { type: fill.type };
      });
    }

    // Extract strokes
    if ('strokes' in node && node.strokes) {
      element.strokes = node.strokes.map(stroke => {
        if (stroke.type === 'SOLID') {
          return {
            type: stroke.type,
            color: {
              r: stroke.color.r,
              g: stroke.color.g,
              b: stroke.color.b,
              a: stroke.opacity || 1
            }
          };
        }
        return { type: stroke.type };
      });
    }

    // Extract text styles for TEXT nodes
    if (node.type === 'TEXT') {
      try {
        const textStyle = node.fontName ? {
          fontFamily: node.fontName.family,
          fontStyle: node.fontName.style,
          fontSize: node.fontSize,
          fontWeight: node.fontWeight || 400,
          textCase: node.textCase,
          textDecoration: node.textDecoration,
          lineHeight: node.lineHeight,
          letterSpacing: node.letterSpacing,
          textAlignHorizontal: node.textAlignHorizontal,
          textAlignVertical: node.textAlignVertical
        } : null;
        
        element.style = textStyle;
        element.characters = node.characters;
      } catch (error) {
        console.log('Could not extract text style for:', node.name);
      }
    }

    // Extract component information for INSTANCE nodes
    if (node.type === 'INSTANCE') {
      try {
        const mainComponent = await node.getMainComponentAsync();
        if (mainComponent) {
          element.componentId = mainComponent.id;
          element.componentSetId = mainComponent.parent?.type === 'COMPONENT_SET' ? mainComponent.parent.id : null;
          element.componentKey = mainComponent.key;
          element.componentName = mainComponent.name;
          element.componentDescription = mainComponent.description;
        }
      } catch (error) {
        console.log('Could not get main component for:', node.name);
      }
    }

    // Extract effects
    if ('effects' in node && node.effects) {
      element.effects = node.effects.map(effect => ({
        type: effect.type,
        visible: effect.visible,
        radius: effect.radius,
        color: effect.color ? {
          r: effect.color.r,
          g: effect.color.g,
          b: effect.color.b,
          a: effect.color.a
        } : null
      }));
    }

    // Add constraints and layout info
    if ('constraints' in node) {
      element.constraints = {
        horizontal: node.constraints.horizontal,
        vertical: node.constraints.vertical
      };
    }

    // Add auto-layout info if available
    if ('layoutMode' in node && node.layoutMode !== 'NONE') {
      element.layout = {
        layoutMode: node.layoutMode,
        paddingTop: node.paddingTop,
        paddingBottom: node.paddingBottom,
        paddingLeft: node.paddingLeft,
        paddingRight: node.paddingRight,
        itemSpacing: node.itemSpacing,
        primaryAxisAlignItems: node.primaryAxisAlignItems,
        counterAxisAlignItems: node.counterAxisAlignItems
      };
    }

    return element;
  } catch (error) {
    console.error('Error extracting element data for node:', node.name, error);
    return null;
  }
}

// Get available design systems (unchanged)
async function getAvailableDesignSystems() {
  const designSystems = [
    { id: 'elara-ds-1', name: 'Elara Design System V1.0' },
    { id: 'custom-ds-1', name: 'Custom Design System' }
  ];
  
  figma.ui.postMessage({
    type: 'design-systems-loaded',
    data: designSystems
  });
}

// Show design system assets (unchanged)
async function showDesignSystemAssets() {
  try {
    const components = figma.root.findAllWithCriteria({
      types: ['COMPONENT']
    });

    const componentSets = figma.root.findAllWithCriteria({
      types: ['COMPONENT_SET']  
    });

    const allLocalPaintStyles = figma.getLocalPaintStyles();
    const allLocalTextStyles = figma.getLocalTextStyles();

    const data = {
      components: components.map(comp => ({
        id: comp.id,
        name: comp.name,
        key: comp.key || null,
        description: comp.description || ''
      })),
      componentSets: componentSets.map(compSet => ({
        id: compSet.id,
        name: compSet.name,
        key: compSet.key || null,
        childrenCount: compSet.children.length
      })),
      colors: allLocalPaintStyles.map(style => ({
        id: style.id,
        name: style.name,
        description: style.description || ''
      })),
      textStyles: allLocalTextStyles.map(style => ({
        id: style.id,
        name: style.name,
        description: style.description || ''
      }))
    };

    figma.ui.postMessage({
      type: 'design-system-assets-loaded',
      data: data
    });

  } catch (error) {
    console.error('Error loading design system assets:', error);
    figma.ui.postMessage({
      type: 'error',
      message: 'Error loading design system assets: ' + error.message
    });
  }
}

// Send plugin loaded message
figma.ui.postMessage({
  type: 'plugin-loaded',
  message: 'Plugin loaded and ready for dynamic analysis'
});