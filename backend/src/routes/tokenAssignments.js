import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Create a token assignment
router.post('/', async (req, res) => {
  try {
    const { missingElementType, missingElementId, designSystemTokenId } = req.body;

    // Validate required fields
    if (!missingElementType || !missingElementId || !designSystemTokenId) {
      return res.status(400).json({
        error: 'Missing required fields: missingElementType, missingElementId, designSystemTokenId'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.tokenAssignment.findFirst({
      where: {
        missingElementType,
        missingElementId,
      }
    });

    if (existingAssignment) {
      // Update existing assignment
      const assignment = await prisma.tokenAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          designSystemTokenId,
          updatedAt: new Date(),
        }
      });

      return res.json(assignment);
    } else {
      // Create new assignment
      const assignment = await prisma.tokenAssignment.create({
        data: {
          missingElementType,
          missingElementId,
          designSystemTokenId,
        }
      });

      return res.status(201).json(assignment);
    }
  } catch (error) {
    console.error('Error creating token assignment:', error);
    res.status(500).json({ error: 'Failed to create token assignment' });
  }
});

// Get all assignments for a design system
router.get('/design-system/:designSystemId', async (req, res) => {
  try {
    const { designSystemId } = req.params;

    // Get all missing elements for the design system first
    const missingElementsData = await prisma.missingElements.findMany({
      where: {
        analysis: {
          designSystemId: designSystemId
        }
      },
      include: {
        missingComponents: true,
        missingColors: true,
        missingTypography: true,
      }
    });

    // Get all element IDs
    const allElementIds = [];
    missingElementsData.forEach(me => {
      me.missingComponents.forEach(comp => allElementIds.push(comp.id));
      me.missingColors.forEach(color => allElementIds.push(color.id));
      me.missingTypography.forEach(typo => allElementIds.push(typo.id));
    });

    // Get assignments for these elements
    const assignments = await prisma.tokenAssignment.findMany({
      where: {
        missingElementId: {
          in: allElementIds
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching token assignments:', error);
    res.status(500).json({ error: 'Failed to fetch token assignments' });
  }
});

// Delete an assignment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tokenAssignment.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting token assignment:', error);
    res.status(500).json({ error: 'Failed to delete token assignment' });
  }
});

// Get intelligent token suggestions for a missing element
router.get('/suggestions/:missingElementId', async (req, res) => {
  try {
    const { missingElementId } = req.params;
    const { type, designSystemId } = req.query;

    if (!designSystemId) {
      return res.status(400).json({ error: 'designSystemId is required' });
    }

    // Get the missing element details
    const missingElement = await getMissingElementDetails(missingElementId, type);
    if (!missingElement) {
      return res.status(404).json({ error: 'Missing element not found' });
    }

    // Get intelligent suggestions based on the element type and properties
    const suggestions = await generateIntelligentSuggestions(missingElement, type, designSystemId);

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting token suggestions:', error);
    res.status(500).json({ error: 'Failed to get token suggestions' });
  }
});

// Helper function to get missing element details
async function getMissingElementDetails(elementId, type) {
  try {
    switch (type) {
      case 'component':
        return await prisma.missingComponent.findUnique({ where: { id: elementId } });
      case 'color':
        return await prisma.missingColor.findUnique({ where: { id: elementId } });
      case 'typography':
        return await prisma.missingTypography.findUnique({ where: { id: elementId } });
      default:
        return null;
    }
  } catch (error) {
    console.error('Error getting missing element details:', error);
    return null;
  }
}

// Helper function to generate intelligent suggestions
async function generateIntelligentSuggestions(missingElement, type, designSystemId) {
  // Import the design system analyzer
  const { DesignSystemAnalyzer } = await import('../services/designSystemAnalyzer.js');
  const analyzer = new DesignSystemAnalyzer(designSystemId);
  await analyzer.loadDesignSystem();

  const suggestions = [];

  switch (type) {
    case 'component':
      suggestions.push(...generateComponentSuggestions(missingElement, analyzer.designSystem.components));
      break;
    case 'color':
      suggestions.push(...generateColorSuggestions(missingElement, analyzer.designSystem.colors));
      break;
    case 'typography':
      suggestions.push(...generateTypographySuggestions(missingElement, analyzer.designSystem.typography));
      break;
  }

  // Sort by similarity score and return top 5
  return suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

// Generate component suggestions with similarity scoring
function generateComponentSuggestions(missingComponent, designSystemComponents) {
  const suggestions = [];
  const elementName = missingComponent.name?.toLowerCase() || '';
  const elementType = missingComponent.type;

  designSystemComponents.forEach(comp => {
    let similarity = 0;

    // Exact name match
    if (comp.name.toLowerCase() === elementName) {
      similarity = 1.0;
    }
    // Partial name match
    else if (elementName.includes(comp.name.toLowerCase()) || comp.name.toLowerCase().includes(elementName)) {
      similarity = 0.8;
    }
    // Alias matching
    else if (comp.aliases && comp.aliases.some(alias => 
      elementName.includes(alias.toLowerCase()) || alias.toLowerCase().includes(elementName)
    )) {
      similarity = 0.7;
    }
    // Type matching
    else if (comp.type === elementType) {
      similarity = 0.5;
    }
    // Keyword matching
    else {
      const elementKeywords = elementName.split(/[\s\-_]+/);
      const compKeywords = comp.name.toLowerCase().split(/[\s\-_]+/);
      const matchingKeywords = elementKeywords.filter(k => compKeywords.includes(k));
      if (matchingKeywords.length > 0) {
        similarity = 0.4 + (matchingKeywords.length / Math.max(elementKeywords.length, compKeywords.length)) * 0.3;
      }
    }

    if (similarity > 0.3) {
      suggestions.push({
        id: comp.id,
        name: comp.name,
        value: comp.type,
        type: comp.type,
        similarity: Math.round(similarity * 100) / 100,
        reason: getSuggestionReason(similarity)
      });
    }
  });

  return suggestions;
}

// Generate color suggestions with similarity scoring
function generateColorSuggestions(missingColor, designSystemColors) {
  const suggestions = [];
  const missingHex = missingColor.value;
  const missingRgb = hexToRgb(missingHex);

  if (!missingRgb) return suggestions;

  designSystemColors.forEach(color => {
    let similarity = 0;
    const colorRgb = hexToRgb(color.value);
    
    if (!colorRgb) return;

    // Exact color match
    if (color.value.toLowerCase() === missingHex.toLowerCase()) {
      similarity = 1.0;
    }
    // Color distance based matching
    else {
      const distance = calculateColorDistance(missingRgb, colorRgb);
      if (distance <= 50) {
        similarity = Math.max(0, 1 - (distance / 50));
      }
    }

    // Color name/type matching
    const missingColorName = getBasicColorName(missingRgb);
    if (color.aliases && color.aliases.includes(missingColorName)) {
      similarity = Math.max(similarity, 0.6);
    }

    if (similarity > 0.3) {
      suggestions.push({
        id: color.id,
        name: color.name,
        value: color.value,
        type: color.type,
        similarity: Math.round(similarity * 100) / 100,
        reason: getSuggestionReason(similarity)
      });
    }
  });

  return suggestions;
}

// Generate typography suggestions with similarity scoring
function generateTypographySuggestions(missingTypography, designSystemTypography) {
  const suggestions = [];
  const missingSize = parseInt(missingTypography.fontSize);
  const missingWeight = parseInt(missingTypography.fontWeight) || 400;
  const missingFamily = missingTypography.fontFamily?.toLowerCase() || '';

  designSystemTypography.forEach(typo => {
    let similarity = 0;
    const typoSize = parseInt(typo.fontSize);
    const typoWeight = parseInt(typo.fontWeight) || 400;
    const typoFamily = typo.fontFamily?.toLowerCase() || '';

    // Exact match
    if (typoSize === missingSize && typoWeight === missingWeight && typoFamily === missingFamily) {
      similarity = 1.0;
    }
    // Font family and size match
    else if (isSimilarFontFamily(missingFamily, typoFamily) && Math.abs(typoSize - missingSize) <= 2) {
      similarity = 0.9;
    }
    // Size and weight match with different family
    else if (Math.abs(typoSize - missingSize) <= 2 && Math.abs(typoWeight - missingWeight) <= 100) {
      similarity = 0.7;
    }
    // Similar size only
    else if (Math.abs(typoSize - missingSize) <= 4) {
      similarity = 0.5;
    }
    // Alias matching
    else if (typo.aliases && typo.aliases.some(alias => 
      missingFamily.includes(alias.toLowerCase()) || alias.toLowerCase().includes(missingFamily)
    )) {
      similarity = 0.6;
    }

    if (similarity > 0.3) {
      suggestions.push({
        id: typo.id,
        name: typo.name,
        value: `${typo.fontSize} ${typo.fontWeight}`,
        type: 'typography',
        similarity: Math.round(similarity * 100) / 100,
        reason: getSuggestionReason(similarity)
      });
    }
  });

  return suggestions;
}

// Helper functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function calculateColorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb2.r - rgb1.r, 2) + 
    Math.pow(rgb2.g - rgb1.g, 2) + 
    Math.pow(rgb2.b - rgb1.b, 2)
  );
}

