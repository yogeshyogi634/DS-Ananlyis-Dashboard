// Base interfaces
export interface Component {
  id: string;
  name: string;
  figmaId: string;
  type: string;
  properties?: Record<string, any>;
  designSystemId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Color {
  id: string;
  name: string;
  value: string;
  type: string;
  designSystemId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Typography {
  id: string;
  name: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  lineHeight?: string;
  designSystemId: string;
  createdAt: string;
  updatedAt: string;
}

// Usage interfaces
export interface ComponentUsage {
  id: string;
  componentId: string;
  component: Component;
  analysisId: string;
  count: number;
  isCompliant: boolean;
  createdAt: string;
}

export interface ColorUsage {
  id: string;
  colorId: string;
  color: Color;
  analysisId: string;
  count: number;
  isCompliant: boolean;
  createdAt: string;
}

export interface TypographyUsage {
  id: string;
  typographyId: string;
  typography: Typography;
  analysisId: string;
  count: number;
  isCompliant: boolean;
  createdAt: string;
}

// Missing elements interfaces
export interface MissingComponent {
  id: string;
  name: string;
  type?: string;
  count: number;
  properties?: Record<string, any>;
  missingElementsId: string;
  createdAt: string;
}

export interface MissingColor {
  id: string;
  name?: string;
  value: string;
  type?: string;
  count: number;
  missingElementsId: string;
  createdAt: string;
}

export interface MissingTypography {
  id: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight?: string;
  count: number;
  missingElementsId: string;
  createdAt: string;
}

export interface MissingElements {
  id: string;
  analysisId: string;
  missingComponents: MissingComponent[];
  missingColors: MissingColor[];
  missingTypography: MissingTypography[];
  nonCompliantElements: Array<{
    type: string;
    reason: string;
    element: string;
  }>;
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
}

// Analysis interface
export interface Analysis {
  id: string;
  frameId: string;
  frameName: string;
  totalElements: number;
  dsCompliantElements: number;
  compliancePercentage: number;
  componentUsages: ComponentUsage[];
  colorUsages: ColorUsage[];
  typographyUsages: TypographyUsage[];
  missingElements?: MissingElements;
  designSystemId: string;
  createdAt: string;
  updatedAt: string;
}

// Design System interface
export interface DesignSystem {
  id: string;
  name: string;
  figmaFileId: string;
  components: Component[];
  colors: Color[];
  typography: Typography[];
  analyses?: Analysis[]; // Made optional to avoid circular reference
  createdAt: string;
  updatedAt: string;
  _count: {
    components: number;
    colors: number;
    typography: number;
    analyses: number;
  };
}

export interface AnalysisMetrics {
  totalAnalyses: number;
  avgCompliance: number;
  complianceOverTime: Array<{
    date: string;
    compliance: number;
    frameName: string;
    analysisId: string;
    missingElementsCounts: {
      components: number;
      colors: number;
      typography: number;
    };
    missingElements: {
      components: MissingComponent[];
      colors: MissingColor[];
      typography: MissingTypography[];
    };
  }>;
  componentStats: Record<string, {
    totalUsage: number;
    compliantUsage: number;
  }>;
  colorStats: Record<string, {
    totalUsage: number;
    compliantUsage: number;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface MissingElementsSummary {
  totalAnalyses: number;
  topMissingComponents: Array<{
    name: string;
    count: number;
  }>;
  topMissingColors: Array<{
    name?: string;
    value: string;
    count: number;
  }>;
  topMissingTypography: Array<{
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    count: number;
  }>;
  suggestions: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

// Token assignment interfaces
export interface TokenAssignment {
  id: string;
  missingElementType: 'component' | 'color' | 'typography';
  missingElementId: string;
  designSystemTokenId: string;
  assignedBy: string;
  createdAt: string;
}

export interface AssignTokenRequest {
  missingElementType: 'component' | 'color' | 'typography';
  missingElementId: string;
  designSystemTokenId: string;
}

export interface TokenSuggestion {
  id: string;
  name: string;
  value: string;
  type: string;
  similarity: number;
}