import React, { useState } from 'react';
import { Header } from './components/Header';
import { QueryForm } from './components/QueryForm';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateCode } from './services/api';
import { CodeGenerationResult } from './types';
import './App.css';

function App() {
  const [result, setResult] = useState<CodeGenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (query: string, language: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateCode(query, language);
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="container">
          {!result && !loading && (
            <div className="intro-section">
              <h2>Transform Natural Language into Executable Code</h2>
              <p>
                Describe what you want to build in plain English, and our AI will generate 
                complete, compilable code in your preferred programming language.
              </p>
            </div>
          )}

          <QueryForm onSubmit={handleSubmit} disabled={loading} />

          {loading && <LoadingSpinner />}
          
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          
          {result && <ResultDisplay result={result} onReset={handleReset} />}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 NL to Code Converter. Powered by Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;