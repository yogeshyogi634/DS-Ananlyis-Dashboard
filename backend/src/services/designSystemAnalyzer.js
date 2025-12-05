import { PrismaClient } from '@prisma/client';
import { ElaraDesignSystemLoader } from './elaraDesignSystemLoader.js';

const prisma = new PrismaClient();

/**
 * Dynamic Design System Analyzer
 * Compares Figma frame elements against design system to identify missing components, colors, and typography
 */
export class DesignSystemAnalyzer {
  constructor(designSystemId) {
    this.designSystemId = designSystemId;
    this.designSystem = null;
  }

  /**
   * Load design system data from multiple sources
   */
  async loadDesignSystem() {
    try {
      // Use the new ElaraDesignSystemLoader to load from various sources
      const loader = new ElaraDesignSystemLoader(this.designSystemId);
      this.designSystem = await loader.loadDesignSystem();
      
      console.log(`Loaded Elara design system with:`, {
        components: this.designSystem.components.length,
        colors: this.designSystem.colors.length,
        typography: this.designSystem.typography.length
      });
      
    } catch (error) {
      console.error('Error loading design system:', error);
      // Fallback to minimal system
      this.designSystem = {
        components: [
          // Form Components
          { id: "comp-1", name: "Button", type: "button", figmaId: "btn-1", variants: ["primary", "secondary", "tertiary"], aliases: ["btn", "cta"] },
          { id: "comp-2", name: "Input Field", type: "input", figmaId: "input-1", variants: ["text", "password", "email"], aliases: ["input", "textfield", "text-input"] },
          { id: "comp-3", name: "Textarea", type: "textarea", figmaId: "textarea-1", aliases: ["text-area", "multi-line-input"] },
          { id: "comp-4", name: "Checkbox", type: "checkbox", figmaId: "checkbox-1", aliases: ["check", "tick-box"] },
          { id: "comp-5", name: "Radio Button", type: "radio", figmaId: "radio-1", aliases: ["radio", "option-button"] },
          { id: "comp-6", name: "Toggle Switch", type: "switch", figmaId: "switch-1", aliases: ["toggle", "switch"] },
          { id: "comp-7", name: "Select Dropdown", type: "select", figmaId: "select-1", aliases: ["dropdown", "picker", "combo-box"] },
          { id: "comp-8", name: "Multi-Select", type: "multi-select", figmaId: "multi-select-1", aliases: ["multi-dropdown", "multi-picker"] },
          { id: "comp-9", name: "Date Picker", type: "date-picker", figmaId: "date-1", aliases: ["calendar", "date-input"] },
          { id: "comp-10", name: "File Upload", type: "file-upload", figmaId: "upload-1", aliases: ["upload", "file-input"] },
          { id: "comp-11", name: "Search Input", type: "search", figmaId: "search-1", aliases: ["search-box", "search-field"] },
          { id: "comp-12", name: "Number Input", type: "number-input", figmaId: "number-1", aliases: ["numeric-input", "spinner"] },
          
          // Layout Components  
          { id: "comp-13", name: "Card", type: "container", figmaId: "card-1", aliases: ["panel", "tile"] },
          { id: "comp-14", name: "Modal", type: "overlay", figmaId: "modal-1", aliases: ["dialog", "popup"] },
          { id: "comp-15", name: "Sidebar", type: "navigation", figmaId: "sidebar-1", aliases: ["side-nav", "drawer"] },
          { id: "comp-16", name: "Header", type: "navigation", figmaId: "header-1", aliases: ["top-bar", "navbar"] },
          { id: "comp-17", name: "Footer", type: "navigation", figmaId: "footer-1", aliases: ["bottom-bar"] },
          { id: "comp-18", name: "Tabs", type: "navigation", figmaId: "tabs-1", aliases: ["tab-group", "tab-panel"] },
          { id: "comp-19", name: "Accordion", type: "container", figmaId: "accordion-1", aliases: ["collapsible", "expandable"] },
          { id: "comp-20", name: "Grid", type: "layout", figmaId: "grid-1", aliases: ["data-grid", "table-grid"] },
          { id: "comp-21", name: "List", type: "layout", figmaId: "list-1", aliases: ["item-list", "menu"] },
          { id: "comp-22", name: "Section", type: "container", figmaId: "section-1", aliases: ["group", "fieldset"] },
          
          // Navigation Components
          { id: "comp-23", name: "Breadcrumb", type: "navigation", figmaId: "breadcrumb-1", aliases: ["breadcrumbs", "path"] },
          { id: "comp-24", name: "Pagination", type: "navigation", figmaId: "pagination-1", aliases: ["pager", "page-nav"] },
          { id: "comp-25", name: "Step Indicator", type: "navigation", figmaId: "stepper-1", aliases: ["progress-steps", "wizard"] },
          { id: "comp-26", name: "Navigation Menu", type: "navigation", figmaId: "nav-menu-1", aliases: ["nav", "menu-bar"] },
          
          // Feedback Components
          { id: "comp-27", name: "Alert", type: "feedback", figmaId: "alert-1", aliases: ["notification", "message"] },
          { id: "comp-28", name: "Toast", type: "feedback", figmaId: "toast-1", aliases: ["snackbar", "popup-message"] },
          { id: "comp-29", name: "Progress Bar", type: "feedback", figmaId: "progress-1", aliases: ["progress", "loading-bar"] },
          { id: "comp-30", name: "Spinner", type: "feedback", figmaId: "spinner-1", aliases: ["loader", "loading"] },
          { id: "comp-31", name: "Badge", type: "feedback", figmaId: "badge-1", aliases: ["chip", "tag", "label"] },
          { id: "comp-32", name: "Tooltip", type: "feedback", figmaId: "tooltip-1", aliases: ["hint", "help-text"] },
          
          // Data Display Components
          { id: "comp-33", name: "Table", type: "data", figmaId: "table-1", aliases: ["data-table", "grid-table"] },
          { id: "comp-34", name: "Chart", type: "data", figmaId: "chart-1", aliases: ["graph", "visualization"] },
          { id: "comp-35", name: "Avatar", type: "media", figmaId: "avatar-1", aliases: ["profile-pic", "user-image"] },
          { id: "comp-36", name: "Image", type: "media", figmaId: "image-1", aliases: ["picture", "photo"] },
          { id: "comp-37", name: "Icon", type: "media", figmaId: "icon-1", aliases: ["symbol", "glyph"] },
          
          // Specialized Components
          { id: "comp-38", name: "Calendar", type: "specialized", figmaId: "calendar-1", aliases: ["date-grid", "month-view"] },
          { id: "comp-39", name: "Color Picker", type: "specialized", figmaId: "color-picker-1", aliases: ["color-selector"] },
          { id: "comp-40", name: "Slider", type: "specialized", figmaId: "slider-1", aliases: ["range", "scrubber"] },
          { id: "comp-41", name: "Rating", type: "specialized", figmaId: "rating-1", aliases: ["stars", "score"] },
          { id: "comp-42", name: "Code Block", type: "specialized", figmaId: "code-1", aliases: ["code", "syntax"] }
        ],
        colors: [
          // Primary Colors
          { id: "color-1", name: "Primary Blue", value: "#0066cc", type: "primary", aliases: ["blue", "main", "brand"] },
          { id: "color-2", name: "Primary Blue Dark", value: "#004499", type: "primary", aliases: ["blue-dark", "primary-dark"] },
          { id: "color-3", name: "Primary Blue Light", value: "#3388dd", type: "primary", aliases: ["blue-light", "primary-light"] },
          
          // Secondary Colors
          { id: "color-4", name: "Secondary Green", value: "#28a745", type: "secondary", aliases: ["green", "success"] },
          { id: "color-5", name: "Secondary Orange", value: "#fd7e14", type: "secondary", aliases: ["orange", "warning"] },
          { id: "color-6", name: "Secondary Red", value: "#dc3545", type: "secondary", aliases: ["red", "error", "danger"] },
          
          // Neutral Colors
          { id: "color-7", name: "White", value: "#ffffff", type: "neutral", aliases: ["white", "background"] },
          { id: "color-8", name: "Black", value: "#000000", type: "neutral", aliases: ["black", "text"] },
          { id: "color-9", name: "Light Gray", value: "#f8f9fa", type: "neutral", aliases: ["gray-100", "background-light"] },
          { id: "color-10", name: "Medium Gray", value: "#6c757d", type: "neutral", aliases: ["gray-500", "text-secondary"] },
          { id: "color-11", name: "Dark Gray", value: "#343a40", type: "neutral", aliases: ["gray-800", "text-primary"] },
          
          // Extended Grays
          { id: "color-12", name: "Gray 50", value: "#fafbfc", type: "neutral", aliases: ["gray-50"] },
          { id: "color-13", name: "Gray 200", value: "#e1e4e8", type: "neutral", aliases: ["gray-200", "border"] },
          { id: "color-14", name: "Gray 300", value: "#d1d9e0", type: "neutral", aliases: ["gray-300", "border-light"] },
          { id: "color-15", name: "Gray 400", value: "#959da5", type: "neutral", aliases: ["gray-400", "text-muted"] },
          { id: "color-16", name: "Gray 600", value: "#586069", type: "neutral", aliases: ["gray-600", "text-dark"] },
          { id: "color-17", name: "Gray 700", value: "#444d56", type: "neutral", aliases: ["gray-700"] },
          { id: "color-18", name: "Gray 900", value: "#24292e", type: "neutral", aliases: ["gray-900", "text-darkest"] },
          
          // Form Colors
          { id: "color-19", name: "Input Background", value: "#ffffff", type: "form", aliases: ["input-bg", "field-bg"] },
          { id: "color-20", name: "Input Border", value: "#d1d9e0", type: "form", aliases: ["input-border", "field-border"] },
          { id: "color-21", name: "Input Focus", value: "#0066cc", type: "form", aliases: ["focus-color", "active-border"] },
          { id: "color-22", name: "Input Disabled", value: "#f6f8fa", type: "form", aliases: ["disabled-bg"] },
          { id: "color-23", name: "Input Error", value: "#dc3545", type: "form", aliases: ["error-border"] },
          
          // Status Colors
          { id: "color-24", name: "Success Background", value: "#d4edda", type: "status", aliases: ["success-bg"] },
          { id: "color-25", name: "Warning Background", value: "#fff3cd", type: "status", aliases: ["warning-bg"] },
          { id: "color-26", name: "Error Background", value: "#f8d7da", type: "status", aliases: ["error-bg", "danger-bg"] },
          { id: "color-27", name: "Info Background", value: "#d1ecf1", type: "status", aliases: ["info-bg"] },
          
          // Interaction Colors
          { id: "color-28", name: "Hover Background", value: "#f6f8fa", type: "interaction", aliases: ["hover-bg"] },
          { id: "color-29", name: "Active Background", value: "#e1e4e8", type: "interaction", aliases: ["active-bg", "pressed"] },
          { id: "color-30", name: "Selected Background", value: "#0366d6", type: "interaction", aliases: ["selected-bg"] }
        ],
        typography: [
          // Headings
          { id: "typo-1", name: "Display Large", fontSize: "32px", fontFamily: "Inter", fontWeight: "700", lineHeight: "40px", aliases: ["h1", "title", "display"] },
          { id: "typo-2", name: "Heading 1", fontSize: "28px", fontFamily: "Inter", fontWeight: "600", lineHeight: "36px", aliases: ["h1", "heading-large"] },
          { id: "typo-3", name: "Heading 2", fontSize: "24px", fontFamily: "Inter", fontWeight: "600", lineHeight: "32px", aliases: ["h2", "heading-medium"] },
          { id: "typo-4", name: "Heading 3", fontSize: "20px", fontFamily: "Inter", fontWeight: "600", lineHeight: "28px", aliases: ["h3", "heading-small"] },
          { id: "typo-5", name: "Heading 4", fontSize: "18px", fontFamily: "Inter", fontWeight: "600", lineHeight: "24px", aliases: ["h4", "subheading"] },
          { id: "typo-6", name: "Heading 5", fontSize: "16px", fontFamily: "Inter", fontWeight: "600", lineHeight: "22px", aliases: ["h5", "subtitle"] },
          
          // Body Text
          { id: "typo-7", name: "Body Large", fontSize: "16px", fontFamily: "Inter", fontWeight: "400", lineHeight: "24px", aliases: ["body-lg", "text-large"] },
          { id: "typo-8", name: "Body Medium", fontSize: "14px", fontFamily: "Inter", fontWeight: "400", lineHeight: "20px", aliases: ["body", "text-medium", "p"] },
          { id: "typo-9", name: "Body Small", fontSize: "12px", fontFamily: "Inter", fontWeight: "400", lineHeight: "18px", aliases: ["body-sm", "text-small"] },
          { id: "typo-10", name: "Body Tiny", fontSize: "10px", fontFamily: "Inter", fontWeight: "400", lineHeight: "14px", aliases: ["body-xs", "text-tiny"] },
          
          // Functional Text
          { id: "typo-11", name: "Button Text", fontSize: "14px", fontFamily: "Inter", fontWeight: "500", lineHeight: "20px", aliases: ["btn-text", "button"] },
          { id: "typo-12", name: "Link Text", fontSize: "14px", fontFamily: "Inter", fontWeight: "400", lineHeight: "20px", aliases: ["link", "anchor"] },
          { id: "typo-13", name: "Input Text", fontSize: "14px", fontFamily: "Inter", fontWeight: "400", lineHeight: "20px", aliases: ["input", "field-text"] },
          { id: "typo-14", name: "Label Text", fontSize: "12px", fontFamily: "Inter", fontWeight: "500", lineHeight: "16px", aliases: ["label", "field-label"] },
          { id: "typo-15", name: "Help Text", fontSize: "11px", fontFamily: "Inter", fontWeight: "400", lineHeight: "16px", aliases: ["help", "hint", "caption"] },
          
          // System Text
          { id: "typo-16", name: "Code", fontSize: "12px", fontFamily: "Monaco", fontWeight: "400", lineHeight: "18px", aliases: ["code", "monospace"] },
          { id: "typo-17", name: "Tab Text", fontSize: "13px", fontFamily: "Inter", fontWeight: "500", lineHeight: "18px", aliases: ["tab", "nav-text"] },
          { id: "typo-18", name: "Menu Text", fontSize: "13px", fontFamily: "Inter", fontWeight: "400", lineHeight: "18px", aliases: ["menu", "dropdown-text"] },
          { id: "typo-19", name: "Tooltip Text", fontSize: "11px", fontFamily: "Inter", fontWeight: "400", lineHeight: "14px", aliases: ["tooltip"] },
          { id: "typo-20", name: "Badge Text", fontSize: "10px", fontFamily: "Inter", fontWeight: "500", lineHeight: "12px", aliases: ["badge", "chip"] },
          
          // Alternative Font Families
          { id: "typo-21", name: "System Large", fontSize: "16px", fontFamily: "-apple-system", fontWeight: "400", lineHeight: "24px", aliases: ["system", "native"] },
          { id: "typo-22", name: "System Medium", fontSize: "14px", fontFamily: "-apple-system", fontWeight: "400", lineHeight: "20px", aliases: ["system-body"] },
          { id: "typo-23", name: "Roboto Large", fontSize: "16px", fontFamily: "Roboto", fontWeight: "400", lineHeight: "24px", aliases: ["roboto"] },
          { id: "typo-24", name: "Roboto Medium", fontSize: "14px", fontFamily: "Roboto", fontWeight: "400", lineHeight: "20px", aliases: ["roboto-body"] }
        ]
      };
    }
  }

