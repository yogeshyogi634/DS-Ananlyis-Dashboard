import express from 'express';
import { PrismaClient } from '@prisma/client';
import { DesignSystemAnalyzer } from '../services/designSystemAnalyzer.js';

const router = express.Router();
const prisma = new PrismaClient();

// Temporary in-memory storage for analyses
let analysesStorage = [];

// Temporary in-memory storage for missing elements
let missingElementsStorage = [];

// Create new analysis from Figma plugin data
router.post('/', async (req, res) => {
  try {
    const { 
      designSystemId, 
      frameId, 
      frameName, 
      figmaElements,  // Changed: now expecting raw Figma elements
      analysisData    // Optional: can still accept pre-analyzed data
    } = req.body;

    console.log('🔍 Received analysis data:', {
      designSystemId,
      frameId,
      frameName,
      elementsCount: figmaElements?.length,
      hasAnalysisData: !!analysisData,
      requestBodyKeys: Object.keys(req.body)
    });
    
    // Debug: Log the first few figma elements
    if (figmaElements && figmaElements.length > 0) {
      console.log('📝 Sample figmaElements:', figmaElements.slice(0, 3).map(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        hasStyle: !!el.style,
        hasFills: !!el.fills
      })));
    }

    if (!designSystemId || !frameId || !frameName) {
      return res.status(400).json({ 
        error: 'designSystemId, frameId, and frameName are required' 
      });
    }

    let processedAnalysisData;

    // If we have raw Figma elements, analyze them dynamically
    if (figmaElements && figmaElements.length > 0) {
      console.log('🧠 Performing dynamic analysis of Figma elements...');
      console.log('📊 Elements to analyze:', figmaElements.length);
      
      const analyzer = new DesignSystemAnalyzer(designSystemId);
      processedAnalysisData = await analyzer.analyzeMissingElements(figmaElements);
      
      console.log('✅ Dynamic analysis completed:', {
        totalElements: processedAnalysisData.totalElements,
        compliantElements: processedAnalysisData.dsCompliantElements,
        missingComponents: processedAnalysisData.missingComponents?.length || 0,
        missingColors: processedAnalysisData.missingColors?.length || 0,
        missingTypography: processedAnalysisData.missingTypography?.length || 0
      });
      
      // Debug: Show what missing elements were found
      if (processedAnalysisData.missingComponents?.length > 0) {
        console.log('🔴 Found missing components:', processedAnalysisData.missingComponents.map(c => c.name));
      }
      if (processedAnalysisData.missingColors?.length > 0) {
        console.log('🟠 Found missing colors:', processedAnalysisData.missingColors.map(c => c.value));
      }
      if (processedAnalysisData.missingTypography?.length > 0) {
        console.log('🟣 Found missing typography:', processedAnalysisData.missingTypography.map(t => `${t.fontFamily} ${t.fontSize}`));
      }
    } else if (analysisData) {
      // Use pre-analyzed data (backwards compatibility)
      processedAnalysisData = analysisData;
      console.log('Using pre-analyzed data');
    } else {
      return res.status(400).json({ 
        error: 'Either figmaElements or analysisData must be provided' 
      });
    }

    // Calculate compliance percentage
    const totalElements = processedAnalysisData.totalElements || 0;
    const dsCompliantElements = processedAnalysisData.dsCompliantElements || 0;
    const compliancePercentage = totalElements > 0 
      ? (dsCompliantElements / totalElements) * 100 
      : 0;

    // Create analysis in database
    const analysis = await prisma.analysis.create({
      data: {
        frameId,
        frameName,
        totalElements,
        dsCompliantElements,
        compliancePercentage,
        designSystemId,
        missingElements: {
          create: {
            missingComponents: {
              create: (processedAnalysisData.missingComponents || []).map(comp => ({
                name: comp.name,
                type: comp.type,
                count: comp.count || 1,
                properties: comp.properties || {}
              }))
            },
            missingColors: {
              create: (processedAnalysisData.missingColors || []).map(color => ({
                name: color.name || 'Unnamed Color',
                value: color.value || color.hex,
                type: color.type,
                count: color.count || 1
              }))
            },
            missingTypography: {
              create: (processedAnalysisData.missingTypography || []).map(typo => ({
                fontFamily: typo.fontFamily,
                fontSize: typo.fontSize,
                fontWeight: typo.fontWeight,
                lineHeight: typo.lineHeight,
                count: typo.count || 1
              }))
            },
            nonCompliantElements: processedAnalysisData.nonCompliantElements || [],
            suggestions: processedAnalysisData.suggestions || []
          }
        }
      },
      include: {
        missingElements: {
          include: {
            missingComponents: true,
            missingColors: true,
            missingTypography: true
          }
        }
      }
    });

    // Also add to in-memory storage for backwards compatibility
    analysesStorage.push({
      id: analysis.id,
      frameId: analysis.frameId,
      frameName: analysis.frameName,
      totalElements: analysis.totalElements,
      dsCompliantElements: analysis.dsCompliantElements,
      compliancePercentage: analysis.compliancePercentage,
      designSystemId: analysis.designSystemId,
      missingElementsId: analysis.missingElements?.id,
      createdAt: analysis.createdAt.toISOString()
    });

    if (analysis.missingElements) {
      missingElementsStorage.push({
        id: analysis.missingElements.id,
        analysisId: analysis.id,
        designSystemId: analysis.designSystemId,
        frameId: analysis.frameId,
        frameName: analysis.frameName,
        missingComponents: analysis.missingElements.missingComponents,
        missingColors: analysis.missingElements.missingColors,
        missingTypography: analysis.missingElements.missingTypography,
        nonCompliantElements: analysis.missingElements.nonCompliantElements,
        suggestions: analysis.missingElements.suggestions,
        createdAt: analysis.missingElements.createdAt.toISOString()
      });
    }
    
    console.log('Stored analysis in MongoDB:', analysis.id);

    res.status(201).json({ 
      success: true, 
      analysis,
      missingElements: analysis.missingElements,
      message: 'Analysis data stored in MongoDB successfully' 
    });
    
  } catch (error) {
    console.error('Error processing analysis:', error);
    res.status(500).json({ error: 'Failed to process analysis' });
  }
});

