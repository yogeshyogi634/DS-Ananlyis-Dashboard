import React, { useState, useEffect } from "react";
import type { MissingElementsSummary, MissingComponent, MissingColor, MissingTypography, AssignTokenRequest } from "../types/index";
import { analysisApi, tokenAssignmentApi } from "../services/api";
import AtlassianStyleTokenModal from "./AtlassianStyleTokenModal";
import {
  AlertTriangle,
  Component,
  Palette,
  Type,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";

interface MissingElementsProps {
  designSystemId: string;
}

const MissingElements: React.FC<MissingElementsProps> = ({
  designSystemId,
}) => {
  const [summary, setSummary] = useState<MissingElementsSummary | null>(null);
  const [detailedElements, setDetailedElements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    components: true,
    colors: true,
    typography: true,
    suggestions: true,
  });
  
  // Token assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{
    element: MissingComponent | MissingColor | MissingTypography;
    type: 'component' | 'color' | 'typography';
  } | null>(null);

  useEffect(() => {
    if (designSystemId) {
      fetchMissingElementsSummary();
    }
  }, [designSystemId]);

  const fetchMissingElementsSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both summary and detailed elements
      const [summaryData, detailedData] = await Promise.all([
        analysisApi.getMissingElementsSummary(designSystemId),
        analysisApi.getMissingElementsByDesignSystem(designSystemId)
      ]);
      
      setSummary(summaryData);
      setDetailedElements(detailedData);
    } catch (error) {
      console.error("Error fetching missing elements summary:", error);
      setError("Failed to fetch missing elements data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getFrameInfoForElement = (element: any, type: 'component' | 'color' | 'typography') => {
    if (!detailedElements?.missingElements) return null;
    
    // Find the frame where this element appears
    for (const missingElement of detailedElements.missingElements) {
      const elementsList = type === 'component' ? missingElement.missingComponents :
                          type === 'color' ? missingElement.missingColors :
                          missingElement.missingTypography;
      
      // Check if this element exists in this frame
      const foundElement = elementsList?.find((el: any) => {
        if (type === 'component') return el.name === element.name;
        if (type === 'color') return el.value === element.value;
        if (type === 'typography') return el.fontFamily === element.fontFamily && el.fontSize === element.fontSize;
        return false;
      });
      
      if (foundElement) {
        return {
          frameName: missingElement.analysis?.frameName,
          frameId: missingElement.analysis?.frameId,
          actualElement: foundElement
        };
      }
    }
    return null;
  };

  const handleAssignToken = (
    element: any, // Using any since summary data doesn't have full object structure
    type: 'component' | 'color' | 'typography'
  ) => {
    const frameInfo = getFrameInfoForElement(element, type);
    
    // Create a simplified element object for the modal with frame information
    const modalElement = {
      id: frameInfo?.actualElement?.id || `${type}-${element.name || element.value || element.fontFamily}-${Date.now()}`, // Use actual ID if available
      ...element,
      frameName: frameInfo?.frameName,
      frameId: frameInfo?.frameId
    };
    setSelectedElement({ element: modalElement, type });
    setIsAssignModalOpen(true);
  };

  const handleTokenAssignment = async (assignment: AssignTokenRequest) => {
    try {
      await tokenAssignmentApi.assignToken(assignment);
      // Refresh the missing elements data
      fetchMissingElementsSummary();
    } catch (error) {
      console.error("Error assigning token:", error);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMissingElementsSummary}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary || summary.totalAnalyses === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <Component className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Missing Elements Data
          </h3>
          <p className="text-gray-600">
            No analysis data available for this design system. Run some analyses
            from Figma to see missing elements.
          </p>
        </div>
      </div>
    );
  }

  const SectionHeader: React.FC<{
    title: string;
    icon: React.ReactNode;
    count: number;
    sectionKey: keyof typeof expandedSections;
  }> = ({ title, icon, count, sectionKey }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center space-x-3">
        {icon}
        <div className="text-left">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{count} items found</p>
        </div>
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-5 w-5 text-gray-500" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Missing Elements Overview
          </h3>
          <span className="text-sm text-gray-600">
            Based on {summary.totalAnalyses} analyses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Component className="mx-auto h-8 w-8 text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {summary.topMissingComponents.length}
            </div>
            <div className="text-sm text-red-700">Missing Components</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Palette className="mx-auto h-8 w-8 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {summary.topMissingColors.length}
            </div>
            <div className="text-sm text-orange-700">Missing Colors</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Type className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {summary.topMissingTypography.length}
            </div>
            <div className="text-sm text-purple-700">Missing Typography</div>
          </div>
        </div>
      </div>

      {/* Missing Components */}
      {summary.topMissingComponents.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <SectionHeader
              title="Missing Components"
              icon={<Component className="h-5 w-5 text-red-600" />}
              count={summary.topMissingComponents.length}
              sectionKey="components"
            />
          </div>

          {expandedSections.components && (
            <div className="p-4">
              <div className="space-y-3">
                {summary.topMissingComponents.map((component, index) => {
                  const frameInfo = getFrameInfoForElement(component, 'component');
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Component className="h-4 w-4 text-red-600" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {component.name}
                          </span>
                          {frameInfo?.frameName && (
                            <div className="text-xs text-gray-500 mt-1">
                              From: {frameInfo.frameName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-red-600">
                          {component.count} instances
                        </span>
                        <button
                          onClick={() => handleAssignToken(component as any, 'component')}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Migrate to design system token"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Migrate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missing Colors */}
      {summary.topMissingColors.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <SectionHeader
              title="Missing Colors"
              icon={<Palette className="h-5 w-5 text-orange-600" />}
              count={summary.topMissingColors.length}
              sectionKey="colors"
            />
          </div>

          {expandedSections.colors && (
            <div className="p-4">
              <div className="space-y-3">
                {summary.topMissingColors.map((color, index) => {
                  const frameInfo = getFrameInfoForElement(color, 'color');
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {color.name || "Unnamed Color"}
                          </span>
                          <div className="text-xs text-gray-500">
                            {color.value}
                          </div>
                          {frameInfo?.frameName && (
                            <div className="text-xs text-gray-500 mt-1">
                              From: {frameInfo.frameName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-orange-600">
                          {color.count} uses
                        </span>
                        <button
                          onClick={() => handleAssignToken(color as any, 'color')}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Migrate to design system token"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Migrate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missing Typography */}
      {summary.topMissingTypography.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <SectionHeader
              title="Missing Typography"
              icon={<Type className="h-5 w-5 text-purple-600" />}
              count={summary.topMissingTypography.length}
              sectionKey="typography"
            />
          </div>

          {expandedSections.typography && (
            <div className="p-4">
              <div className="space-y-3">
                {summary.topMissingTypography.map((typo, index) => {
                  const frameInfo = getFrameInfoForElement(typo, 'typography');
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Type className="h-4 w-4 text-purple-600" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {typo.fontFamily} {typo.fontWeight}
                          </span>
                          <div className="text-xs text-gray-500">
                            {typo.fontSize}
                          </div>
                          {frameInfo?.frameName && (
                            <div className="text-xs text-gray-500 mt-1">
                              From: {frameInfo.frameName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-purple-600">
                          {typo.count} uses
                        </span>
                        <button
                          onClick={() => handleAssignToken(typo as any, 'typography')}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Migrate to design system token"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Migrate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {summary.suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <SectionHeader
              title="Improvement Suggestions"
              icon={<Lightbulb className="h-5 w-5 text-yellow-600" />}
              count={summary.suggestions.length}
              sectionKey="suggestions"
            />
          </div>

          {expandedSections.suggestions && (
            <div className="p-4">
              <div className="space-y-3">
                {summary.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
                  >
                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Atlassian-Style Token Assignment Modal */}
      {selectedElement && (
        <AtlassianStyleTokenModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedElement(null);
          }}
          missingElement={selectedElement.element}
          elementType={selectedElement.type}
          onAssign={handleTokenAssignment}
        />
      )}
    </div>
  );
};

export default MissingElements;
