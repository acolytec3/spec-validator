import { defaultKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, keymap, lineNumbers } from '@codemirror/view';
import { useEffect, useRef } from 'react';

interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  highlightedLines?: number[];
}

function prettifyJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}

// Create a custom theme that matches your app's design
const customTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  '.cm-editor': {
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    overflow: 'hidden',
  },
  '.cm-editor.cm-focused': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
  },
  '.cm-content': {
    padding: '16px',
    minHeight: '256px',
  },
  '.cm-line': {
    lineHeight: '1.25rem',
  },
  '.cm-gutters': {
    backgroundColor: '#f9fafb',
    borderRight: '1px solid #e5e7eb',
    color: '#6b7280',
  },
  '.cm-lineNumbers': {
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f3f4f6',
  },
  '.cm-activeLine': {
    backgroundColor: '#f3f4f6',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#dbeafe',
  },
  '.cm-highlighted-line': {
    backgroundColor: '#fef2f2',
    borderLeft: '3px solid #ef4444',
  },
  '.cm-highlighted-line .cm-line': {
    backgroundColor: '#fef2f2',
  },
});

// State effect for highlighting lines
const highlightLines = StateEffect.define<number[]>();

// State field to manage line decorations
const lineHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    
    for (const effect of tr.effects) {
      if (effect.is(highlightLines)) {
        const lines = effect.value;
        if (lines.length === 0) {
          decorations = Decoration.none;
        } else {
          const lineDecorations = lines.map(lineNumber => {
            const line = tr.state.doc.line(lineNumber);
            return Decoration.line({
              class: 'cm-highlighted-line',
            }).range(line.from);
          });
          decorations = Decoration.set(lineDecorations);
        }
      }
    }
    
    return decorations;
  },
  provide: f => EditorView.decorations.from(f),
});

export default function JsonEditor({ 
  label, 
  value, 
  onChange, 
  error, 
  className = '', 
  highlightedLines = [] 
}: JsonEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const handlePrettify = () => {
    const prettified = prettifyJSON(value);
    onChange(prettified);
  };

  const canPrettify = value.trim() && !error;

  useEffect(() => {
    if (!editorRef.current) return;

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        keymap.of(defaultKeymap),
        json(),
        customTheme,
        lineHighlightField,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '.cm-editor': {
            borderColor: error ? '#ef4444' : '#d1d5db',
            backgroundColor: error ? '#fef2f2' : 'white',
          },
        }),
      ],
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [error, onChange, value]); // Only run once on mount

  // Update editor content when value changes
  useEffect(() => {
    if (editorViewRef.current) {
      const currentValue = editorViewRef.current.state.doc.toString();
      if (currentValue !== value) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  // Update highlighted lines
  useEffect(() => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        effects: highlightLines.of(highlightedLines),
      });
    }
  }, [highlightedLines]);

  // Update error styling
  useEffect(() => {
    if (editorViewRef.current) {
      const theme = error 
        ? EditorView.theme({
            '.cm-editor': {
              borderColor: '#ef4444',
              backgroundColor: '#fef2f2',
            },
          })
        : EditorView.theme({
            '.cm-editor': {
              borderColor: '#d1d5db',
              backgroundColor: 'white',
            },
          });

      // Recreate the editor with new theme
      const currentValue = editorViewRef.current.state.doc.toString();
      const newState = EditorState.create({
        doc: currentValue,
        extensions: [
          lineNumbers(),
          keymap.of(defaultKeymap),
          json(),
          customTheme,
          lineHighlightField,
          theme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }
          }),
        ],
      });

      editorViewRef.current.setState(newState);
    }
  }, [error, onChange]);

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          onClick={handlePrettify}
          disabled={!canPrettify}
          className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-colors ${
            canPrettify
              ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200'
              : 'text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
          title="Format JSON"
        >
          <span>Prettify</span>
        </button>
      </div>
      <div className="relative">
        <div ref={editorRef} className="min-h-96" />
        {error && (
          <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
            Invalid JSON
          </div>
        )}
      </div>
    </div>
  );
}