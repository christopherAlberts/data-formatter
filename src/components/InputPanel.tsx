import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Trash2, ChevronDown } from 'lucide-react';
import type { DataFormat } from '../types';
import { formatDisplayName } from '../utils/formatDetection';
import { samples } from '../data/samples';

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  detectedFormat: DataFormat;
  selectedFormat: DataFormat | 'auto';
  onFormatChange: (format: DataFormat | 'auto') => void;
  warning?: string;
  error?: string;
}

const formats: Array<DataFormat | 'auto'> = ['auto', 'json', 'json5', 'python', 'xml', 'yaml', 'csv'];

export function InputPanel({
  value,
  onChange,
  detectedFormat,
  selectedFormat,
  onFormatChange,
  warning,
  error,
}: InputPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      readFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  }, []);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onChange(content);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = (key: string) => {
    const sample = samples[key as keyof typeof samples];
    if (sample) {
      onChange(sample.data);
      setShowSamples(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">Input</span>
          <div className="relative">
            <select
              value={selectedFormat}
              onChange={(e) => onFormatChange(e.target.value as DataFormat | 'auto')}
              className="text-xs bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded px-2 py-1 pr-6 text-[var(--text-secondary)] appearance-none cursor-pointer"
            >
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f === 'auto' ? 'Auto-detect' : formatDisplayName(f as DataFormat)}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
          {detectedFormat !== 'unknown' && (
            <span className="text-xs text-[var(--text-muted)]">
              Detected: {formatDisplayName(detectedFormat)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <FileText size={14} />
              Samples
              <ChevronDown size={12} />
            </button>
            {showSamples && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg min-w-[160px]">
                {Object.entries(samples).map(([key, sample]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadSample(key)}
                    className="block w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] first:rounded-t-lg last:rounded-b-lg"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors"
          >
            <Upload size={14} />
            Upload
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors"
            disabled={!value}
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.xml,.yaml,.yml,.csv,.tsv,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        className={`flex-1 relative drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your data here or drop a file...&#10;&#10;Supported formats: JSON, JSON5, Python dicts/lists, XML, YAML, CSV/TSV"
          className="w-full h-full p-3 bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-sm focus:outline-none scrollbar-thin"
          spellCheck={false}
        />
        
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]/90">
            <div className="text-center">
              <Upload size={48} className="mx-auto text-[var(--accent-color)] mb-2" />
              <p className="text-[var(--text-secondary)]">Drop your file here</p>
            </div>
          </div>
        )}
      </div>
      
      {(warning || error) && (
        <div className={`px-3 py-2 text-xs ${error ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
          {error || warning}
        </div>
      )}
    </div>
  );
}
