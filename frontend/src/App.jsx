import React, { useState, useReducer, useEffect } from 'react';
import './App.css';
import * as Components from "./components";
import * as Babel from '@babel/standalone';

// History Reducer for robust state management
const historyReducer = (state, action) => {
  switch (action.type) {
    case 'PUSH':
      const newHistory = state.history.slice(0, state.index + 1);
      return {
        ...state,
        history: [...newHistory, action.payload],
        index: newHistory.length
      };
    case 'UNDO':
      return { ...state, index: Math.max(0, state.index - 1) };
    case 'REDO':
      return { ...state, index: Math.min(state.history.length - 1, state.index + 1) };
    case 'SET':
      return action.payload;
    default:
      return state;
  }
};

const initialState = {
  history: [{
    code: '// Generated code will appear here',
    previewCode: null,
    explanation: 'Wait for generation to see explanation...'
  }],
  index: 0
};

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [state, dispatch] = useReducer(historyReducer, initialState);

  const current = state.history[state.index];

  // Persistence: Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ui_generator_project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.history) {
          dispatch({ type: 'SET', payload: parsed });
        }
      } catch (e) {
        console.error("Failed to load project", e);
      }
    }
  }, []);

  // Persistence: Save to localStorage
  useEffect(() => {
    if (state.history.length > 1 || state.history[0].code !== initialState.history[0].code) {
      localStorage.setItem('ui_generator_project', JSON.stringify(state));
    }
  }, [state]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    const previousCode = (current.code && !current.code.includes('//')) ? current.code : null;

    try {
      const response = await fetch('https://ai-ui-generator-7x15.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, previousCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate UI');
      }

      dispatch({
        type: 'PUSH',
        payload: {
          code: data.code,
          previewCode: data.fullCode,
          explanation: data.explanation
        }
      });
      setPrompt(''); // Clear prompt on success

    } catch (err) {
      console.error('Generation Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    let sourceToRender = current.previewCode || current.code;

    // Dynamically inject current editor code into the shell logic if shell indicators are present
    if (current.previewCode && current.previewCode.includes('/* UI_CONTENT_START */')) {
      sourceToRender = current.previewCode.replace(
        /\/\* UI_CONTENT_START \*\/[\s\S]*?\/\* UI_CONTENT_END \*\//,
        `/* UI_CONTENT_START */\n${current.code}\n/* UI_CONTENT_END */`
      );
    }

    if (!sourceToRender || sourceToRender.includes('//')) return null;

    try {
      let cleanedCode = sourceToRender
        .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
        .replace(/export\s+default\s+/g, '');

      const transformedCode = Babel.transform(cleanedCode, {
        presets: ['react'],
        filename: 'generated.jsx'
      }).code;

      const Component = new Function(
        "React",
        ...Object.keys(Components),
        transformedCode + "; return GeneratedUI;"
      )(React, ...Object.values(Components));

      return <Component />;
    } catch (e) {
      return <div className="error-preview">Preview Error: {e.message}</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Left Panel: Chat & Explanation */}
      <div className="panel left-panel">
        <h2>Input Prompt</h2>
        <textarea
          className="chat-input"
          placeholder="Describe the UI you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Generating...' : 'Generate UI'}
        </button>

        {error && (
          <div className="error-toast">
            <strong>Generation Failed:</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="explanation-area">
          <h3>Explanation</h3>
          <p>{isLoading ? 'Analyzing components...' : current.explanation}</p>
        </div>
      </div>

      {/* Middle Panel: Code Editor */}
      <div className="panel middle-panel">
        <div className="panel-header">
          <h2>Generated Code</h2>
          <div className="history-controls">
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.index <= 0 || isLoading}
              title="Undo"
            >
              ↩ Undo
            </button>
            <button
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.index >= state.history.length - 1 || isLoading}
              title="Redo"
            >
              Redo ↪
            </button>
          </div>
        </div>
        <textarea
          className="code-editor"
          value={current.code}
          onChange={(e) => {
            // Manual edits update the current history state index locally
            // This ensures manual edits are reflected in the preview
            const newHistory = [...state.history];
            newHistory[state.index] = { ...current, code: e.target.value };
            dispatch({ type: 'SET', payload: { ...state, history: newHistory } });
          }}
          readOnly={isLoading}
        />
      </div>

      {/* Right Panel: Live Preview */}
      <div className="panel right-panel">
        <h2>Live Preview</h2>
        <div className="preview-container">
          {current.code !== initialState.history[0].code && renderPreview()}
          {current.code === initialState.history[0].code && (
            <div className="preview-placeholder">
              {isLoading ? 'Processing preview...' : 'Describe a UI to begin'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
