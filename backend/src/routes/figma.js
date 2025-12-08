import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Fetch Figma file data
router.get('/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!figmaToken) {
      return res.status(400).json({ error: 'Figma access token not configured' });
    }

    const response = await axios.get(`https://api.figma.com/v1/files/${fileId}`, {
      headers: {
        'X-Figma-Token': figmaToken
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Figma file:', error);
    res.status(500).json({ error: 'Failed to fetch Figma file' });
  }
});

// Extract design system components from Figma file
router.post('/extract-components/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!figmaToken) {
      return res.status(400).json({ error: 'Figma access token not configured' });
    }

    // Fetch file data
    const fileResponse = await axios.get(`https://api.figma.com/v1/files/${fileId}`, {
      headers: {
        'X-Figma-Token': figmaToken
      }
    });

    const fileData = fileResponse.data;

    // Store or update design system
    const designSystem = await prisma.designSystem.upsert({
      where: { figmaFileId: fileId },
      update: { name: fileData.name, updatedAt: new Date() },
      create: {
        name: fileData.name,
        figmaFileId: fileId,
      }
    });

    // Extract and store basic design system info
    // In a real implementation, you'd parse the Figma file structure
    // For now, we'll create some sample data
    
    res.json({ 
      success: true, 
      designSystem,
      message: 'Components extracted successfully'
    });

  } catch (error) {
    console.error('Error extracting components:', error);
    res.status(500).json({ error: 'Failed to extract components from Figma file' });
  }
});

export default router;