  /**
   * Analyze Figma frame elements and detect missing design system elements
   * @param {Object} frameElements - Elements from Figma frame
   * @returns {Object} Analysis results with missing elements
   */
  async analyzeMissingElements(frameElements) {
    await this.loadDesignSystem();

    const analysis = {
      totalElements: frameElements.length || 0,
      dsCompliantElements: 0,
      missingComponents: [],
      missingColors: [],
      missingTypography: [],
      nonCompliantElements: [],
      suggestions: []
    };

    // Analyze each element in the frame
    for (const element of frameElements) {
      const elementAnalysis = this.analyzeElement(element);
      
      if (elementAnalysis.isCompliant) {
        analysis.dsCompliantElements++;
      } else {
        analysis.nonCompliantElements.push(element);
        
        // Add to missing elements based on type
        if (elementAnalysis.missingComponent) {
          this.addMissingComponent(analysis.missingComponents, elementAnalysis.missingComponent);
        }
        
        if (elementAnalysis.missingColor) {
          this.addMissingColor(analysis.missingColors, elementAnalysis.missingColor);
        }
        
        if (elementAnalysis.missingTypography) {
          this.addMissingTypography(analysis.missingTypography, elementAnalysis.missingTypography);
        }
      }
    }

    // Generate suggestions based on missing elements
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  /**
   * Analyze individual element against design system
   * @param {Object} element - Figma element
   * @returns {Object} Element analysis result
   */
  analyzeElement(element) {
    const result = {
      isCompliant: false,
      missingComponent: null,
      missingColor: null,
      missingTypography: null
    };

    // Check if component exists in design system
    const componentMatch = this.findMatchingComponent(element);
    if (!componentMatch && element.type !== 'text') {
      result.missingComponent = {
        name: element.name || `${element.type} Component`,
        type: this.mapFigmaTypeToComponentType(element.type),
        properties: this.extractComponentProperties(element)
      };
    } else if (componentMatch) {
      result.isCompliant = true;
    }

    // Check colors used in element
    if (element.fills) {
      for (const fill of element.fills) {
        if (fill.type === 'SOLID') {
          const colorMatch = this.findMatchingColor(fill.color);
          if (!colorMatch) {
            result.missingColor = {
              name: element.name ? `${element.name} Color` : null,
              value: this.rgbToHex(fill.color),
              type: this.inferColorType(fill.color)
            };
            result.isCompliant = false;
          }
        }
      }
    }

    // Check typography (for text elements)
    if (element.type === 'TEXT' && element.style) {
      const typographyMatch = this.findMatchingTypography(element.style);
      if (!typographyMatch) {
        result.missingTypography = {
          fontFamily: element.style.fontFamily || 'Unknown',
          fontSize: element.style.fontSize ? `${element.style.fontSize}px` : '14px',
          fontWeight: element.style.fontWeight ? element.style.fontWeight.toString() : '400',
          lineHeight: element.style.lineHeight ? `${element.style.lineHeight}px` : null
        };
        result.isCompliant = false;
      } else if (!result.missingComponent && !result.missingColor) {
        result.isCompliant = true;
      }
    }

    return result;
  }

  /**
   * Find matching component in design system with enhanced fuzzy matching
   */
  findMatchingComponent(element) {
    const elementName = element.name?.toLowerCase() || '';
    const elementType = this.mapFigmaTypeToComponentType(element.type);
    
    // Exact name match
    let match = this.designSystem.components.find(comp => 
      comp.name.toLowerCase() === elementName
    );
    
    if (match) return match;
    
    // Alias matching
    match = this.designSystem.components.find(comp => 
      comp.aliases && comp.aliases.some(alias => 
        elementName.includes(alias.toLowerCase()) || alias.toLowerCase().includes(elementName)
      )
    );
    
    if (match) return match;
    
    // Partial name matching with keywords
    const keywords = elementName.split(/[\s\-_]+/).filter(word => word.length > 2);
    if (keywords.length > 0) {
      match = this.designSystem.components.find(comp => 
        keywords.some(keyword => 
          comp.name.toLowerCase().includes(keyword) ||
          (comp.aliases && comp.aliases.some(alias => alias.toLowerCase().includes(keyword)))
        )
      );
      
      if (match) return match;
    }
    
    // Type-based matching (less strict, only if element has meaningful type)
    if (elementType !== 'unknown' && elementType !== 'container') {
      match = this.designSystem.components.find(comp => comp.type === elementType);
      if (match) return match;
    }
    
    // Component instance matching (Figma-specific)
    if (element.componentId || element.componentSetId) {
      match = this.designSystem.components.find(comp => 
        comp.figmaId === element.componentId || 
        comp.figmaId === element.componentSetId
      );
      if (match) return match;
    }
    
    return null;
  }

  /**
   * Find matching color in design system with enhanced color matching
   */
  findMatchingColor(color) {
    const hex = this.rgbToHex(color);
    
    // Exact match first
    let match = this.designSystem.colors.find(dsColor => 
      dsColor.value.toLowerCase() === hex.toLowerCase()
    );
    
    if (match) return match;
    
    // Alias matching (for color names)
    const colorName = this.getColorName(color).toLowerCase();
    if (colorName !== 'unknown') {
      match = this.designSystem.colors.find(dsColor => 
        dsColor.aliases && dsColor.aliases.some(alias => 
          alias.toLowerCase() === colorName ||
          colorName.includes(alias.toLowerCase())
        )
      );
      
      if (match) return match;
    }
    
    // Similar color matching with tolerance
    const colorTolerance = 15; // RGB tolerance for similar colors
    match = this.designSystem.colors.find(dsColor => {
      const dsColorRgb = this.hexToRgb(dsColor.value);
      if (!dsColorRgb) return false;
      
      const distance = this.calculateColorDistance(color, dsColorRgb);
      return distance <= colorTolerance;
    });
    
    if (match) return match;
    
    // Grayscale matching (for gray variations)
    if (this.isGrayscale(color)) {
      match = this.designSystem.colors.find(dsColor => {
        const dsColorRgb = this.hexToRgb(dsColor.value);
        return dsColorRgb && this.isGrayscale(dsColorRgb) && 
               Math.abs(this.getGrayscaleValue(color) - this.getGrayscaleValue(dsColorRgb)) <= 0.1;
      });
    }
    
    return match;
  }
  
  /**
   * Calculate color distance using RGB space
   */
  calculateColorDistance(color1, color2) {
    const r1 = Math.round((color1.r || 0) * 255);
    const g1 = Math.round((color1.g || 0) * 255);
    const b1 = Math.round((color1.b || 0) * 255);
    
    const r2 = Math.round((color2.r || 0) * 255);
    const g2 = Math.round((color2.g || 0) * 255);
    const b2 = Math.round((color2.b || 0) * 255);
    
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
  }
  
  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }
  
