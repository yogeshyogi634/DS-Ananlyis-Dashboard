# Design System Analytics Dashboard - Figma Plugin

A comprehensive full-stack application that functions as a Figma plugin to provide designers with analytics about design system usage and component adoption.

## 🎯 Features

### Core Analytics
- **Design System Usage Analysis**: Calculates what percentage of components come from the established design system vs custom/one-off components
- **Component Usage Breakdown**: Detailed breakdown showing which specific design system components are being used
- **Visual Dashboard**: Interactive charts and metrics displaying usage statistics
- **Historical Tracking**: Store and compare analysis results over time

### Use Cases
- Analyze existing Figma designs built using your design system
- Track design system adoption when components are used from external sources
- Generate compliance reports for design reviews
- Monitor design system evolution and usage trends

## 🏗 Tech Stack

### Frontend (Figma Plugin UI)
- **React 18** with TypeScript
- **Tailwind CSS** for styling with Figma-native design tokens
- **Vite** for fast development and building
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend API
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **MongoDB** for data storage
- **Figma API** integration for design file analysis

### Infrastructure
- **Figma Plugin API** for Figma integration
- **RESTful API** for frontend-backend communication
- **Environment-based configuration**

## 📁 Project Structure

```
DS-Analysis-Dashboard/
├── src/                    # Figma plugin code
│   └── code.ts            # Main plugin logic
├── frontend/              # React UI for the plugin
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript definitions
│   │   └── App.tsx        # Main app component
│   └── package.json
├── backend/               # Express API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── types/         # TypeScript definitions
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── manifest.json          # Figma plugin manifest
├── ui.html               # Plugin UI template
└── package.json          # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- Figma Developer Account for API access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd DS-Analysis-Dashboard
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
DATABASE_URL="mongodb://localhost:27017/ds-analytics"
FIGMA_ACCESS_TOKEN="your_figma_access_token_here"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

4. **Database Setup**
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Development

1. **Start the development servers**
```bash
# From root directory - starts all services
npm run dev
```

This will start:
- Frontend dev server (Vite)
- Backend API server (Express)
- Plugin build watcher

2. **Load the plugin in Figma**
- Open Figma
- Go to Plugins → Development → Import plugin from manifest
- Select the `manifest.json` file from the project root
- Run the plugin from any Figma file

### Building for Production

```bash
# Build all components
npm run build

# Build individual components
npm run build:plugin    # Build Figma plugin code
npm run build:ui       # Build React frontend
npm run build:server   # Build Express backend
```

## 🔧 API Endpoints

### Analysis Routes (`/api/analysis`)
- `POST /analyze` - Analyze a Figma file for design system usage
- `GET /history` - Get analysis history with pagination
- `GET /:id` - Get specific analysis details
- `POST /report` - Generate usage report from analysis
- `DELETE /:id` - Delete analysis record

### Figma Routes (`/api/figma`)
- `GET /file/:fileId` - Get Figma file information
- `GET /file/:fileId/components` - Get file components
- `GET /files` - Get stored Figma files
- `GET /test-connection` - Test Figma API connection

### Patterns Routes (`/api/patterns`)
- `GET /` - Get design system patterns
- `POST /` - Create new pattern
- `GET /:id` - Get specific pattern
- `PUT /:id` - Update pattern
- `DELETE /:id` - Delete pattern
- `POST /test` - Test pattern against component names

## 💡 How It Works

1. **Analysis Process**
   - Plugin scans current Figma file for component instances
   - Identifies design system components using configurable patterns
   - Calculates usage percentages and generates breakdown
   - Stores results in MongoDB for historical tracking

2. **Design System Detection**
   - Component naming conventions (DS/, Design System, etc.)
   - Published/shared component status
   - Component library structure analysis
   - Customizable pattern matching

3. **Reporting**
   - Visual charts showing usage distribution
   - Component-level breakdown
   - Compliance scoring and recommendations
   - Export capabilities for sharing

## 🎨 Figma Integration

The plugin integrates seamlessly with Figma's plugin API:
- Analyzes current page or selection
- Reads component hierarchy and metadata
- Accesses published component information
- Provides native Figma UI experience

## 🔒 Security

- Environment-based configuration
- Input validation with Zod schemas
- CORS protection
- Helmet.js security headers
- MongoDB connection security

## 📈 Future Enhancements

- Team collaboration features
- Advanced analytics and trends
- Custom design system definitions
- Automated reporting schedules
- Integration with design tokens
- Component usage recommendations
- Design system health scoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the GitHub Issues
2. Review the Figma Plugin Documentation
3. Contact the development team

---

Built with ❤️ for the design community