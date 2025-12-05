import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { FigmaElaraLoader } from './figmaElaraLoader.js';

const prisma = new PrismaClient();

/**
 * Elara Design System Loader
 * Supports loading design system data from multiple sources
 */
export class ElaraDesignSystemLoader {
  constructor(designSystemId) {
    this.designSystemId = designSystemId;
  }

  /**
   * Load design system from various sources
   * Priority: 1. Figma (Real Elara), 2. Database, 3. JSON file, 4. API, 5. Fallback hardcoded
   */
  async loadDesignSystem() {
    try {
      // NEW: Try loading from real Elara Figma file FIRST
      console.log('Attempting to load real Elara Design System from Figma...');
      const figmaSystem = await this.loadFromRealElaraFigma();
      if (figmaSystem) return figmaSystem;

      // Try loading from database
      const dbSystem = await this.loadFromDatabase();
      if (dbSystem) return dbSystem;

      // Try loading from JSON file
      const fileSystem = await this.loadFromFile();
      if (fileSystem) return fileSystem;

      // Try loading from external API
      const apiSystem = await this.loadFromAPI();
      if (apiSystem) return apiSystem;

      // Fallback to hardcoded system
      console.log('Using hardcoded Elara design system as fallback');
      return this.getHardcodedSystem();
      
    } catch (error) {
      console.error('Error loading design system:', error);
      return this.getHardcodedSystem();
    }
  }

  /**
   * Load from real Elara Figma file
   */
  async loadFromRealElaraFigma() {
    try {
      const figmaLoader = new FigmaElaraLoader();
      const elaraSystem = await figmaLoader.loadElaraDesignSystem();
      
      if (elaraSystem && elaraSystem.components && elaraSystem.components.length > 0) {
        console.log('✅ Successfully loaded real Elara Design System from Figma!');
        return elaraSystem;
      }
    } catch (error) {
      console.log('❌ Could not load from Figma, trying other sources...', error.message);
    }
    return null;
  }

  /**
   * Load from database
   */
  async loadFromDatabase() {
    try {
      const designSystem = await prisma.designSystem.findUnique({
        where: { id: this.designSystemId },
        include: {
          components: true,
          colors: true,
          typography: true
        }
      });

      if (designSystem) {
        console.log(`Loaded design system from database: ${designSystem.name}`);
        return this.formatDatabaseSystem(designSystem);
      }
    } catch (error) {
      console.log('Database design system not found, trying other sources...');
    }
    return null;
  }

