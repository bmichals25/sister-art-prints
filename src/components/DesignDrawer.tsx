'use client';

import { useState } from 'react';
import { useDesign } from '@/context/DesignContext';

const FONT_OPTIONS = [
  { value: 'serif', label: 'Serif (Classic)' },
  { value: 'sans-serif', label: 'Sans-serif (Modern)' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
];

const COLOR_PRESETS = [
  {
    name: 'Warm Terracotta',
    primary: '#d4846a',
    secondary: '#e8a87c',
    accent: '#f5d4be',
    background: '#fff8f3',
  },
  {
    name: 'Ocean Blue',
    primary: '#4a90a4',
    secondary: '#6bb3c9',
    accent: '#b8dce8',
    background: '#f5fafc',
  },
  {
    name: 'Forest Green',
    primary: '#5a7d5a',
    secondary: '#7a9d7a',
    accent: '#c4d9c4',
    background: '#f5f9f5',
  },
  {
    name: 'Lavender Dream',
    primary: '#8b7bb5',
    secondary: '#a99bc9',
    accent: '#d9d1e8',
    background: '#faf8fc',
  },
  {
    name: 'Minimal Dark',
    primary: '#2d2d2d',
    secondary: '#4a4a4a',
    accent: '#e0e0e0',
    background: '#ffffff',
  },
];

interface DesignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesignDrawer({ isOpen, onClose }: DesignDrawerProps) {
  const {
    settings,
    isEditMode,
    setIsEditMode,
    updateColor,
    updateFont,
    saveSettings,
    resetToDefaults,
    isSaving,
    hasChanges,
  } = useDesign();

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'presets'>('colors');

  if (!isOpen) return null;

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateColor('primaryColor', preset.primary);
    updateColor('secondaryColor', preset.secondary);
    updateColor('accentColor', preset.accent);
    updateColor('backgroundColor', preset.background);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - only visible, not blocking interactions with page */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-auto ${
          isEditMode ? 'bg-black/10' : 'bg-transparent'
        }`}
        onClick={(e) => {
          // Only close if clicking the backdrop itself, not the drawer
          if (e.target === e.currentTarget && !isEditMode) {
            onClose();
          }
        }}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl pointer-events-auto transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-medium">Design Editor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Edit Mode Toggle */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-900">Edit Mode</span>
              <p className="text-xs text-gray-500">Double-click text to edit</p>
            </div>
            <div
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isEditMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isEditMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </div>
          </label>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['colors', 'typography', 'presets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium transition ${
                activeTab === tab
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {activeTab === 'colors' && (
            <>
              <ColorPicker
                label="Primary Color"
                value={settings.primaryColor}
                onChange={(v) => updateColor('primaryColor', v)}
              />
              <ColorPicker
                label="Secondary Color"
                value={settings.secondaryColor}
                onChange={(v) => updateColor('secondaryColor', v)}
              />
              <ColorPicker
                label="Accent Color"
                value={settings.accentColor}
                onChange={(v) => updateColor('accentColor', v)}
              />
              <ColorPicker
                label="Background Color"
                value={settings.backgroundColor}
                onChange={(v) => updateColor('backgroundColor', v)}
              />
              <ColorPicker
                label="Text Color"
                value={settings.textColor}
                onChange={(v) => updateColor('textColor', v)}
              />
            </>
          )}

          {activeTab === 'typography' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading Font
                </label>
                <select
                  value={settings.headingFont}
                  onChange={(e) => updateFont('headingFont', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{ fontFamily: settings.headingFont }}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <p
                  className="mt-2 text-lg"
                  style={{ fontFamily: settings.headingFont }}
                >
                  Preview Heading Text
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Font
                </label>
                <select
                  value={settings.bodyFont}
                  onChange={(e) => updateFont('bodyFont', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{ fontFamily: settings.bodyFont }}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <p
                  className="mt-2 text-sm"
                  style={{ fontFamily: settings.bodyFont }}
                >
                  Preview body text that shows how paragraphs will look.
                </p>
              </div>
            </>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Quick-apply a color theme to get started.
              </p>
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:border-gray-400 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{preset.name}</span>
                  </div>
                </button>
              ))}

              <button
                onClick={resetToDefaults}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Reset to Defaults
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className={`w-full py-3 rounded-lg font-medium transition ${
              hasChanges
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
        />
      </div>
    </div>
  );
}
