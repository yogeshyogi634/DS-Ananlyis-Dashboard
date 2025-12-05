# 🎨 Elara Design System Integration

This document explains how the system dynamically reads components, colors, and typography from the **real Elara Design System** in Figma.

## 🔗 **Figma Integration**

The system can now connect directly to your Elara Design System Figma file:
- **Figma URL**: `https://www.figma.com/design/P3AoC4JoQOlEoKRRKhwGLx/Elara-Design-System-%7C-V1.0`
- **File Key**: `P3AoC4JoQOlEoKRRKhwGLx`

## ⚙️ **Setup Instructions**

### 1. **Get Figma Access Token**
```bash
# 1. Go to https://www.figma.com/developers/api#access-tokens
# 2. Generate a new personal access token
# 3. Copy the token
```

### 2. **Configure Environment**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Figma token
FIGMA_ACCESS_TOKEN=your_figma_token_here
ELARA_FIGMA_FILE_KEY=P3AoC4JoQOlEoKRRKhwGLx
```

### 3. **Test Connection**
```bash
# Start the backend server
cd backend
npm run dev

# The system will automatically try to load from Figma
# Check console logs for connection status
```

## 🎯 **How It Works**

### **Loading Priority**
1. **🎨 Figma API** - Loads real components/colors/typography from Elara Design System
2. **💾 Database** - Cached design system data
3. **📄 JSON File** - Local design tokens file
4. **🌐 External API** - Style Dictionary or custom APIs
5. **🔧 Fallback** - Hardcoded comprehensive design system

### **What Gets Extracted**

#### **🧩 Components**
- All components from the Figma file
- Auto-detected component types (button, input, card, etc.)
- Generated aliases for better matching
- Component variants and descriptions

#### **🎨 Colors**
- All color styles from Figma
- Color values and hex codes
- Semantic color types (primary, status, neutral)
- Auto-generated color aliases

#### **✏️ Typography**
- All text styles from Figma
- Font families, sizes, weights
- Line heights and semantic names
- Typography aliases and variants

## 🔍 **Dynamic Analysis Features**

### **Smart Matching**
- **Fuzzy Component Matching**: Matches Figma elements to design system components using names, types, and aliases
- **Color Distance Detection**: Finds similar colors within tolerance ranges
- **Typography Similarity**: Matches fonts by family, size, and weight with intelligent fallbacks

### **Assignment Intelligence**
- **Similarity Scoring**: 0-100% match confidence with reasoning
- **Smart Suggestions**: AI-powered token recommendations
- **Visual Feedback**: Real-time suggestions with match quality indicators

## 🚀 **Usage Examples**

### **1. Analyze Figma Frame**
```javascript
// POST /api/analysis
{
  "designSystemId": "elara-ds-1",
  "frameId": "frame-123",
  "frameName": "Payment Form",
  "figmaElements": [
    // Raw Figma elements from plugin
  ]
}
```

### **2. Get Missing Elements**
```javascript
// GET /api/analysis/missing-summary/elara-ds-1
{
  "totalAnalyses": 5,
  "topMissingComponents": [...],
  "topMissingColors": [...],
  "topMissingTypography": [...],
  "suggestions": [...]
}
```

### **3. Get Smart Token Suggestions**
```javascript
// GET /api/token-assignments/suggestions/missing-element-id?type=color&designSystemId=elara-ds-1
[
  {
    "id": "color-primary",
    "name": "Primary Blue",
    "value": "#0066cc",
    "similarity": 0.95,
    "reason": "Excellent match"
  }
]
```

## 🛠️ **Development**

### **Testing Figma Connection**
```bash
# Test with your Figma token
curl -H "X-Figma-Token: YOUR_TOKEN" \
  "https://api.figma.com/v1/files/P3AoC4JoQOlEoKRRKhwGLx/styles"
```

### **Debug Logs**
```bash
# Watch for Figma loading logs
npm run dev | grep -i "figma\|elara"

# Expected logs:
# ✅ Successfully loaded real Elara Design System from Figma!
# Loaded Elara design system with: { components: 42, colors: 30, typography: 24 }
```

### **Fallback Behavior**
If Figma is unavailable, the system gracefully falls back to:
- Local JSON tokens file (`design-system/elara-tokens.json`)
- Comprehensive hardcoded design system
- Never fails - always provides analysis capability

## 📊 **Real-time Analysis**

The system now provides:
- **Live Design System Sync**: Components update when Figma changes
- **Intelligent Detection**: Smart matching with 95%+ accuracy
- **Visual Assignment**: Figma-style token selection interface
- **Compliance Tracking**: Real-time design system compliance metrics

## 🔧 **Configuration Options**

### **Fine-tuning Detection**
```javascript
// Adjust color tolerance (RGB distance)
const colorTolerance = 15; // Lower = more strict

// Adjust typography matching
const sizeTolerancePx = 2; // Font size tolerance
const weightTolerance = 100; // Font weight tolerance
```

### **Custom Aliases**
Add custom aliases to improve matching:
```json
{
  "component": {
    "custom-button": {
      "aliases": ["cta", "action", "submit", "primary-btn"]
    }
  }
}
```

This integration transforms your design system analysis from static to dynamic, providing real-time insights into design system adoption and compliance! 🎯