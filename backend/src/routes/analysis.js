import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Create new analysis from Figma plugin data
router.post('/', async (req, res) => {
  try {
    const { 
      designSystemId, 
      frameId, 
      frameName, 
      analysisData 
    } = req.body;

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

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        frameId,
        frameName,
        totalElements,
        dsCompliantElements,
        compliancePercentage,
        designSystemId
      }
    });

    res.status(201).json({ 
      success: true, 
      analysis,
      message: 'Analysis created successfully' 
    });
    
  } catch (error) {
    console.error('Error creating analysis:', error);
    res.status(500).json({ error: 'Failed to create analysis' });
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

    const skip = (page - 1) * limit;

    const analyses = await prisma.analysis.findMany({
      where: { designSystemId },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.analysis.count({
      where: { designSystemId }
    });

    res.json({
      analyses,
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

    // Get analyses within the date range
    const analyses = await prisma.analysis.findMany({
      where: {
        designSystemId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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

    await prisma.analysis.delete({
      where: { id }
    });

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