import React, { useState, useEffect } from "react";
import type { 
  MissingComponent, 
  MissingColor, 
  MissingTypography, 
  Component, 
  Color, 
  Typography,
  TokenSuggestion,
  AssignTokenRequest 
} from "../types/index";
import { designSystemsApi } from "../services/api";
import { X, Search, CheckCircle, Palette, Component as ComponentIcon, Type } from "lucide-react";

interface TokenAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingElement: MissingComponent | MissingColor | MissingTypography;
  elementType: 'component' | 'color' | 'typography';
  designSystemId: string;
  onAssign: (assignment: AssignTokenRequest) => void;
}

const TokenAssignmentModal: React.FC<TokenAssignmentModalProps> = ({
  isOpen,
  onClose,
  missingElement,
  elementType,
  designSystemId,
  onAssign,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTokens, setAvailableTokens] = useState<(Component | Color | Typography)[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<(Component | Color | Typography)[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && designSystemId) {
      fetchAvailableTokens();
    }
  }, [isOpen, designSystemId, elementType]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTokens(availableTokens);
    } else {
      const filtered = availableTokens.filter(token => {
        const name = getTokenName(token);
        const value = getTokenValue(token);
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               value.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredTokens(filtered);
    }
  }, [searchQuery, availableTokens]);

  const fetchAvailableTokens = async () => {
    try {
      setLoading(true);
      const designSystem = await designSystemsApi.getById(designSystemId);
      
      let tokens: (Component | Color | Typography)[] = [];
      switch (elementType) {
        case 'component':
          tokens = designSystem.components;
          break;
        case 'color':
          tokens = designSystem.colors;
          break;
        case 'typography':
          tokens = designSystem.typography;
          break;
      }
      
      setAvailableTokens(tokens);
      setFilteredTokens(tokens);
    } catch (error) {
      console.error("Error fetching available tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTokenName = (token: Component | Color | Typography): string => {
    if ('name' in token) return token.name;
    if ('fontFamily' in token) return `${token.fontFamily} ${token.fontSize}`;
    return '';
  };

  const getTokenValue = (token: Component | Color | Typography): string => {
    if ('value' in token && token.value) return token.value;
    if ('fontSize' in token) return `${token.fontSize} / ${token.fontWeight}`;
    if ('type' in token) return token.type;
    return '';
  };

  const getElementDisplayName = (): string => {
    if (elementType === 'component' && 'name' in missingElement) {
      return missingElement.name;
    }
    if (elementType === 'color' && 'value' in missingElement) {
      return missingElement.name || missingElement.value;
    }
    if (elementType === 'typography' && 'fontFamily' in missingElement) {
      return `${missingElement.fontFamily} ${missingElement.fontSize}`;
    }
    return 'Unknown element';
  };

  const getElementValue = (): string => {
    if (elementType === 'color' && 'value' in missingElement) {
      return missingElement.value;
    }
    if (elementType === 'typography' && 'fontFamily' in missingElement) {
      return `${missingElement.fontWeight} / ${missingElement.lineHeight || 'auto'}`;
    }
    if (elementType === 'component' && 'type' in missingElement) {
      return missingElement.type || 'component';
    }
    return '';
  };

  const getElementIcon = () => {
    switch (elementType) {
      case 'component':
        return <ComponentIcon className="h-5 w-5 text-red-600" />;
      case 'color':
        return <Palette className="h-5 w-5 text-orange-600" />;
      case 'typography':
        return <Type className="h-5 w-5 text-purple-600" />;
    }
  };

  const handleAssign = () => {
    if (!selectedToken) return;
    
    const assignment: AssignTokenRequest = {
      missingElementType: elementType,
      missingElementId: missingElement.id,
      designSystemTokenId: selectedToken,
    };
    
    onAssign(assignment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getElementIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Assign Token
              </h2>
              <p className="text-sm text-gray-600">
                Assign a design system token to "{getElementDisplayName()}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Missing Element Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Missing Element</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {elementType === 'color' && 'value' in missingElement && (
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: missingElement.value }}
                />
              )}
              <div>
                <div className="font-medium text-gray-900">{getElementDisplayName()}</div>
                <div className="text-sm text-gray-600">{getElementValue()}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {'count' in missingElement && `${missingElement.count} uses`}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search for ${elementType} tokens...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Token List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading tokens...</div>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No matching tokens found</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTokens.map((token) => (
                <div
                  key={token.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedToken === token.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedToken(token.id)}
                >
                  <div className="flex items-center space-x-3">
                    {elementType === 'color' && 'value' in token && (
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: token.value }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{getTokenName(token)}</div>
                      <div className="text-sm text-gray-600">{getTokenValue(token)}</div>
                    </div>
                  </div>
                  {selectedToken === token.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedToken}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedToken
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Assign Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenAssignmentModal;