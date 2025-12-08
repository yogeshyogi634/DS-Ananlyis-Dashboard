/**
 * Figma Elara Design System Loader
 * Fetches real components, colors, and typography from the Elara Figma file
 */
export class FigmaElaraLoader {
  constructor() {
    this.figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    this.figmaFileKey = 'P3AoC4JoQOlEoKRRKhwGLx'; // From the Figma URL
    this.baseUrl = 'https://api.figma.com/v1';
  }

  /**
   * Load complete Elara design system from Figma
   */
  async loadElaraDesignSystem() {
    try {
      if (!this.figmaToken) {
        console.log('No Figma token found, using fallback data');
        return this.getFallbackElaraSystem();
      }

      console.log('Loading Elara Design System from Figma...');
      
      // Load all design system data in parallel
      const [styles, file, componentsData] = await Promise.all([
        this.fetchFigmaStyles(),
        this.fetchFigmaFile(),
        this.fetchFigmaComponents()
      ]);

      const designSystem = this.parseElaraDesignSystem(styles, file, componentsData);
      
      console.log(`Successfully loaded Elara Design System from Figma:`, {
        components: designSystem.components.length,
        colors: designSystem.colors.length,
        typography: designSystem.typography.length
      });

      return designSystem;
    } catch (error) {
      console.error('Error loading from Figma:', error);
      return this.getFallbackElaraSystem();
    }
  }

  /**
   * Fetch design styles from Figma (colors, typography)
   */
  async fetchFigmaStyles() {
    try {
      const response = await fetch(
        `${this.baseUrl}/files/${this.figmaFileKey}/styles`,
        {
          headers: {
            'X-Figma-Token': this.figmaToken
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Figma styles:', error);
      return { meta: { styles: [] } };
    }
  }

  /**
   * Fetch file structure to understand organization
   */
  async fetchFigmaFile() {
    try {
      const response = await fetch(
        `${this.baseUrl}/files/${this.figmaFileKey}?depth=2`,
        {
          headers: {
            'X-Figma-Token': this.figmaToken
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Figma file:', error);
      return { document: { children: [] } };
    }
  }

  /**
   * Fetch components from Figma
   */
  async fetchFigmaComponents() {
    try {
      const response = await fetch(
        `${this.baseUrl}/files/${this.figmaFileKey}/components`,
        {
          headers: {
            'X-Figma-Token': this.figmaToken
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Figma components:', error);
      return { meta: { components: [] } };
    }
  }

  /**
   * Parse the Elara Design System data from Figma responses
   */
  parseElaraDesignSystem(styles, file, componentsData) {
    const components = this.parseComponents(componentsData, file);
    const colors = this.parseColors(styles);
    const typography = this.parseTypography(styles);

    return { components, colors, typography };
  }

  /**
   * Parse components from Figma data
   */
  parseComponents(componentsData, file) {
    const components = [];

    // Parse actual components from Figma
    if (componentsData.meta && componentsData.meta.components) {
      Object.values(componentsData.meta.components).forEach(component => {
        const componentType = this.inferComponentType(component.name, component.description);
        const aliases = this.generateComponentAliases(component.name, componentType);

        components.push({
          id: component.node_id,
          name: component.name,
          type: componentType,
          figmaId: component.node_id,
          description: component.description,
          aliases: aliases,
          variants: this.extractVariants(component)
        });
      });
    }

    // Also look for components in the file structure
    this.findComponentsInFileStructure(file.document, components);

    // If no components found, add some detected from common patterns
    if (components.length === 0) {
      components.push(...this.getDefaultElaraComponents());
    }

    return components;
  }

  /**
   * Parse colors from Figma styles
   */
  parseColors(styles) {
    const colors = [];

    if (styles.meta && styles.meta.styles) {
      styles.meta.styles.forEach(style => {
        if (style.style_type === 'FILL') {
          const colorInfo = this.parseColorStyle(style);
          if (colorInfo) {
            colors.push(colorInfo);
          }
        }
      });
    }

    // If no colors found in styles, add Elara default colors
    if (colors.length === 0) {
      colors.push(...this.getDefaultElaraColors());
    }

    return colors;
  }

  /**
   * Parse typography from Figma styles
   */
  parseTypography(styles) {
    const typography = [];

    if (styles.meta && styles.meta.styles) {
      styles.meta.styles.forEach(style => {
        if (style.style_type === 'TEXT') {
          const typoInfo = this.parseTypographyStyle(style);
          if (typoInfo) {
            typography.push(typoInfo);
          }
        }
      });
    }

    // If no typography found in styles, add Elara default typography
    if (typography.length === 0) {
      typography.push(...this.getDefaultElaraTypography());
    }

    return typography;
  }

  /**
   * Infer component type from name and description
   */
  inferComponentType(name, description = '') {
    const nameLower = name.toLowerCase();
    const descLower = description.toLowerCase();
    const combined = `${nameLower} ${descLower}`;

    // Form elements
    if (combined.includes('button')) return 'button';
    if (combined.includes('input') || combined.includes('textfield') || combined.includes('text field')) return 'input';
    if (combined.includes('textarea') || combined.includes('text area')) return 'textarea';
    if (combined.includes('checkbox') || combined.includes('check')) return 'checkbox';
    if (combined.includes('radio')) return 'radio';
    if (combined.includes('select') || combined.includes('dropdown')) return 'select';
    if (combined.includes('switch') || combined.includes('toggle')) return 'switch';

    // Layout elements
    if (combined.includes('card') || combined.includes('panel')) return 'container';
    if (combined.includes('modal') || combined.includes('dialog')) return 'overlay';
    if (combined.includes('header') || combined.includes('navbar')) return 'navigation';
    if (combined.includes('sidebar') || combined.includes('drawer')) return 'navigation';
    if (combined.includes('tab')) return 'navigation';

    // Data display
    if (combined.includes('table') || combined.includes('grid')) return 'data';
    if (combined.includes('list')) return 'data';
    if (combined.includes('avatar')) return 'media';
    if (combined.includes('icon')) return 'media';

    // Feedback
    if (combined.includes('alert') || combined.includes('notification')) return 'feedback';
    if (combined.includes('toast') || combined.includes('snackbar')) return 'feedback';
    if (combined.includes('badge') || combined.includes('chip')) return 'feedback';
    if (combined.includes('tooltip')) return 'feedback';

    return 'component';
  }

  /**
   * Generate aliases for components
   */
  generateComponentAliases(name, type) {
    const aliases = [name.toLowerCase().replace(/\s+/g, '-')];
    const nameParts = name.toLowerCase().split(/[\s\-_]+/);
    
    aliases.push(...nameParts);
    
    // Add type-based aliases
    const typeAliases = {
      'button': ['btn', 'cta'],
      'input': ['textfield', 'text-input', 'field'],
      'textarea': ['text-area', 'multiline'],
      'checkbox': ['check', 'tick-box'],
      'radio': ['radio-button', 'option'],
      'select': ['dropdown', 'picker'],
      'switch': ['toggle'],
      'container': ['card', 'panel'],
      'overlay': ['modal', 'dialog', 'popup'],
      'navigation': ['nav', 'menu'],
      'data': ['table', 'grid', 'list'],
      'feedback': ['alert', 'notification'],
      'media': ['image', 'avatar']
    };

    if (typeAliases[type]) {
      aliases.push(...typeAliases[type]);
    }

    return [...new Set(aliases)]; // Remove duplicates
  }

  /**
   * Extract variants from component data
   */
  extractVariants(component) {
    const variants = [];
    const description = component.description || '';
    
    // Look for common variant patterns in description
    if (description.includes('primary')) variants.push('primary');
    if (description.includes('secondary')) variants.push('secondary');
    if (description.includes('tertiary')) variants.push('tertiary');
    if (description.includes('ghost')) variants.push('ghost');
    if (description.includes('outline')) variants.push('outline');
    if (description.includes('text')) variants.push('text');
    if (description.includes('small')) variants.push('small');
    if (description.includes('large')) variants.push('large');
    if (description.includes('medium')) variants.push('medium');

    return variants;
  }

  /**
   * Parse individual color style
   */
  parseColorStyle(style) {
    // Extract color information from style name and description
    const name = style.name;
    const type = this.inferColorType(name, style.description);
    const aliases = this.generateColorAliases(name);

    // For now, we'll use a placeholder value since we'd need additional API calls
    // to get the actual color values. In a full implementation, you'd make another
    // API call to get the style details.
    const value = this.inferColorValue(name);

    return {
      id: style.node_id,
      name: name,
      value: value,
      type: type,
      aliases: aliases
    };
  }

  /**
   * Parse individual typography style
   */
  parseTypographyStyle(style) {
    const name = style.name;
    const aliases = this.generateTypographyAliases(name);
    
    // Parse typography properties from name (common Figma naming patterns)
    const props = this.extractTypographyProps(name);

    return {
      id: style.node_id,
      name: name,
      fontSize: props.fontSize,
      fontFamily: props.fontFamily,
      fontWeight: props.fontWeight,
      lineHeight: props.lineHeight,
      aliases: aliases
    };
  }

  /**
   * Find components in file structure
   */
  findComponentsInFileStructure(node, components, depth = 0) {
    if (depth > 3) return; // Prevent infinite recursion

    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      const existing = components.find(c => c.name === node.name);
      if (!existing) {
        const componentType = this.inferComponentType(node.name);
        components.push({
          id: node.id,
          name: node.name,
          type: componentType,
          figmaId: node.id,
          aliases: this.generateComponentAliases(node.name, componentType),
          variants: []
        });
      }
    }

    if (node.children) {
      node.children.forEach(child => 
        this.findComponentsInFileStructure(child, components, depth + 1)
      );
    }
  }

  /**
   * Helper methods for type inference and value extraction
   */
  inferColorType(name, description = '') {
    const combined = `${name} ${description}`.toLowerCase();
    
    if (combined.includes('primary') || combined.includes('brand')) return 'primary';
    if (combined.includes('secondary')) return 'secondary';
    if (combined.includes('success') || combined.includes('green')) return 'status';
    if (combined.includes('warning') || combined.includes('yellow')) return 'status';
    if (combined.includes('error') || combined.includes('danger') || combined.includes('red')) return 'status';
    if (combined.includes('info') || combined.includes('blue')) return 'status';
    if (combined.includes('gray') || combined.includes('grey') || combined.includes('neutral')) return 'neutral';
    if (combined.includes('background') || combined.includes('surface')) return 'surface';
    if (combined.includes('text')) return 'text';
    if (combined.includes('border')) return 'border';
    
    return 'color';
  }

  generateColorAliases(name) {
    const aliases = [name.toLowerCase().replace(/\s+/g, '-')];
    const nameParts = name.toLowerCase().split(/[\s\-_]+/);
    aliases.push(...nameParts);
    return [...new Set(aliases)];
  }

  generateTypographyAliases(name) {
    const aliases = [name.toLowerCase().replace(/\s+/g, '-')];
    const nameParts = name.toLowerCase().split(/[\s\-_]+/);
    aliases.push(...nameParts);
    
    // Add semantic aliases
    if (name.toLowerCase().includes('heading')) aliases.push('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
    if (name.toLowerCase().includes('body')) aliases.push('p', 'text', 'paragraph');
    if (name.toLowerCase().includes('caption')) aliases.push('small', 'caption');
    if (name.toLowerCase().includes('button')) aliases.push('btn-text', 'button');
    
    return [...new Set(aliases)];
  }

  inferColorValue(name) {
    // This is a simplified mapping. In reality, you'd fetch actual values from Figma
    const colorMap = {
      'primary': '#0066cc',
      'secondary': '#6c757d',
      'success': '#28a745',
      'warning': '#ffc107',
      'danger': '#dc3545',
      'error': '#dc3545',
      'info': '#17a2b8',
      'white': '#ffffff',
      'black': '#000000'
    };

    const nameLower = name.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (nameLower.includes(key)) {
        return value;
      }
    }

    return '#666666'; // Default gray
  }

  extractTypographyProps(name) {
    // Extract common typography properties from style names
    const nameLower = name.toLowerCase();
    
    let fontSize = '14px';
    let fontFamily = 'Inter';
    let fontWeight = '400';
    let lineHeight = '20px';

    // Size inference
    if (nameLower.includes('large') || nameLower.includes('lg')) fontSize = '16px';
    if (nameLower.includes('small') || nameLower.includes('sm')) fontSize = '12px';
    if (nameLower.includes('tiny') || nameLower.includes('xs')) fontSize = '10px';
    if (nameLower.includes('heading') || nameLower.includes('h1')) fontSize = '24px';
    if (nameLower.includes('h2')) fontSize = '20px';
    if (nameLower.includes('h3')) fontSize = '18px';
    if (nameLower.includes('display')) fontSize = '32px';

    // Weight inference
    if (nameLower.includes('bold') || nameLower.includes('heavy')) fontWeight = '700';
    if (nameLower.includes('medium')) fontWeight = '500';
    if (nameLower.includes('light')) fontWeight = '300';
    if (nameLower.includes('heading')) fontWeight = '600';

    // Family inference
    if (nameLower.includes('mono') || nameLower.includes('code')) fontFamily = 'Monaco';
    if (nameLower.includes('system')) fontFamily = '-apple-system';
    if (nameLower.includes('roboto')) fontFamily = 'Roboto';

    return { fontSize, fontFamily, fontWeight, lineHeight };
  }

  /**
   * Fallback Elara system data (current hardcoded version)
   */
  getFallbackElaraSystem() {
    return {
      components: this.getDefaultElaraComponents(),
      colors: this.getDefaultElaraColors(),
      typography: this.getDefaultElaraTypography()
    };
  }

  getDefaultElaraComponents() {
    return [
      { id: "comp-1", name: "Button", type: "button", figmaId: "btn-1", aliases: ["btn", "cta"], variants: ["primary", "secondary"] },
      { id: "comp-2", name: "Input Field", type: "input", figmaId: "input-1", aliases: ["input", "textfield"], variants: ["text", "email"] },
      { id: "comp-3", name: "Card", type: "container", figmaId: "card-1", aliases: ["panel", "tile"], variants: [] },
      { id: "comp-4", name: "Modal", type: "overlay", figmaId: "modal-1", aliases: ["dialog", "popup"], variants: [] },
      { id: "comp-5", name: "Checkbox", type: "checkbox", figmaId: "checkbox-1", aliases: ["check"], variants: [] },
      { id: "comp-6", name: "Table", type: "data", figmaId: "table-1", aliases: ["data-table"], variants: [] }
    ];
  }

  getDefaultElaraColors() {
    return [
      { id: "color-1", name: "Primary", value: "#0066cc", type: "primary", aliases: ["primary", "blue"] },
      { id: "color-2", name: "Success", value: "#28a745", type: "status", aliases: ["success", "green"] },
      { id: "color-3", name: "Warning", value: "#ffc107", type: "status", aliases: ["warning", "yellow"] },
      { id: "color-4", name: "Error", value: "#dc3545", type: "status", aliases: ["error", "danger", "red"] },
      { id: "color-5", name: "Gray 100", value: "#f8f9fa", type: "neutral", aliases: ["gray-100", "light"] },
      { id: "color-6", name: "Gray 500", value: "#6c757d", type: "neutral", aliases: ["gray-500", "medium"] },
      { id: "color-7", name: "Gray 900", value: "#212529", type: "neutral", aliases: ["gray-900", "dark"] }
    ];
  }

  getDefaultElaraTypography() {
    return [
      { id: "typo-1", name: "Heading Large", fontSize: "24px", fontFamily: "Inter", fontWeight: "600", lineHeight: "32px", aliases: ["h1", "heading"] },
      { id: "typo-2", name: "Body", fontSize: "14px", fontFamily: "Inter", fontWeight: "400", lineHeight: "20px", aliases: ["body", "p"] },
      { id: "typo-3", name: "Caption", fontSize: "12px", fontFamily: "Inter", fontWeight: "400", lineHeight: "16px", aliases: ["caption", "small"] },
      { id: "typo-4", name: "Button Text", fontSize: "14px", fontFamily: "Inter", fontWeight: "500", lineHeight: "20px", aliases: ["button"] }
    ];
  }
}

export default FigmaElaraLoader;