import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <div className="error-message">
      <div className="error-content">
        <AlertCircle className="error-icon" />
        <div className="error-text">
          <h4>Something went wrong</h4>
          <p>{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="error-dismiss"
          title="Dismiss"
        >
          <X className="dismiss-icon" />
        </button>
      </div>
    </div>
  );
};