// Get analysis by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        missingElements: {
          include: {
            missingComponents: true,
            missingColors: true,
            missingTypography: true
          }
        }
      }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Get all analyses for a design system
router.get('/design-system/:designSystemId', async (req, res) => {
  try {
    const { designSystemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get analyses from database
    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where: { designSystemId },
        include: {
          missingElements: {
            include: {
              missingComponents: true,
              missingColors: true,
              missingTypography: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.analysis.count({
        where: { designSystemId }
      })
    ]);

    console.log(`Returning ${analyses.length} analyses for design system ${designSystemId}`);

    res.json({
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Get design system compliance metrics
router.get('/metrics/:designSystemId', async (req, res) => {
  try {
    const { designSystemId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get analyses from database
    const analyses = await prisma.analysis.findMany({
      where: {
        designSystemId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        missingElements: {
          include: {
            missingComponents: true,
            missingColors: true,
            missingTypography: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate metrics
    const totalAnalyses = analyses.length;
    const avgCompliance = totalAnalyses > 0 
      ? analyses.reduce((sum, analysis) => sum + analysis.compliancePercentage, 0) / totalAnalyses 
      : 0;

    const complianceOverTime = analyses.map(analysis => {
      const missingElements = analysis.missingElements?.[0] || null;
      return {
        date: analysis.createdAt,
        compliance: analysis.compliancePercentage,
        frameName: analysis.frameName,
        analysisId: analysis.id,
        missingElementsCounts: missingElements ? {
          components: missingElements.missingComponents?.length || 0,
          colors: missingElements.missingColors?.length || 0,
          typography: missingElements.missingTypography?.length || 0
        } : {
          components: 0,
          colors: 0,
          typography: 0
        },
        missingElements: missingElements ? {
          components: missingElements.missingComponents || [],
          colors: missingElements.missingColors || [],
          typography: missingElements.missingTypography || []
        } : {
          components: [],
          colors: [],
          typography: []
        }
      };
    });

    console.log(`Returning metrics for design system ${designSystemId}: ${totalAnalyses} analyses, ${avgCompliance}% avg compliance`);

    res.json({
      totalAnalyses,
      avgCompliance: Math.round(avgCompliance * 100) / 100,
      complianceOverTime,
      dateRange: {
        start: startDate,
        end: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get missing elements for an analysis
router.get('/missing-elements/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;

    const missingElements = await prisma.missingElements.findUnique({
      where: { analysisId },
      include: {
        missingComponents: true,
        missingColors: true,
        missingTypography: true
      }
    });

    if (!missingElements) {
      return res.status(404).json({ error: 'Missing elements data not found for this analysis' });
    }

    res.json(missingElements);
  } catch (error) {
    console.error('Error fetching missing elements:', error);
    res.status(500).json({ error: 'Failed to fetch missing elements' });
  }
});

// Get all missing elements for a design system
router.get('/missing-elements/design-system/:designSystemId', async (req, res) => {
  try {
    const { designSystemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get missing elements from database through analysis relationship
    const [missingElements, total] = await Promise.all([
      prisma.missingElements.findMany({
        where: {
          analysis: {
            designSystemId
          }
        },
        include: {
          missingComponents: true,
          missingColors: true,
          missingTypography: true,
          analysis: {
            select: {
              frameId: true,
              frameName: true,
              designSystemId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.missingElements.count({
        where: {
          analysis: {
            designSystemId
          }
        }
      })
    ]);

    console.log(`Returning ${missingElements.length} missing elements for design system ${designSystemId}`);

    res.json({
      missingElements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching missing elements:', error);
    res.status(500).json({ error: 'Failed to fetch missing elements' });
  }
});

// Get missing elements summary for a design system
router.get('/missing-summary/:designSystemId', async (req, res) => {
  try {
    const { designSystemId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get missing elements from database
    const missingElementsData = await prisma.missingElements.findMany({
      where: {
        analysis: {
          designSystemId
        },
        createdAt: {
          gte: startDate
        }
      },
      include: {
        missingComponents: true,
        missingColors: true,
        missingTypography: true
      }
    });

    // Aggregate missing components, colors, and typography
    const componentCounts = {};
    const colorCounts = {};
    const typographyCounts = {};
    const suggestions = [];

    missingElementsData.forEach(elements => {
      // Count missing components
      elements.missingComponents.forEach(comp => {
        componentCounts[comp.name] = (componentCounts[comp.name] || 0) + comp.count;
      });

      // Count missing colors
      elements.missingColors.forEach(color => {
        const key = `${color.name || 'unnamed'}_${color.value}`;
        colorCounts[key] = (colorCounts[key] || 0) + color.count;
      });

      // Count missing typography
      elements.missingTypography.forEach(typo => {
        const key = `${typo.fontFamily}_${typo.fontSize}_${typo.fontWeight}`;
        typographyCounts[key] = (typographyCounts[key] || 0) + typo.count;
      });

      // Collect suggestions
      if (elements.suggestions && Array.isArray(elements.suggestions)) {
        suggestions.push(...elements.suggestions);
      }
    });

    // Convert counts to arrays sorted by frequency
    const topMissingComponents = Object.entries(componentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topMissingColors = Object.entries(colorCounts)
      .map(([key, count]) => {
        const [name, value] = key.split('_');
        return { name: name === 'unnamed' ? null : name, value, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topMissingTypography = Object.entries(typographyCounts)
      .map(([key, count]) => {
        const [fontFamily, fontSize, fontWeight] = key.split('_');
        return { fontFamily, fontSize, fontWeight, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get unique suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 20);

    const summary = {
      totalAnalyses: missingElementsData.length,
      topMissingComponents,
      topMissingColors,
      topMissingTypography,
      suggestions: uniqueSuggestions,
      dateRange: {
        start: startDate,
        end: new Date()
      }
    };

    console.log(`Returning missing elements summary for design system ${designSystemId}`);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching missing elements summary:', error);
    res.status(500).json({ error: 'Failed to fetch missing elements summary' });
  }
});

// Delete analysis
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Use a transaction to ensure proper deletion order
    await prisma.$transaction(async (tx) => {
      // First, get the missing elements to delete their child records
      const missingElementsRecord = await tx.missingElements.findFirst({
        where: { analysisId: id },
        include: {
          missingComponents: true,
          missingColors: true,
          missingTypography: true
        }
      });

      if (missingElementsRecord) {
        // Delete all child records first
        await tx.missingComponent.deleteMany({
          where: { missingElementsId: missingElementsRecord.id }
        });
        
        await tx.missingColor.deleteMany({
          where: { missingElementsId: missingElementsRecord.id }
        });
        
        await tx.missingTypography.deleteMany({
          where: { missingElementsId: missingElementsRecord.id }
        });

        // Delete the missing elements record
        await tx.missingElements.delete({
          where: { id: missingElementsRecord.id }
        });
      }

      // Finally, delete the analysis
      await tx.analysis.delete({
        where: { id }
      });
    });

    // Also remove from in-memory storage for backwards compatibility
    const analysisIndex = analysesStorage.findIndex(analysis => analysis.id === id);
    if (analysisIndex !== -1) {
      analysesStorage.splice(analysisIndex, 1);
    }

    const missingElementsIndex = missingElementsStorage.findIndex(
      elements => elements.analysisId === id
    );
    if (missingElementsIndex !== -1) {
      missingElementsStorage.splice(missingElementsIndex, 1);
    }
    
    console.log(`Deleted analysis ${id} and all its related data from MongoDB`);

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    console.error('Error deleting analysis:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

export default router;