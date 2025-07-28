import React from 'react';
import { Loader2, Brain, Code } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner-container">
        <div className="spinner-animation">
          <Loader2 className="spinner-icon" />
        </div>
        <div className="loading-steps">
          <div className="loading-step active">
            <Brain className="step-icon" />
            <span>Analyzing your request...</span>
          </div>
          <div className="loading-step">
            <Code className="step-icon" />
            <span>Generating code...</span>
          </div>
          <div className="loading-step">
            <Loader2 className="step-icon" />
            <span>Compiling...</span>
          </div>
        </div>
      </div>
      <p className="loading-message">
        Our AI is crafting your code. This may take a few moments...
      </p>
    </div>
  );
};