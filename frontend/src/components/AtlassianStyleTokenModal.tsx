import React, { useState, useEffect } from "react";
import type { AssignTokenRequest } from "../types/index";
import { X, Search, CheckCircle, Palette, Component as ComponentIcon, Type } from "lucide-react";

interface TokenOption {
  id: string;
  name: string;
  value: string;
  type: string;
  category?: string;
  similarity?: number;
  reason?: string;
}

interface AtlassianStyleTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingElement: {
    id?: string;
    name?: string;
    value?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    count: number;
    frameName?: string;
    frameId?: string;
  };
  elementType: 'component' | 'color' | 'typography';
  onAssign: (assignment: AssignTokenRequest) => void;
}

const AtlassianStyleTokenModal: React.FC<AtlassianStyleTokenModalProps> = ({
  isOpen,
  onClose,
  missingElement,
  elementType,
  onAssign,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [availableTokens, setAvailableTokens] = useState<TokenOption[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch intelligent token suggestions from the API
      fetchIntelligentSuggestions();
    }
  }, [isOpen, elementType]);

  useEffect(() => {
    filterTokens();
  }, [searchQuery, selectedCategory, availableTokens]);

  const fetchIntelligentSuggestions = async () => {
    if (!missingElement.id) {
      // Fallback to mock data if no ID
      generateMockTokens();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/token-assignments/suggestions/${missingElement.id}?type=${elementType}&designSystemId=elara-ds-1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const suggestions = await response.json();
      
      // Map API response to our TokenOption format and add categories
      const tokens: TokenOption[] = suggestions.map((suggestion: any) => ({
        ...suggestion,
        category: getCategoryFromType(suggestion.type, elementType)
      }));
      
      setAvailableTokens(tokens);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to mock data on error
      generateMockTokens();
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromType = (type: string, elementType: string): string => {
    switch (elementType) {
      case 'color':
        if (type === 'primary' || type === 'secondary') return 'Brand';
        if (type === 'neutral') return 'Neutral';
        if (type === 'form') return 'Form';
        if (type === 'status') return 'Status';
        if (type === 'interaction') return 'Interactive';
        return 'Other';
      case 'typography':
        if (type.includes('heading') || type === 'heading') return 'Heading';
        if (type.includes('body') || type === 'body') return 'Body';
        if (type === 'label') return 'Label';
        if (type === 'caption') return 'Caption';
        return 'Other';
      case 'component':
        if (type === 'button' || type === 'input' || type === 'select') return 'Interactive';
        if (type === 'container' || type === 'layout') return 'Layout';
        if (type === 'navigation') return 'Navigation';
        if (type === 'feedback') return 'Feedback';
        if (type === 'data') return 'Data Display';
        return 'Other';
      default:
        return 'Other';
    }
  };

  const generateMockTokens = () => {
    let tokens: TokenOption[] = [];
    
    switch (elementType) {
      case 'color':
        tokens = [
          { id: 'color-1', name: 'Primary Blue', value: '#0066cc', type: 'primary', category: 'Brand', similarity: 0.9, reason: 'Excellent match' },
          { id: 'color-2', name: 'Input Background', value: '#ffffff', type: 'form', category: 'Form', similarity: 0.8, reason: 'Very good match' },
          { id: 'color-3', name: 'Text Primary', value: '#24292e', type: 'neutral', category: 'Neutral', similarity: 0.7, reason: 'Good match' },
          { id: 'color-4', name: 'Border Light', value: '#d1d9e0', type: 'neutral', category: 'Neutral', similarity: 0.6, reason: 'Partial match' },
        ];
        break;
      case 'typography':
        tokens = [
          { id: 'typo-1', name: 'Body Medium', value: '14px 400', type: 'body', category: 'Body', similarity: 0.9, reason: 'Excellent match' },
          { id: 'typo-2', name: 'Label Text', value: '12px 500', type: 'label', category: 'Label', similarity: 0.8, reason: 'Very good match' },
          { id: 'typo-3', name: 'Input Text', value: '14px 400', type: 'body', category: 'Body', similarity: 0.7, reason: 'Good match' },
        ];
        break;
      case 'component':
        tokens = [
          { id: 'comp-1', name: 'Button', value: 'button', type: 'button', category: 'Interactive', similarity: 0.9, reason: 'Excellent match' },
          { id: 'comp-2', name: 'Input Field', value: 'input', type: 'input', category: 'Interactive', similarity: 0.8, reason: 'Very good match' },
          { id: 'comp-3', name: 'Card', value: 'card', type: 'container', category: 'Layout', similarity: 0.6, reason: 'Partial match' },
        ];
        break;
    }
    
    setAvailableTokens(tokens);
  };

  const filterTokens = () => {
    let filtered = availableTokens;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(token => token.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by similarity score (highest first)
    filtered = filtered.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    
    setFilteredTokens(filtered);
  };

  const getCategories = () => {
    const categories = ["All", ...new Set(availableTokens.map(token => token.category || "Other"))];
    return categories;
  };

  const getElementDisplayName = (): string => {
    if (elementType === 'component' && missingElement.name) {
      return missingElement.name;
    }
    if (elementType === 'color') {
      return missingElement.name || missingElement.value || 'Unnamed Color';
    }
    if (elementType === 'typography' && missingElement.fontFamily) {
      return `${missingElement.fontFamily} ${missingElement.fontSize}`;
    }
    return 'Unknown element';
  };

  const getElementIcon = () => {
    switch (elementType) {
      case 'component':
        return <ComponentIcon className="h-5 w-5 text-blue-600" />;
      case 'color':
        return <Palette className="h-5 w-5 text-orange-600" />;
      case 'typography':
        return <Type className="h-5 w-5 text-purple-600" />;
    }
  };

  const handleAssign = () => {
    if (!selectedToken || !missingElement.id) return;
    
    const assignment: AssignTokenRequest = {
      missingElementType: elementType,
      missingElementId: missingElement.id,
      designSystemTokenId: selectedToken,
    };
    
    onAssign(assignment);
    onClose();
  };

  const getMigrationStats = () => {
    // Mock migration stats similar to Atlassian
    return {
      migrated: 90.21,
      hexValues: 0.85,
      oldLibraries: 0.43
    };
  };

  const stats = getMigrationStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">DS</span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Design Tokens Migration
              </h2>
              {missingElement.frameName && (
                <p className="text-sm text-gray-600">
                  From: {missingElement.frameName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Left Panel - Token Browser */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for tokens, base tokens, or hex values"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-xs text-gray-500 mb-4">
                e.g. color.text, B300 (old), Blue700 (new), or #000000
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {getCategories().map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex space-x-4">
                <button className="text-sm text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                  Light theme
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Dark theme
                </button>
              </div>
              
              <div className="mt-3 flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  Recommended tokens for {missingElement.frameName || 'selected FRAME layer'}
                </span>
              </div>
            </div>

            {/* Token List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Finding matching tokens...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTokens.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No matching tokens found
                    </div>
                  ) : (
                    filteredTokens.map((token) => (
                      <div
                        key={token.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedToken === token.id
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedToken(token.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center bg-gray-50">
                              {elementType === 'color' ? (
                                <div 
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: token.value }}
                                />
                              ) : (
                                <span className="text-xs font-mono text-gray-600">
                                  {token.type.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                  {token.name}
                                </div>
                                {token.similarity && (
                                  <div className="flex items-center space-x-1 ml-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-blue-600 font-medium">
                                      {Math.round(token.similarity * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {token.value}
                              </div>
                              {token.reason && (
                                <div className="text-xs text-green-600 mt-1">
                                  {token.reason}
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedToken === token.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600 ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Selection Info */}
          <div className="w-1/2 flex flex-col">
            {/* Migration Stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900 mb-3">
                Selection: <span className="text-teal-600">{stats.migrated}% migrated</span>{' '}
                <span className="text-purple-600">{stats.hexValues}% hex values</span>{' '}
                <span className="text-red-600">{stats.oldLibraries}% old libraries</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full" 
                  style={{ width: `${stats.migrated}%` }}
                ></div>
              </div>
            </div>

            {/* Selected Element Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                {getElementIcon()}
                <span className="font-medium text-gray-900">
                  {elementType.toUpperCase()}
                </span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                {/* Frame Source Information */}
                {missingElement.frameName && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Source Frame:</div>
                    <div className="font-medium text-gray-700 text-sm">
                      {missingElement.frameName}
                    </div>
                    {missingElement.frameId && (
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {missingElement.frameId}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-3 mb-2">
                  {elementType === 'color' && missingElement.value && (
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: missingElement.value }}
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {getElementDisplayName()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {missingElement.count} uses • Missing from design system
                    </div>
                  </div>
                </div>
                
                {selectedToken && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Will be assigned to:</div>
                    <div className="font-medium text-blue-600">
                      {filteredTokens.find(t => t.id === selectedToken)?.name}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-gray-50 mt-auto">
              <button
                onClick={handleAssign}
                disabled={!selectedToken}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  selectedToken
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedToken ? 'Migrate 1 items' : 'Select a token to migrate'}
              </button>
              
              <div className="flex justify-between mt-4 text-sm">
                <div className="flex space-x-4">
                  <button className="text-gray-600 hover:text-gray-900">Tokens</button>
                  <button className="text-blue-600 font-medium">Migrate</button>
                  <button className="text-gray-600 hover:text-gray-900">Themes</button>
                  <button className="text-gray-600 hover:text-gray-900">Feedback</button>
                </div>
                <button className="text-gray-600 hover:text-gray-900">Minimize</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlassianStyleTokenModal;