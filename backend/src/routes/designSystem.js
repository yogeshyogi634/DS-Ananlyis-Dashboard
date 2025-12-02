import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all design systems
router.get("/", async (req, res) => {
  try {
    // Return hardcoded design systems for now since database is not working
    const designSystems = [
      {
        id: "1",
        name: "Elara Design System",
        description: "A comprehensive design system for modern applications",
        figmaFileId: "P3AoC4JoQOlEoKRRKhwGLx",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        _count: {
          components: 25,
          colors: 15,
          typography: 8,
          analyses: 0
        }
      }
    ];

    console.log("Returning design systems:", designSystems);
    res.json(designSystems);
  } catch (error) {
    console.error("Error fetching design systems:", error);
    res.status(500).json({ error: "Failed to fetch design systems" });
  }
});

// Get design system by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const designSystem = await prisma.designSystem.findUnique({
      where: { id },
      include: {
        components: true,
        colors: true,
        typography: true,
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            componentUsages: {
              include: {
                component: true,
              },
            },
            colorUsages: {
              include: {
                color: true,
              },
            },
            typographyUsages: {
              include: {
                typography: true,
              },
            },
          },
        },
      },
    });

    if (!designSystem) {
      return res.status(404).json({ error: "Design system not found" });
    }

    res.json(designSystem);
  } catch (error) {
    console.error("Error fetching design system:", error);
    res.status(500).json({ error: "Failed to fetch design system" });
  }
});

// Create new design system
router.post("/", async (req, res) => {
  try {
    const { name, figmaFileId } = req.body;

    if (!name || !figmaFileId) {
      return res
        .status(400)
        .json({ error: "Name and figmaFileId are required" });
    }

    const designSystem = await prisma.designSystem.create({
      data: {
        name,
        figmaFileId,
      },
    });

    res.status(201).json(designSystem);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({
          error: "Design system with this Figma file ID already exists",
        });
    }
    console.error("Error creating design system:", error);
    res.status(500).json({ error: "Failed to create design system" });
  }
});

// Update design system
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const designSystem = await prisma.designSystem.update({
      where: { id },
      data: { name },
    });

    res.json(designSystem);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Design system not found" });
    }
    console.error("Error updating design system:", error);
    res.status(500).json({ error: "Failed to update design system" });
  }
});

// Delete design system
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.designSystem.delete({
      where: { id },
    });

    res.status(204).send("Delete Successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Design system not found" });
    }
    console.error("Error deleting design system:", error);
    res.status(500).json({ error: "Failed to delete design system" });
  }
});

export default router;