function getBasicColorName(rgb) {
  if (rgb.r > 200 && rgb.g > 200 && rgb.b > 200) return 'white';
  if (rgb.r < 50 && rgb.g < 50 && rgb.b < 50) return 'black';
  if (Math.abs(rgb.r - rgb.g) < 20 && Math.abs(rgb.g - rgb.b) < 20) return 'gray';
  if (rgb.r > rgb.g && rgb.r > rgb.b) return 'red';
  if (rgb.g > rgb.r && rgb.g > rgb.b) return 'green';
  if (rgb.b > rgb.r && rgb.b > rgb.g) return 'blue';
  return 'unknown';
}

function isSimilarFontFamily(family1, family2) {
  if (family1 === family2) return true;
  
  const systemFonts = ['-apple-system', 'system-ui', 'segoe ui', 'roboto', 'helvetica', 'arial'];
  const f1IsSystem = systemFonts.some(font => family1.includes(font));
  const f2IsSystem = systemFonts.some(font => family2.includes(font));
  
  return f1IsSystem && f2IsSystem;
}

function getSuggestionReason(similarity) {
  if (similarity >= 0.9) return 'Excellent match';
  if (similarity >= 0.7) return 'Very good match';
  if (similarity >= 0.5) return 'Good match';
  if (similarity >= 0.4) return 'Partial match';
  return 'Basic match';
}

export default router;