import React from "react";
import { 
  AlertTriangle, 
  Component, 
  Palette, 
  Type, 
  Settings,
  ChevronDown,
  ChevronUp 
} from "lucide-react";

// Demo component showing what missing elements would be detected from your UAT form
const UATFormAnalysisDemo: React.FC = () => {
  const [expandedSections, setExpandedSections] = React.useState({
    components: true,
    colors: true, 
    typography: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Missing components detected from your UAT Parameter VPA form
  const missingComponents = [
    {
      name: "Navigation Tabs Container",
      type: "navigation",
      count: 1,
      description: "Horizontal tab navigation with active state",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "IP Address Input Group", 
      type: "input-group",
      count: 5,
      description: "Combined dropdown + text input for IP addresses",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Transaction Config Section",
      type: "form-section",
      count: 1, 
      description: "Collapsible form section with description text",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Mode Toggle Card",
      type: "selection-card",
      count: 3,
      description: "Selectable cards showing stats (Online, Offline, Sample)",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Transaction List Component",
      type: "list-component", 
      count: 2,
      description: "Searchable list with select all and individual checkboxes",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Flag Option Group",
      type: "radio-group",
      count: 5,
      description: "Horizontal Yes/No radio button groups for flags",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Form Section Container",
      type: "container",
      count: 6,
      description: "Section containers with proper spacing and borders",
      frameName: "UAT Parameter VPA Form"
    }
  ];

  // Missing colors detected
  const missingColors = [
    {
      name: "Section Background Light",
      value: "#f7f8f9", 
      type: "background",
      count: 4,
      description: "Light background color for form sections",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Border Light Gray",
      value: "#d9dde0",
      type: "border", 
      count: 8,
      description: "Light gray border color for inputs and sections",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Card Background",
      value: "#f6f8fa",
      type: "surface",
      count: 3,
      description: "Background color for mode toggle cards",
      frameName: "UAT Parameter VPA Form"
    },
    {
      name: "Selection Hover",
      value: "#e8f0fe", 
      type: "interaction",
      count: 6,
      description: "Hover state color for interactive elements",
      frameName: "UAT Parameter VPA Form"
    }
  ];

  // Missing typography detected  
  const missingTypography = [
    {
      fontFamily: "Inter",
      fontSize: "13px",
      fontWeight: "600", 
      count: 4,
      name: "Section Header Semi-Bold",
      description: "Bold headers for form sections like 'Initiation mode'",
      frameName: "UAT Parameter VPA Form"
    },
    {
      fontFamily: "Inter",
      fontSize: "11px", 
      fontWeight: "400",
      count: 6,
      name: "Helper Text Small",
      description: "Small helper text and descriptions",
      frameName: "UAT Parameter VPA Form"
    },
    {
      fontFamily: "Inter",
      fontSize: "12px",
      fontWeight: "400",
      count: 8,
      name: "List Item Text",
      description: "Text for list items and option labels",
      frameName: "UAT Parameter VPA Form"
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              UAT Parameter VPA Form Analysis
            </h1>
            <p className="text-gray-600">
              Missing design system elements detected from Figma frame
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Component className="mx-auto h-8 w-8 text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-600">{missingComponents.length}</div>
            <div className="text-sm text-red-700">Missing Components</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Palette className="mx-auto h-8 w-8 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-600">{missingColors.length}</div>
            <div className="text-sm text-orange-700">Missing Colors</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Type className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-600">{missingTypography.length}</div>
            <div className="text-sm text-purple-700">Missing Typography</div>
          </div>
        </div>
      </div>

      {/* Missing Components */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button
            onClick={() => toggleSection('components')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Component className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Missing Components</h4>
                <p className="text-sm text-gray-600">{missingComponents.length} components not in design system</p>
              </div>
            </div>
            {expandedSections.components ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {expandedSections.components && (
          <div className="p-4">
            <div className="space-y-3">
              {missingComponents.map((component, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Component className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {component.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {component.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        From: {component.frameName} • Type: {component.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-red-600">
                      {component.count} instance{component.count !== 1 ? 's' : ''}
                    </span>
                    <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <Settings className="h-3 w-3" />
                      <span>Add to DS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Missing Colors */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button
            onClick={() => toggleSection('colors')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Palette className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Missing Colors</h4>
                <p className="text-sm text-gray-600">{missingColors.length} colors not in design system</p>
              </div>
            </div>
            {expandedSections.colors ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {expandedSections.colors && (
          <div className="p-4">
            <div className="space-y-3">
              {missingColors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {color.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {color.value} • {color.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        From: {color.frameName} • Type: {color.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-orange-600">
                      {color.count} use{color.count !== 1 ? 's' : ''}
                    </span>
                    <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <Settings className="h-3 w-3" />
                      <span>Add to DS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Missing Typography */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button
            onClick={() => toggleSection('typography')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Type className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Missing Typography</h4>
                <p className="text-sm text-gray-600">{missingTypography.length} text styles not in design system</p>
              </div>
            </div>
            {expandedSections.typography ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {expandedSections.typography && (
          <div className="p-4">
            <div className="space-y-3">
              {missingTypography.map((typo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Type className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {typo.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {typo.fontFamily} {typo.fontSize} {typo.fontWeight}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {typo.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        From: {typo.frameName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-purple-600">
                      {typo.count} use{typo.count !== 1 ? 's' : ''}
                    </span>
                    <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <Settings className="h-3 w-3" />
                      <span>Add to DS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UATFormAnalysisDemo;