import React, { useState } from 'react';
import { Send, Code2 } from 'lucide-react';

interface QueryFormProps {
  onSubmit: (query: string, language: string) => void;
  disabled: boolean;
}

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'csharp', label: 'C#', icon: '🔷' }
];

export const QueryForm: React.FC<QueryFormProps> = ({ onSubmit, disabled }) => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('python');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim(), language);
    }
  };

  const isValid = query.trim().length >= 10;

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="language" className="form-label">
          <Code2 className="label-icon" />
          Programming Language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
          disabled={disabled}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.icon} {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="query" className="form-label">
          Describe what you want to build
        </label>
        <textarea
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Example: Create a calculator that can perform basic arithmetic operations with a user-friendly interface. Include error handling for division by zero and invalid inputs."
          className="query-textarea"
          rows={6}
          maxLength={5000}
          disabled={disabled}
          required
        />
        <div className="character-count">
          {query.length}/5000 characters
          {query.length < 10 && query.length > 0 && (
            <span className="validation-hint">Minimum 10 characters required</span>
          )}
        </div>
      </div>

      <button
        type="submit"
        className={`submit-button ${!isValid || disabled ? 'disabled' : ''}`}
        disabled={!isValid || disabled}
      >
        <Send className="button-icon" />
        {disabled ? 'Generating Code...' : 'Generate Code'}
      </button>
    </form>
  );
};