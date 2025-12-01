# Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Figma account

### 2. Install & Configure

```bash
# Clone and install
git clone <your-repo>
cd DS-Ananlyis-Dashboard

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URL and Figma token

# Frontend setup  
cd ../frontend
npm install
cp .env.example .env

# Generate Prisma client
cd ../backend
npx prisma generate
```

### 3. Start Development

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### 4. Install Figma Plugin

1. Open Figma
2. Menu > Plugins > Development > Import plugin from manifest
3. Select `figma-plugin/manifest.json`

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mongodb://localhost:27017/design_system_analytics"
FIGMA_ACCESS_TOKEN="your_figma_token_here"
PORT=3001
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 🎯 Usage Flow

1. **Dashboard**: Add your Figma design system (localhost:5173)
2. **Plugin**: Analyze frames in Figma 
3. **Results**: View analytics in dashboard

## 🆘 Troubleshooting

- **Plugin not connecting**: Check API URL in plugin config
- **Database errors**: Verify MongoDB is running
- **Figma API errors**: Check your access token permissions

## 📦 What You Get

- ✅ React dashboard with Tailwind CSS
- ✅ Node.js + Express API with Prisma + MongoDB
- ✅ Working Figma plugin with analysis logic
- ✅ Design system compliance calculation
- ✅ Real-time analytics and metrics
- ✅ Complete TypeScript setup

## Next Steps

1. Configure your Figma access token
2. Add your design system file ID
3. Start analyzing your designs!

Happy analyzing! 🎨📊