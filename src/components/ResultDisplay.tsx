import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Code, 
  Terminal,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { CodeGenerationResult } from '../types';

interface ResultDisplayProps {
  result: CodeGenerationResult;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const downloadUrl = `${apiUrl}${result.downloadUrl}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = () => {
    if (result.compilation.statusCode === 0) {
      return <CheckCircle className="status-icon success" />;
    }
    return <XCircle className="status-icon error" />;
  };

  const getStatusText = () => {
    if (result.compilation.statusCode === 0) {
      return 'Compilation Successful';
    }
    return 'Compilation Failed';
  };

  return (
    <div className="result-display">
      <div className="result-header">
        <h3>Generated Code</h3>
        <div className="result-actions">
          <button
            onClick={() => setShowCode(!showCode)}
            className="action-button secondary"
            title={showCode ? 'Hide Code' : 'Show Code'}
          >
            {showCode ? <EyeOff className="button-icon" /> : <Eye className="button-icon" />}
            {showCode ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={handleCopy}
            className="action-button secondary"
            title="Copy to Clipboard"
          >
            {copied ? <CheckCircle className="button-icon" /> : <Copy className="button-icon" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="action-button primary"
            title="Download File"
          >
            <Download className="button-icon" />
            Download
          </button>
          <button
            onClick={onReset}
            className="action-button secondary"
            title="Generate New Code"
          >
            <RefreshCw className="button-icon" />
            New Query
          </button>
        </div>
      </div>

      {showCode && (
        <div className="code-section">
          <div className="code-header">
            <Code className="section-icon" />
            <span>Generated Code ({result.fileName})</span>
          </div>
          <pre className="code-block">
            <code>{result.code}</code>
          </pre>
        </div>
      )}

      <div className="compilation-section">
        <div className="compilation-header">
          <Terminal className="section-icon" />
          <span>Compilation Results</span>
          {getStatusIcon()}
          <span className={`status-text ${result.compilation.statusCode === 0 ? 'success' : 'error'}`}>
            {getStatusText()}
          </span>
        </div>

        {result.compilation.output && (
          <div className="output-block">
            <h4>Output:</h4>
            <pre className="output-content">{result.compilation.output}</pre>
          </div>
        )}

        {result.compilation.error && (
          <div className="error-block">
            <h4>Errors:</h4>
            <pre className="error-content">{result.compilation.error}</pre>
          </div>
        )}

        {(result.compilation.memory || result.compilation.cpuTime) && (
          <div className="stats-block">
            <div className="stats-grid">
              {result.compilation.memory && (
                <div className="stat-item">
                  <span className="stat-label">Memory:</span>
                  <span className="stat-value">{result.compilation.memory}</span>
                </div>
              )}
              {result.compilation.cpuTime && (
                <div className="stat-item">
                  <span className="stat-label">CPU Time:</span>
                  <span className="stat-value">{result.compilation.cpuTime}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};