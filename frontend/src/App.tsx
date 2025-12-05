import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DesignSystems from "./components/DesignSystems";
import Analytics from "./components/Analytics";
import MissingElementsPage from "./components/MissingElementsPage";
import { BarChart3, Settings, Home, Palette, AlertTriangle } from "lucide-react";

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/design-systems", label: "Design Systems", icon: Palette },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/missing-elements", label: "Missing Elements", icon: AlertTriangle },
  ];

  return (
    <nav className="bg-white shadow-sm h-full">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800">DS Analytics</h1>
      </div>
      <ul className="space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 flex-shrink-0">
          <Navigation />
        </div>
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/design-systems" element={<DesignSystems />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/missing-elements" element={<MissingElementsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