  /**
   * Check if color is grayscale
   */
  isGrayscale(color) {
    const tolerance = 0.02;
    return Math.abs(color.r - color.g) <= tolerance && 
           Math.abs(color.g - color.b) <= tolerance && 
           Math.abs(color.r - color.b) <= tolerance;
  }
  
  /**
   * Get grayscale value (luminance)
   */
  getGrayscaleValue(color) {
    return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  }
  
  /**
   * Get basic color name from RGB values
   */
  getColorName(color) {
    const r = color.r || 0;
    const g = color.g || 0;
    const b = color.b || 0;
    
    if (r > 0.9 && g > 0.9 && b > 0.9) return 'white';
    if (r < 0.1 && g < 0.1 && b < 0.1) return 'black';
    if (this.isGrayscale(color)) return 'gray';
    if (r > 0.7 && g < 0.3 && b < 0.3) return 'red';
    if (r < 0.3 && g > 0.7 && b < 0.3) return 'green';
    if (r < 0.3 && g < 0.3 && b > 0.7) return 'blue';
    if (r > 0.7 && g > 0.7 && b < 0.3) return 'yellow';
    if (r > 0.7 && g < 0.7 && b > 0.7) return 'magenta';
    if (r < 0.7 && g > 0.7 && b > 0.7) return 'cyan';
    if (r > 0.7 && g > 0.5 && b < 0.3) return 'orange';
    if (r > 0.5 && g < 0.5 && b > 0.7) return 'purple';
    
    return 'unknown';
  }

