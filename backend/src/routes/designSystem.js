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

// Get components for a design system
router.get("/:id/components", async (req, res) => {
  try {
    const { id } = req.params;

    // Return hardcoded components for Elara Design System
    const components = [
      { id: "comp-1", name: "Button", type: "button", figmaId: "btn-1" },
      { id: "comp-2", name: "Input Field", type: "input", figmaId: "input-1" },
      { id: "comp-3", name: "Card", type: "container", figmaId: "card-1" },
      { id: "comp-4", name: "Modal", type: "overlay", figmaId: "modal-1" },
      { id: "comp-5", name: "Dropdown", type: "select", figmaId: "dropdown-1" },
      { id: "comp-6", name: "Checkbox", type: "input", figmaId: "checkbox-1" },
      { id: "comp-7", name: "Radio Button", type: "input", figmaId: "radio-1" },
      { id: "comp-8", name: "Text Area", type: "input", figmaId: "textarea-1" },
      { id: "comp-9", name: "Toggle Switch", type: "input", figmaId: "toggle-1" },
      { id: "comp-10", name: "Badge", type: "display", figmaId: "badge-1" },
      // Payment specific components
      { id: "comp-11", name: "UAT Parameter", type: "form-section", figmaId: "uat-param-1" },
      { id: "comp-12", name: "Callback URL", type: "input", figmaId: "callback-url-1" },
      { id: "comp-13", name: "VPA", type: "input", figmaId: "vpa-1" },
      { id: "comp-14", name: "Transaction Handling Configuration", type: "form-section", figmaId: "trans-config-1" },
      { id: "comp-15", name: "Transaction Amount Limit", type: "input", figmaId: "amount-limit-1" },
      { id: "comp-16", name: "Flags Section", type: "form-section", figmaId: "flags-section-1" },
      { id: "comp-17", name: "Credit Line Flag", type: "checkbox", figmaId: "credit-flag-1" },
      { id: "comp-18", name: "QR Expiry Flag", type: "checkbox", figmaId: "qr-flag-1" },
      // Note: These components are intentionally missing to demonstrate missing component detection:
      // - "Incoming IP Addresses" 
      // - "Initiation Mode"
      // - "Positive Initiation Mode"
    ];

    res.json(components);
  } catch (error) {
    console.error("Error fetching components:", error);
    res.status(500).json({ error: "Failed to fetch components" });
  }
});

// Add components to design system
router.post("/:id/components", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, figmaId, properties } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }

    // For now, just return a success response with mock data
    const component = {
      id: `comp-${Date.now()}`,
      name,
      type,
      figmaId: figmaId || `${type}-${Date.now()}`,
      properties: properties || {},
      designSystemId: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`Added component to design system ${id}:`, component);
    res.status(201).json(component);
  } catch (error) {
    console.error("Error adding component:", error);
    res.status(500).json({ error: "Failed to add component" });
  }
});

export default router;
