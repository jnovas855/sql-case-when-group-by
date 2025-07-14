import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab, toggleLineComment } from '@codemirror/commands';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';

const basicExtensions = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  drawSelection(),
  dropCursor()
];

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export interface CodeMirrorEditorRef {
  focus: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

export const CodeMirrorEditor = forwardRef<CodeMirrorEditorRef, CodeMirrorEditorProps>(({
  value,
  onChange,
  onKeyDown,
  placeholder = "Nhập câu lệnh SQL của bạn ở đây...",
  className = ""
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (viewRef.current) {
        viewRef.current.focus();
      }
    },
    getValue: () => {
      return viewRef.current?.state.doc.toString() || '';
    },
    setValue: (newValue: string) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: newValue
          }
        });
      }
    }
  }));

  useEffect(() => {
    if (!editorRef.current) return;

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicExtensions,
        sql(),
        oneDark,
        keymap.of([
          ...defaultKeymap,
          indentWithTab,
          {
            key: 'Mod-/', // Ctrl+/ (Win/Linux), Cmd+/ (Mac)
            run: toggleLineComment,
          },
        ]),
        EditorView.theme({
          '&': {
            height: '200px',
            fontSize: '14px',
          },
          '.cm-focused': {
            outline: '2px solid hsl(var(--ring))',
            outlineOffset: '2px',
          },
          '.cm-editor': {
            borderRadius: '6px',
          },
          '.cm-scroller': {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        EditorView.domEventHandlers({
          keydown: (event, view) => {
            if (onKeyDown) {
              onKeyDown(event);
            }
            return false;
          }
        }),
        EditorState.tabSize.of(2)
      ]
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    // Cleanup
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
    }
  }, [value]);

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <div ref={editorRef} />
    </div>
  );
});