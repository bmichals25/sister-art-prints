'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useDesign } from '@/context/DesignContext';

interface EditableTextProps {
  textKey: string;
  fallback?: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function EditableText({
  textKey,
  fallback,
  as: Component = 'span',
  className = '',
  style,
  children,
}: EditableTextProps) {
  const { getText, updateText, isEditMode } = useDesign();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const text = getText(textKey, fallback);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      // Auto-resize textarea
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!isEditMode) return;
    setEditValue(text);
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editValue.trim() && editValue !== text) {
      updateText(textKey, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className={`${className} bg-white/90 border-2 border-blue-500 rounded px-2 py-1 outline-none resize-none overflow-hidden`}
        style={{ minHeight: '1.5em' }}
      />
    );
  }

  return (
    <Component
      className={`${className} ${isEditMode ? 'cursor-text hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-dashed hover:rounded transition-all' : ''}`}
      style={style}
      onDoubleClick={handleDoubleClick}
      title={isEditMode ? 'Double-click to edit' : undefined}
    >
      {children ?? text}
    </Component>
  );
}

// Wrapper for complex content that should show the editable text
export function EditableContent({
  textKey,
  fallback,
  className = '',
  render,
}: {
  textKey: string;
  fallback?: string;
  className?: string;
  render: (text: string, isEditing: boolean, onEdit: () => void) => React.ReactNode;
}) {
  const { getText, updateText, isEditMode } = useDesign();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const text = getText(textKey, fallback);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!isEditMode) return;
    setEditValue(text);
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editValue.trim() && editValue !== text) {
      updateText(textKey, editValue.trim());
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleBlur();
          if (e.key === 'Escape') setIsEditing(false);
        }}
        className={`${className} bg-white/90 border-2 border-blue-500 rounded px-2 py-1 outline-none`}
      />
    );
  }

  return <>{render(text, isEditing, handleEdit)}</>;
}