  /**
   * Find matching typography in design system with enhanced fuzzy matching
   */
  findMatchingTypography(style) {
    const fontSize = style.fontSize ? `${style.fontSize}px` : '14px';
    const fontWeight = style.fontWeight?.toString() || '400';
    const fontFamily = style.fontFamily || 'Inter';
    
    // Exact match first
    let match = this.designSystem.typography.find(typo => 
      typo.fontFamily === fontFamily &&
      typo.fontSize === fontSize &&
      typo.fontWeight === fontWeight
    );
    
    if (match) return match;
    
    // Alias matching for typography names
    const styleKey = `${fontFamily} ${fontSize} ${fontWeight}`.toLowerCase();
    match = this.designSystem.typography.find(typo => 
      typo.aliases && typo.aliases.some(alias => 
        styleKey.includes(alias.toLowerCase()) || alias.toLowerCase().includes(fontFamily.toLowerCase())
      )
    );
    
    if (match) return match;
    
    // Font family matching with similar fonts
    match = this.findSimilarFontFamily(fontFamily, fontSize, fontWeight);
    if (match) return match;
    
    // Size-weight matching with tolerance
    const sizeTolerancePx = 2;
    const currentSizePx = parseInt(fontSize);
    
    match = this.designSystem.typography.find(typo => {
      const typoSizePx = parseInt(typo.fontSize);
      const sizeMatches = Math.abs(typoSizePx - currentSizePx) <= sizeTolerancePx;
      const weightMatches = this.isSimilarFontWeight(fontWeight, typo.fontWeight);
      const familyMatches = this.isSimilarFontFamily(fontFamily, typo.fontFamily);
      
      return sizeMatches && weightMatches && familyMatches;
    });
    
    if (match) return match;
    
    // Fallback: find closest size match with same family
    match = this.designSystem.typography.find(typo => 
      this.isSimilarFontFamily(fontFamily, typo.fontFamily) &&
      Math.abs(parseInt(typo.fontSize) - currentSizePx) <= 4
    );
    
    return match;
  }
  
  /**
   * Find similar font family match
   */
  findSimilarFontFamily(fontFamily, fontSize, fontWeight) {
    const normalizedFamily = fontFamily.toLowerCase();
    
    // System font matching
    const systemFonts = ['-apple-system', 'system-ui', 'segoe ui', 'roboto', 'helvetica', 'arial', 'sans-serif'];
    const isSystemFont = systemFonts.some(font => normalizedFamily.includes(font));
    
    if (isSystemFont) {
      return this.designSystem.typography.find(typo => {
        const typoFamily = typo.fontFamily.toLowerCase();
        return systemFonts.some(font => typoFamily.includes(font)) &&
               typo.fontSize === fontSize &&
               this.isSimilarFontWeight(fontWeight, typo.fontWeight);
      });
    }
    
    // Common font family aliases
    const fontAliases = {
      'inter': ['inter', 'system-ui', '-apple-system'],
      'roboto': ['roboto', 'system-ui', 'sans-serif'],
      'helvetica': ['helvetica', 'arial', 'sans-serif'],
      'arial': ['arial', 'helvetica', 'sans-serif'],
      'monaco': ['monaco', 'menlo', 'consolas', 'monospace'],
      'consolas': ['consolas', 'monaco', 'menlo', 'monospace'],
      'times': ['times', 'times new roman', 'serif'],
      'georgia': ['georgia', 'times', 'serif']
    };
    
    for (const [baseFont, aliases] of Object.entries(fontAliases)) {
      if (aliases.some(alias => normalizedFamily.includes(alias))) {
        const match = this.designSystem.typography.find(typo => {
          const typoFamily = typo.fontFamily.toLowerCase();
          return aliases.some(alias => typoFamily.includes(alias)) &&
                 typo.fontSize === fontSize &&
                 this.isSimilarFontWeight(fontWeight, typo.fontWeight);
        });
        if (match) return match;
      }
    }
    
    return null;
  }
  
  /**
   * Check if font families are similar
   */
  isSimilarFontFamily(family1, family2) {
    const f1 = family1.toLowerCase().replace(/['"]/g, '');
    const f2 = family2.toLowerCase().replace(/['"]/g, '');
    
    if (f1 === f2) return true;
    
    // Check if both are system fonts
    const systemFonts = ['-apple-system', 'system-ui', 'segoe ui', 'roboto', 'helvetica', 'arial', 'sans-serif'];
    const f1IsSystem = systemFonts.some(font => f1.includes(font));
    const f2IsSystem = systemFonts.some(font => f2.includes(font));
    
    if (f1IsSystem && f2IsSystem) return true;
    
    // Check if both are monospace fonts
    const monospaceFonts = ['monaco', 'menlo', 'consolas', 'courier', 'monospace'];
    const f1IsMono = monospaceFonts.some(font => f1.includes(font));
    const f2IsMono = monospaceFonts.some(font => f2.includes(font));
    
    if (f1IsMono && f2IsMono) return true;
    
    // Check if both are serif fonts
    const serifFonts = ['times', 'georgia', 'serif'];
    const f1IsSerif = serifFonts.some(font => f1.includes(font));
    const f2IsSerif = serifFonts.some(font => f2.includes(font));
    
    if (f1IsSerif && f2IsSerif) return true;
    
    return false;
  }
  
  /**
   * Check if font weights are similar
   */
  isSimilarFontWeight(weight1, weight2) {
    const w1 = parseInt(weight1) || 400;
    const w2 = parseInt(weight2) || 400;
    
    // Exact match
    if (w1 === w2) return true;
    
    // Weight tolerance (within 100 units)
    if (Math.abs(w1 - w2) <= 100) return true;
    
    // Weight category matching
    const getWeightCategory = (weight) => {
      if (weight <= 300) return 'light';
      if (weight <= 500) return 'normal';
      if (weight <= 700) return 'bold';
      return 'heavy';
    };
    
    return getWeightCategory(w1) === getWeightCategory(w2);
  }

  /**
   * Add missing component to list (avoid duplicates)
   */
  addMissingComponent(list, component) {
    const existing = list.find(c => c.name === component.name && c.type === component.type);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      list.push({ ...component, count: 1 });
    }
  }

  /**
   * Add missing color to list (avoid duplicates)
   */
  addMissingColor(list, color) {
    const existing = list.find(c => c.value === color.value);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      list.push({ ...color, count: 1 });
    }
  }

  /**
   * Add missing typography to list (avoid duplicates)
   */
  addMissingTypography(list, typography) {
    const existing = list.find(t => 
      t.fontFamily === typography.fontFamily &&
      t.fontSize === typography.fontSize &&
      t.fontWeight === typography.fontWeight
    );
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      list.push({ ...typography, count: 1 });
    }
  }

  /**
   * Map Figma element type to design system component type
   */
  mapFigmaTypeToComponentType(figmaType) {
    const typeMap = {
      'FRAME': 'container',
      'RECTANGLE': 'card',
      'INSTANCE': 'component',
      'TEXT': 'text',
      'VECTOR': 'icon',
      'GROUP': 'group',
      'COMPONENT': 'component',
      'COMPONENT_SET': 'component-set'
    };
    return typeMap[figmaType] || 'unknown';
  }

  /**
   * Extract component properties from Figma element
   */
  extractComponentProperties(element) {
    return {
      width: element.absoluteBoundingBox?.width,
      height: element.absoluteBoundingBox?.height,
      visible: element.visible,
      opacity: element.opacity,
      figmaType: element.type
    };
  }

  /**
   * Convert RGB color to hex
   */
  rgbToHex(color) {
    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Infer color type based on color values
   */
  inferColorType(color) {
    const hex = this.rgbToHex(color);
    
    // Basic color type inference
    if (hex === '#ffffff') return 'background';
    if (hex === '#000000') return 'text';
    if (color.r > 0.8 && color.g < 0.3 && color.b < 0.3) return 'error';
    if (color.r < 0.3 && color.g > 0.8 && color.b < 0.3) return 'success';
    if (color.r < 0.3 && color.g < 0.3 && color.b > 0.8) return 'primary';
    if (color.r > 0.8 && color.g > 0.6 && color.b < 0.3) return 'warning';
    
    return 'custom';
  }

  /**
   * Generate suggestions based on missing elements
   */
  generateSuggestions(analysis) {
    const suggestions = [];
    
    analysis.missingComponents.forEach(component => {
      suggestions.push(`Add "${component.name}" component to design system`);
    });
    
    analysis.missingColors.forEach(color => {
      suggestions.push(`Add color "${color.value}" to design system palette`);
    });
    
    analysis.missingTypography.forEach(typo => {
      suggestions.push(`Add typography style "${typo.fontFamily} ${typo.fontSize}" to design system`);
    });

    if (analysis.missingComponents.length > 5) {
      suggestions.push('Consider creating component variants to reduce duplication');
    }

    if (analysis.missingColors.length > 10) {
      suggestions.push('Review color usage - consider consolidating similar colors');
    }

    return suggestions;
  }
}

export default DesignSystemAnalyzer;