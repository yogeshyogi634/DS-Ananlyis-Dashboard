import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Temporary in-memory storage for analyses
let analysesStorage = [];

// Create new analysis from Figma plugin data
router.post('/', async (req, res) => {
  try {
    const { 
      designSystemId, 
      frameId, 
      frameName, 
      analysisData 
    } = req.body;

    console.log('Received analysis data:', {
      designSystemId,
      frameId,
      frameName,
      analysisData
    });

    if (!designSystemId || !frameId || !frameName || !analysisData) {
      return res.status(400).json({ 
        error: 'designSystemId, frameId, frameName, and analysisData are required' 
      });
    }

    // Calculate compliance percentage
    const totalElements = analysisData.totalElements || 0;
    const dsCompliantElements = analysisData.dsCompliantElements || 0;
    const compliancePercentage = totalElements > 0 
      ? (dsCompliantElements / totalElements) * 100 
      : 0;

    // Store in temporary in-memory storage and also return success response
    const analysis = {
      id: Date.now().toString(),
      frameId,
      frameName,
      totalElements,
      dsCompliantElements,
      compliancePercentage,
      designSystemId,
      createdAt: new Date().toISOString()
    };

    // Store in temporary memory
    analysesStorage.push(analysis);
    
    console.log('Stored analysis in memory:', analysis);
    console.log('Total analyses in storage:', analysesStorage.length);

    res.status(201).json({ 
      success: true, 
      analysis,
      message: 'Analysis data received successfully (saved to logs for now)' 
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
        designSystem: true
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

    // Filter analyses from memory storage by design system
    const filteredAnalyses = analysesStorage.filter(
      analysis => analysis.designSystemId === designSystemId
    );

    // Sort by creation date (newest first)
    filteredAnalyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedAnalyses = filteredAnalyses.slice(skip, skip + parseInt(limit));

    const total = filteredAnalyses.length;

    console.log(`Returning ${paginatedAnalyses.length} analyses for design system ${designSystemId}`);

    res.json({
      analyses: paginatedAnalyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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

    // Filter analyses from memory storage by design system and date range
    const analyses = analysesStorage.filter(analysis => 
      analysis.designSystemId === designSystemId &&
      new Date(analysis.createdAt) >= startDate
    );

    // Calculate metrics
    const totalAnalyses = analyses.length;
    const avgCompliance = totalAnalyses > 0 
      ? analyses.reduce((sum, analysis) => sum + analysis.compliancePercentage, 0) / totalAnalyses 
      : 0;

    const complianceOverTime = analyses.map(analysis => ({
      date: analysis.createdAt,
      compliance: analysis.compliancePercentage,
      frameName: analysis.frameName
    }));

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

// Delete analysis
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the analysis in memory storage
    const analysisIndex = analysesStorage.findIndex(analysis => analysis.id === id);
    
    if (analysisIndex === -1) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Remove from storage
    analysesStorage.splice(analysisIndex, 1);
    
    console.log(`Deleted analysis ${id}. Remaining analyses: ${analysesStorage.length}`);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

export default router;