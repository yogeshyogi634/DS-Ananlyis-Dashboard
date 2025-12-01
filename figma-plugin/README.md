# Design System Analytics - Figma Plugin

This Figma plugin analyzes selected frames or components to determine design system compliance.

## Installation

1. Open Figma
2. Go to Menu > Plugins > Development > Import plugin from manifest
3. Select the `manifest.json` file from this directory
4. The plugin will be installed and available in your plugins list

## Usage

1. Select a frame or component in Figma
2. Run the "Design System Analytics" plugin
3. Configure the API URL (default: http://localhost:3001/api)
4. Select your design system from the dropdown
5. Click "Analyze Selected Frame" or "Analyze Selection"
6. Review the compliance results
7. Click "Send to Dashboard" to save the analysis

## Features

- **Frame Analysis**: Analyze entire frames for design system compliance
- **Selection Analysis**: Analyze specific selected elements
- **Real-time Results**: See compliance percentage and detailed breakdowns
- **Dashboard Integration**: Send results directly to your analytics dashboard

## Configuration

Before using the plugin, ensure:

1. Your backend API is running on the configured URL
2. You have at least one design system set up in the dashboard
3. The API URL in the plugin matches your backend configuration

## Understanding Results

- **Compliance Percentage**: Overall percentage of elements using design system components/tokens
- **Total Elements**: Count of all analyzed elements
- **Compliant Elements**: Count of elements using design system tokens
- **Components/Colors Used**: Breakdown of design system usage