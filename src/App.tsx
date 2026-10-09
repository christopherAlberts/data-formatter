import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { Toast } from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { detectFormat } from './utils/formatDetection';
import { parseData } from './utils/parsers';
import { buildTree, resetIdCounter } from './utils/treeModel';
import type { DataFormat, TreeNode, ParseResult } from './types';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [input, setInput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<DataFormat | 'auto'>('auto');
  const [toast, setToast] = useState<string | null>(null);

  const detection = useMemo(() => detectFormat(input), [input]);

  const parseResult = useMemo<ParseResult | null>(() => {
    if (!input.trim()) return null;
    
    const format = selectedFormat === 'auto' ? detection.format : selectedFormat;
    return parseData(input, format);
  }, [input, selectedFormat, detection.format]);

  const tree = useMemo<TreeNode | null>(() => {
    if (!parseResult?.success || parseResult.data === undefined) return null;
    resetIdCounter();
    return buildTree(parseResult.data);
  }, [parseResult]);

  const showToast = (message: string) => {
    setToast(message);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />
      
      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-[var(--border-color)] flex flex-col min-w-0">
          <InputPanel
            value={input}
            onChange={setInput}
            detectedFormat={detection.format}
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
            warning={parseResult?.warning}
            error={parseResult?.error}
          />
        </div>
        
        <div className="w-1/2 flex flex-col min-w-0">
          <OutputPanel tree={tree} onShowToast={showToast} />
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
