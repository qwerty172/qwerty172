import React from 'react';
import { Code, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Code className="logo-icon" />
            <h1>NL to Code</h1>
          </div>
          <div className="header-badge">
            <Zap className="badge-icon" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>
    </header>
  );
};