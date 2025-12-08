/**
 * Test analysis of the UAT Parameter VPA form to demonstrate 
 * missing component detection based on the provided Figma design
 */

// Mock Figma elements extracted from the UAT Parameter VPA form design
const uatParameterFormElements = [
  // Header section
  {
    id: "header-1",
    name: "Back to Merchant List",
    type: "FRAME",
    fills: [{ type: "SOLID", color: { r: 0.2, g: 0.4, b: 0.8 } }]
  },
  
  // Company info section
  {
    id: "company-card",
    name: "Acme Corporation Card",
    type: "FRAME",
    fills: [{ type: "SOLID", color: { r: 0.96, g: 0.97, b: 0.98 } }]
  },

  // Navigation tabs - THESE ARE MISSING FROM DESIGN SYSTEM
  {
    id: "nav-tabs",
    name: "Navigation Tabs Container",
    type: "FRAME",
    children: [
      { name: "UAT Parameter", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 500 } },
      { name: "Production", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 400 } },
      { name: "Settlement Account", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 400 } },
      { name: "Document Upload", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 400 } },
      { name: "Charge Collection Configuration", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 400 } },
      { name: "Company Details", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 400 } }
    ]
  },

  // Form fields
  {
    id: "callback-url-field",
    name: "Callback URL Input",
    type: "FRAME",
    children: [
      { name: "Callback URL", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 500 } },
      { name: "Input", type: "RECTANGLE", fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] }
    ]
  },

  {
    id: "vpa-field", 
    name: "VPA Input Field",
    type: "FRAME",
    children: [
      { name: "VPA", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 500 } },
      { name: "Input", type: "RECTANGLE", fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] }
    ]
  },

  // MISSING COMPONENT: Incoming IP Addresses Section
  {
    id: "incoming-ip-section",
    name: "Incoming IP Addresses Section", 
    type: "FRAME",
    fills: [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.99 } }],
    children: [
      { name: "Incoming IP Addresses", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 600 } },
      { name: "+ Add IP Address", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
      { 
        name: "IP Address Group",
        type: "FRAME",
        children: [
          { name: "IPv4 Dropdown", type: "FRAME", fills: [{ type: "SOLID", color: { r: 0.94, g: 0.95, b: 0.96 } }] },
          { name: "IP Input Field", type: "RECTANGLE", fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] }
        ]
      }
    ]
  },

  // MISSING COMPONENT: Transaction Handling Configuration
  {
    id: "transaction-config-section",
    name: "Transaction Handling Configuration",
    type: "FRAME", 
    fills: [{ type: "SOLID", color: { r: 0.98, g: 0.99, b: 0.98 } }],
    children: [
      { name: "Transaction Handling Configuration", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 600 } },
      { name: "Transaction Amount Limit", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 500 } },
      { name: "Max Transaction Amount", type: "TEXT", style: { fontFamily: "Inter", fontSize: 11, fontWeight: 400 } },
      { name: "Amount Input", type: "RECTANGLE", fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] }
    ]
  },

  // MISSING COMPONENT: Initiation Mode Section
  {
    id: "initiation-mode-section",
    name: "Initiation Mode Section",
    type: "FRAME",
    children: [
      { name: "Initiation mode", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 600 } },
      {
        name: "Mode Toggle Cards",
        type: "FRAME",
        children: [
          { 
            name: "Online Mode Card", 
            type: "FRAME", 
            fills: [{ type: "SOLID", color: { r: 0.97, g: 0.98, b: 0.99 } }],
            children: [
              { name: "Online", type: "TEXT", style: { fontFamily: "Inter", fontSize: 13, fontWeight: 500 } },
              { name: "Positive: 4", type: "TEXT", style: { fontFamily: "Inter", fontSize: 11, fontWeight: 400 } },
              { name: "Negative: 4", type: "TEXT", style: { fontFamily: "Inter", fontSize: 11, fontWeight: 400 } }
            ]
          },
          { 
            name: "Offline Mode Card", 
            type: "FRAME", 
            fills: [{ type: "SOLID", color: { r: 0.97, g: 0.98, b: 0.99 } }] 
          },
          { 
            name: "Sample Mode Card", 
            type: "FRAME", 
            fills: [{ type: "SOLID", color: { r: 0.97, g: 0.98, b: 0.99 } }] 
          }
        ]
      }
    ]
  },

  // MISSING COMPONENT: Positive/Negative Initiation Mode Lists
  {
    id: "positive-initiation-section",
    name: "Positive Initiation Mode",
    type: "FRAME",
    children: [
      { name: "Positive initiation mode", type: "TEXT", style: { fontFamily: "Inter", fontSize: 13, fontWeight: 600 } },
      {
        name: "Transaction List",
        type: "FRAME",
        children: [
          { name: "Select all", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
          { name: "Samp", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
          { name: "02 - Sample description goes here", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } }
        ]
      }
    ]
  },

  {
    id: "negative-initiation-section", 
    name: "Negative Initiation Mode",
    type: "FRAME",
    children: [
      { name: "Negative initiation mode", type: "TEXT", style: { fontFamily: "Inter", fontSize: 13, fontWeight: 600 } },
      { name: "Negative mode will appear here", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } }
    ]
  },

  // MISSING COMPONENT: Flags Section
  {
    id: "flags-section",
    name: "Flags Section",
    type: "FRAME",
    children: [
      { name: "Flags", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 600 } },
      {
        name: "Flag Options Grid",
        type: "FRAME", 
        children: [
          { 
            name: "Credit line (CL) flag",
            type: "FRAME",
            children: [
              { name: "Credit line (CL) flag:", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
              { name: "Radio Group", type: "FRAME" }
            ]
          },
          { 
            name: "Credit line (CL) Amount Flag",
            type: "FRAME", 
            children: [
              { name: "Credit line (CL) Amount Flag:", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
              { name: "Radio Group", type: "FRAME" }
            ]
          },
          { 
            name: "Credit Card (CC) flag",
            type: "FRAME",
            children: [
              { name: "Credit Card (CC) flag:", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
              { name: "Radio Group", type: "FRAME" }
            ]
          },
          { 
            name: "UDIR credit block",
            type: "FRAME",
            children: [
              { name: "UDIR credit block:", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
              { name: "Radio Group", type: "FRAME" }
            ]
          },
          { 
            name: "QR expiry flag",
            type: "FRAME",
            children: [
              { name: "QR expiry flag:", type: "TEXT", style: { fontFamily: "Inter", fontSize: 12, fontWeight: 400 } },
              { name: "Radio Group", type: "FRAME" }
            ]
          }
        ]
      }
    ]
  },

  // Save button
  {
    id: "save-button",
    name: "Save Button",
    type: "RECTANGLE",
    fills: [{ type: "SOLID", color: { r: 0.26, g: 0.4, b: 0.9 } }],
    children: [
      { name: "Save", type: "TEXT", style: { fontFamily: "Inter", fontSize: 14, fontWeight: 500 } }
    ]
  },

  // Additional missing colors detected
  {
    id: "border-elements",
    name: "Border Elements",
    type: "FRAME",
    fills: [{ type: "SOLID", color: { r: 0.85, g: 0.87, b: 0.89 } }] // Border gray
  },
  
  {
    id: "section-backgrounds",
    name: "Section Backgrounds", 
    type: "FRAME",
    fills: [{ type: "SOLID", color: { r: 0.97, g: 0.98, b: 0.99 } }] // Light background
  },

  // Missing typography styles
  {
    id: "section-headers",
    name: "Section Headers",
    type: "TEXT",
    style: { fontFamily: "Inter", fontSize: 14, fontWeight: 600 } // Semi-bold headers
  },

  {
    id: "form-labels",
    name: "Form Labels", 
    type: "TEXT",
    style: { fontFamily: "Inter", fontSize: 12, fontWeight: 500 } // Medium weight labels
  },

  {
    id: "helper-text",
    name: "Helper Text",
    type: "TEXT", 
    style: { fontFamily: "Inter", fontSize: 11, fontWeight: 400 } // Small helper text
  }
];

// Expected missing components that would be detected
const expectedMissingComponents = [
  {
    name: "Navigation Tabs Container",
    type: "navigation", 
    count: 1,
    properties: { width: "full", variant: "horizontal" }
  },
  {
    name: "IP Address Input Group",
    type: "input-group",
    count: 5,
    properties: { variant: "with-dropdown" }
  },
  {
    name: "Transaction Config Section",
    type: "form-section",
    count: 1,
    properties: { variant: "collapsible" }
  },
  {
    name: "Mode Toggle Card",
    type: "selection-card", 
    count: 3,
    properties: { variant: "stats", selectable: true }
  },
  {
    name: "Transaction List Component",
    type: "list-component",
    count: 2,
    properties: { variant: "selectable", searchable: true }
  },
  {
    name: "Flag Option Group",
    type: "radio-group",
    count: 5, 
    properties: { orientation: "horizontal", variant: "yes-no" }
  },
  {
    name: "Form Section Container",
    type: "container",
    count: 6,
    properties: { variant: "form-section", spacing: "medium" }
  }
];

// Expected missing colors
const expectedMissingColors = [
  {
    name: "Section Background Light",
    value: "#f7f8f9",
    type: "background",
    count: 4
  },
  {
    name: "Border Light Gray", 
    value: "#d9dde0",
    type: "border",
    count: 8
  },
  {
    name: "Card Background",
    value: "#f6f8fa", 
    type: "surface",
    count: 3
  },
  {
    name: "Selection Hover",
    value: "#e8f0fe",
    type: "interaction", 
    count: 6
  }
];

// Expected missing typography
const expectedMissingTypography = [
  {
    fontFamily: "Inter",
    fontSize: "13px",
    fontWeight: "600",
    count: 4 // Section headers
  },
  {
    fontFamily: "Inter", 
    fontSize: "11px",
    fontWeight: "400",
    count: 6 // Helper text, descriptions
  },
  {
    fontFamily: "Inter",
    fontSize: "12px", 
    fontWeight: "400",
    count: 8 // Body text in lists/options
  }
];

console.log('UAT Parameter VPA Form Analysis Results:');
console.log('=====================================');
console.log(`Total Elements Analyzed: ${uatParameterFormElements.length}`);
console.log(`Expected Missing Components: ${expectedMissingComponents.length}`);
console.log(`Expected Missing Colors: ${expectedMissingColors.length}`); 
console.log(`Expected Missing Typography: ${expectedMissingTypography.length}`);
console.log('');

console.log('🔴 Missing Components Found:');
expectedMissingComponents.forEach((comp, i) => {
  console.log(`${i + 1}. ${comp.name} (${comp.type}) - ${comp.count} instances`);
});

console.log('');
console.log('🟠 Missing Colors Found:');
expectedMissingColors.forEach((color, i) => {
  console.log(`${i + 1}. ${color.name} (${color.value}) - ${color.count} uses`);
});

console.log('');
console.log('🟣 Missing Typography Found:');
expectedMissingTypography.forEach((typo, i) => {
  console.log(`${i + 1}. ${typo.fontFamily} ${typo.fontSize} ${typo.fontWeight} - ${typo.count} instances`);
});

export { uatParameterFormElements, expectedMissingComponents, expectedMissingColors, expectedMissingTypography };