  /**
   * Load from JSON file (design tokens format)
   */
  async loadFromFile() {
    const possiblePaths = [
      path.join(process.cwd(), 'design-system', 'elara-tokens.json'),
      path.join(process.cwd(), 'assets', 'elara-design-system.json'),
      path.join(process.cwd(), 'tokens', 'elara.json'),
      path.join(process.cwd(), 'src', 'design-system', 'tokens.json'),
      // Add more possible paths where your design system might be stored
    ];

    for (const filePath of possiblePaths) {
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const tokens = JSON.parse(data);
        console.log(`Loaded design system from file: ${filePath}`);
        return this.formatFileSystem(tokens);
      } catch (error) {
        // File doesn't exist or is invalid, continue to next path
      }
    }
    return null;
  }

  /**
   * Load from external API (Style Dictionary, Figma API, etc.)
   */
  async loadFromAPI() {
    try {
      // Example: Load from Style Dictionary build output
      const styleDictionaryUrl = process.env.STYLE_DICTIONARY_API_URL;
      if (styleDictionaryUrl) {
        const response = await fetch(styleDictionaryUrl);
        if (response.ok) {
          const tokens = await response.json();
          console.log('Loaded design system from Style Dictionary API');
          return this.formatAPISystem(tokens);
        }
      }

      // Example: Load from custom design system API
      const designSystemApiUrl = process.env.DESIGN_SYSTEM_API_URL;
      if (designSystemApiUrl) {
        const response = await fetch(`${designSystemApiUrl}/elara/tokens`);
        if (response.ok) {
          const tokens = await response.json();
          console.log('Loaded design system from custom API');
          return this.formatAPISystem(tokens);
        }
      }
    } catch (error) {
      console.log('API design system not available, trying other sources...');
    }
    return null;
  }

  /**
   * Load from Figma API
   */
  async loadFromFigma() {
    try {
      const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
      const figmaFileKey = process.env.ELARA_FIGMA_FILE_KEY;
      
      if (figmaToken && figmaFileKey) {
        const response = await fetch(
          `https://api.figma.com/v1/files/${figmaFileKey}/styles`,
          {
            headers: {
              'X-Figma-Token': figmaToken
            }
          }
        );

        if (response.ok) {
          const styles = await response.json();
          console.log('Loaded design system from Figma API');
          return this.formatFigmaSystem(styles);
        }
      }
    } catch (error) {
      console.log('Figma design system not available, trying other sources...');
    }
    return null;
  }

  /**
   * Format database system data
   */
  formatDatabaseSystem(dbSystem) {
    return {
      components: dbSystem.components.map(comp => ({
        id: comp.id,
        name: comp.name,
        type: comp.type,
        figmaId: comp.figmaId,
        aliases: comp.aliases || [],
        variants: comp.variants || []
      })),
      colors: dbSystem.colors.map(color => ({
        id: color.id,
        name: color.name,
        value: color.value,
        type: color.type,
        aliases: color.aliases || []
      })),
      typography: dbSystem.typography.map(typo => ({
        id: typo.id,
        name: typo.name,
        fontSize: typo.fontSize,
        fontFamily: typo.fontFamily,
        fontWeight: typo.fontWeight,
        lineHeight: typo.lineHeight,
        aliases: typo.aliases || []
      }))
    };
  }

  /**
   * Format file system data (Design Tokens format)
   */
  formatFileSystem(tokens) {
    const components = [];
    const colors = [];
    const typography = [];

    // Parse Design Tokens format
    if (tokens.component) {
      Object.entries(tokens.component).forEach(([key, value]) => {
        components.push({
          id: key,
          name: value.name || key,
          type: value.type || 'component',
          figmaId: value.figmaId,
          aliases: value.aliases || [key],
          variants: value.variants || []
        });
      });
    }

    if (tokens.color) {
      Object.entries(tokens.color).forEach(([key, value]) => {
        colors.push({
          id: key,
          name: value.name || key,
          value: value.value,
          type: value.type || 'color',
          aliases: value.aliases || [key]
        });
      });
    }

    if (tokens.typography || tokens.font) {
      const typoTokens = tokens.typography || tokens.font;
      Object.entries(typoTokens).forEach(([key, value]) => {
        typography.push({
          id: key,
          name: value.name || key,
          fontSize: value.fontSize || value.size,
          fontFamily: value.fontFamily || value.family,
          fontWeight: value.fontWeight || value.weight,
          lineHeight: value.lineHeight,
          aliases: value.aliases || [key]
        });
      });
    }

    return { components, colors, typography };
  }

  /**
   * Format API system data
   */
  formatAPISystem(apiData) {
    // Implement based on your API structure
    return this.formatFileSystem(apiData);
  }

  /**
   * Format Figma system data
   */
  formatFigmaSystem(figmaStyles) {
    const components = [];
    const colors = [];
    const typography = [];

    figmaStyles.meta.styles.forEach(style => {
      switch (style.style_type) {
        case 'FILL':
          colors.push({
            id: style.node_id,
            name: style.name,
            value: style.description || '#000000', // Would need additional API call for actual color
            type: 'color',
            aliases: [style.name.toLowerCase()]
          });
          break;
        case 'TEXT':
          typography.push({
            id: style.node_id,
            name: style.name,
            fontSize: '14px', // Would need additional API call for actual values
            fontFamily: 'Inter',
            fontWeight: '400',
            aliases: [style.name.toLowerCase()]
          });
          break;
        case 'EFFECT':
        case 'GRID':
          // Could be mapped to components
          break;
      }
    });

    return { components, colors, typography };
  }

  /**
   * Hardcoded fallback system (current implementation)
   */
  getHardcodedSystem() {
    return {
      components: [
        // Your existing hardcoded components...
        { id: "comp-1", name: "Button", type: "button", figmaId: "btn-1", variants: ["primary", "secondary", "tertiary"], aliases: ["btn", "cta"] },
        // ... rest of components
      ],
      colors: [
        // Your existing hardcoded colors...
        { id: "color-1", name: "Primary Blue", value: "#0066cc", type: "primary", aliases: ["blue", "main", "brand"] },
        // ... rest of colors
      ],
      typography: [
        // Your existing hardcoded typography...
        { id: "typo-1", name: "Body Medium", fontSize: "14px", fontFamily: "Inter", fontWeight: "400", lineHeight: "20px", aliases: ["body", "text-medium", "p"] },
        // ... rest of typography
      ]
    };
  }
}

export default ElaraDesignSystemLoader;