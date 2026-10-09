import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  TreesIcon,
  Table,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Minus,
  Copy,
  Download,
  FileJson,
  FileText,
  X,
} from 'lucide-react';
import type { TreeNode, ViewMode } from '../types';
import { TreeView } from './TreeView';
import { TableView } from './TableView';
import { useExpandedNodes } from '../hooks/useExpandedNodes';
import { searchTree, getMatchingNodeIds, getAllAncestorIds } from '../utils/search';
import { copyToClipboard, valueToJSON, valueToYAML, valueToCSV, downloadFile } from '../utils/copy';
import { isArrayOfObjects, getMaxDepth } from '../utils/treeModel';

interface OutputPanelProps {
  tree: TreeNode | null;
  onShowToast: (message: string) => void;
}

export function OutputPanel({ tree, onShowToast }: OutputPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const { toggle, expandAll, collapseAll, expandToDepth, isExpanded, expandNodes } = useExpandedNodes(tree);

  const matches = useMemo(() => {
    if (!tree || !searchQuery.trim()) return [];
    return searchTree(tree, searchQuery);
  }, [tree, searchQuery]);

  const matchingNodeIds = useMemo(() => getMatchingNodeIds(matches), [matches]);

  useEffect(() => {
    if (matches.length > 0 && tree) {
      const ancestorIds = getAllAncestorIds(tree, matches);
      expandNodes(Array.from(ancestorIds));
    }
  }, [matches, tree, expandNodes]);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchQuery]);

  const maxDepth = useMemo(() => (tree ? getMaxDepth(tree) : 0), [tree]);
  const canShowTable = useMemo(() => {
    if (!tree) return false;
    if (isArrayOfObjects(tree)) return true;
    // Check if root is an object with any top-level arrays of objects
    if (tree.type === 'object' && tree.children) {
      return tree.children.some(child => child.type === 'array' && isArrayOfObjects(child));
    }
    return false;
  }, [tree]);

  const handleCopyValue = useCallback(
    (value: unknown) => {
      const json = valueToJSON(value);
      copyToClipboard(json).then((success) => {
        onShowToast(success ? 'Value copied to clipboard' : 'Failed to copy');
      });
    },
    [onShowToast]
  );

  const handleCopyPath = useCallback(
    (path: string) => {
      copyToClipboard(path).then((success) => {
        onShowToast(success ? 'Path copied to clipboard' : 'Failed to copy');
      });
    },
    [onShowToast]
  );

  const handleCopyAll = useCallback(() => {
    if (!tree) return;
    const json = valueToJSON(tree.value);
    copyToClipboard(json).then((success) => {
      onShowToast(success ? 'JSON copied to clipboard' : 'Failed to copy');
    });
  }, [tree, onShowToast]);

  const handleDownloadJSON = useCallback(() => {
    if (!tree) return;
    const json = valueToJSON(tree.value);
    downloadFile(json, 'data.json', 'application/json');
    onShowToast('Downloaded as JSON');
  }, [tree, onShowToast]);

  const handleDownloadYAML = useCallback(() => {
    if (!tree) return;
    const yaml = valueToYAML(tree.value);
    downloadFile(yaml, 'data.yaml', 'text/yaml');
    onShowToast('Downloaded as YAML');
  }, [tree, onShowToast]);

  const handleDownloadCSV = useCallback(() => {
    if (!tree) return;
    const csv = valueToCSV(tree.value);
    if (csv === null) {
      onShowToast('Cannot export to CSV: data must be an array of objects');
      return;
    }
    downloadFile(csv, 'data.csv', 'text/csv');
    onShowToast('Downloaded as CSV');
  }, [tree, onShowToast]);

  const goToNextMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
  };

  const goToPrevMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  if (!tree) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
        <div className="text-center">
          <FileJson size={48} className="mx-auto mb-3 opacity-50" />
          <p>Paste or upload data to view</p>
        </div>
      </div>
    );
  }

  const topLevelScalars = tree.type === 'object' && tree.children
    ? tree.children.filter(c => c.type !== 'object' && c.type !== 'array')
    : [];
  
  const topLevelArrays = tree.type === 'object' && tree.children
    ? tree.children.filter(c => c.type === 'array')
    : [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              viewMode === 'tree'
                ? 'bg-[var(--accent-color)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <TreesIcon size={14} />
            Tree
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              viewMode === 'table'
                ? 'bg-[var(--accent-color)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            } ${!canShowTable ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canShowTable}
            title={canShowTable ? 'Table view' : 'Table view requires an array of objects'}
          >
            <Table size={14} />
            Table
          </button>
        </div>

        <div className="h-4 w-px bg-[var(--border-color)]" />

        {viewMode === 'tree' && (
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              title="Expand all"
            >
              <ChevronsUpDown size={14} />
              All
            </button>
            <button
              onClick={collapseAll}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              title="Collapse all"
            >
              <Minus size={14} />
              None
            </button>
            <select
              onChange={(e) => expandToDepth(Number(e.target.value))}
              className="text-xs bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded px-1.5 py-1 text-[var(--text-secondary)]"
              title="Expand to depth"
            >
              <option value="">Depth...</option>
              {Array.from({ length: Math.min(maxDepth + 1, 10) }, (_, i) => (
                <option key={i} value={i}>
                  Level {i}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded ${showSearch ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
            title="Search"
          >
            <Search size={14} />
          </button>
          
          <div className="h-4 w-px bg-[var(--border-color)]" />
          
          <button
            onClick={handleCopyAll}
            className="p-1.5 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            title="Copy as JSON"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleDownloadJSON}
            className="p-1.5 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            title="Download as JSON"
          >
            <FileJson size={14} />
          </button>
          <button
            onClick={handleDownloadYAML}
            className="p-1.5 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            title="Download as YAML"
          >
            <FileText size={14} />
          </button>
          <button
            onClick={handleDownloadCSV}
            className={`p-1.5 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] ${!canShowTable ? 'opacity-50' : ''}`}
            title="Download as CSV"
            disabled={!canShowTable}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys and values..."
              className="w-full pl-7 pr-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:border-[var(--accent-color)]"
              autoFocus
            />
          </div>
          {matches.length > 0 && (
            <>
              <span className="text-xs text-[var(--text-muted)]">
                {currentMatchIndex + 1} / {matches.length}
              </span>
              <button
                onClick={goToPrevMatch}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={goToNextMatch}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                <ChevronDown size={14} />
              </button>
            </>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {viewMode === 'tree' && topLevelScalars.length > 0 && (
        <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-mono">
            {topLevelScalars.map((scalar) => (
              <div key={scalar.id} className="flex items-center gap-1">
                <span className="font-medium text-[var(--text-secondary)]">{scalar.key}:</span>
                <span className={`tree-value-${scalar.type}`}>
                  {scalar.type === 'string' ? `"${scalar.value}"` : String(scalar.value)}
                  {scalar.isEmpty && <span className="empty-badge ml-1">empty</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto scrollbar-thin">
        {viewMode === 'tree' ? (
          <TreeView
            node={tree}
            isExpanded={isExpanded}
            onToggle={toggle}
            searchQuery={searchQuery}
            matchingNodeIds={matchingNodeIds}
            onCopyValue={handleCopyValue}
            onCopyPath={handleCopyPath}
          />
        ) : (
          topLevelArrays.length > 0 ? (
            <div>
              {topLevelArrays.map((arr) => (
                <div key={arr.id}>
                  {topLevelArrays.length > 1 && (
                    <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] font-medium text-sm">
                      {arr.key}
                    </div>
                  )}
                  <TableView node={arr} searchQuery={searchQuery} />
                </div>
              ))}
            </div>
          ) : (
            <TableView node={tree} searchQuery={searchQuery} />
          )
        )}
      </div>
    </div>
  );
}
