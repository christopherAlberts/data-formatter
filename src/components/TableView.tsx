import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, LayoutGrid, Table } from 'lucide-react';
import type { TreeNode } from '../types';
import { getUnionKeys, isArrayOfObjects } from '../utils/treeModel';

interface TableViewProps {
  node: TreeNode;
  searchQuery: string;
}

type TableDisplayMode = 'table' | 'cards';

export function TableView({ node, searchQuery }: TableViewProps) {
  const [displayMode, setDisplayMode] = useState<TableDisplayMode>('table');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const canShowAsTable = isArrayOfObjects(node);
  const columns = useMemo(() => canShowAsTable ? getUnionKeys(node) : [], [node, canShowAsTable]);

  const toggleRow = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const highlightMatch = (text: string): React.ReactNode => {
    if (!searchQuery.trim()) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <mark className="search-highlight">{text.slice(index, index + searchQuery.length)}</mark>
        {text.slice(index + searchQuery.length)}
      </>
    );
  };

  const renderCellValue = (value: unknown): React.ReactNode => {
    if (value === null) {
      return <span className="text-[var(--text-muted)] italic">null</span>;
    }
    if (value === undefined) {
      return <span className="text-[var(--text-muted)] italic">-</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="tree-value-boolean">{String(value)}</span>;
    }
    if (typeof value === 'number') {
      return <span className="tree-value-number">{value}</span>;
    }
    if (typeof value === 'string') {
      if (value === '') {
        return <span className="empty-badge">"" empty</span>;
      }
      const displayValue = value.length > 50 ? value.slice(0, 50) + '...' : value;
      return <span className="tree-value-string">{highlightMatch(displayValue)}</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="empty-badge">[] empty</span>;
      }
      return <span className="text-[var(--text-muted)]">[{value.length} items]</span>;
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value as object);
      if (keys.length === 0) {
        return <span className="empty-badge">{'{}'} empty</span>;
      }
      return <span className="text-[var(--text-muted)]">{'{' + keys.length + ' keys}'}</span>;
    }
    return String(value);
  };

  const renderNestedObject = (value: unknown, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return renderCellValue(value);
    }
    
    if (typeof value !== 'object') {
      return renderCellValue(value);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="empty-badge">[] empty</span>;
      }
      return (
        <div className="ml-4">
          {value.map((item, i) => (
            <div key={i} className="py-1 border-b border-[var(--border-color)] last:border-0">
              <span className="text-[var(--text-muted)]">[{i}]: </span>
              {renderNestedObject(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    const entries = Object.entries(value as object);
    if (entries.length === 0) {
      return <span className="empty-badge">{'{}'} empty</span>;
    }

    return (
      <div className="ml-4">
        {entries.map(([k, v]) => (
          <div key={k} className="py-1 border-b border-[var(--border-color)] last:border-0">
            <span className="font-medium text-[var(--type-key)]">{k}: </span>
            {typeof v === 'object' && v !== null ? (
              renderNestedObject(v, depth + 1)
            ) : (
              renderCellValue(v)
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!canShowAsTable) {
    return (
      <div className="p-4 text-center text-[var(--text-muted)]">
        <p>Table view is available for arrays of objects.</p>
        <p className="text-sm mt-1">Switch to Tree view to see this data.</p>
      </div>
    );
  }

  const rows = node.children || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <span className="text-sm text-[var(--text-secondary)]">
          {rows.length} row{rows.length !== 1 ? 's' : ''} × {columns.length} column{columns.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDisplayMode('table')}
            className={`p-1.5 rounded ${displayMode === 'table' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'}`}
            title="Table view"
          >
            <Table size={16} />
          </button>
          <button
            onClick={() => setDisplayMode('cards')}
            className={`p-1.5 rounded ${displayMode === 'cards' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'}`}
            title="Card view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        {displayMode === 'table' ? (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-[var(--bg-secondary)]">
              <tr>
                <th className="w-8 p-2 border-b border-[var(--border-color)]" />
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-2 text-left font-medium text-[var(--text-primary)] border-b border-[var(--border-color)] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rowData = row.value as Record<string, unknown>;
                const isExpanded = expandedRows.has(index);
                const hasNested = Object.values(rowData).some(
                  v => typeof v === 'object' && v !== null && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)
                );

                return (
                  <>
                    <tr key={row.id} className="hover:bg-[var(--bg-tertiary)]">
                      <td className="p-2 border-b border-[var(--border-color)]">
                        {hasNested && (
                          <button
                            onClick={() => toggleRow(index)}
                            className="p-0.5 rounded hover:bg-[var(--bg-secondary)]"
                          >
                            {isExpanded ? (
                              <ChevronDown size={14} className="text-[var(--text-muted)]" />
                            ) : (
                              <ChevronRight size={14} className="text-[var(--text-muted)]" />
                            )}
                          </button>
                        )}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="p-2 border-b border-[var(--border-color)] font-mono"
                        >
                          {renderCellValue(rowData[col])}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr key={`${row.id}-expanded`}>
                        <td colSpan={columns.length + 1} className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                          <div className="font-mono text-sm">
                            {renderNestedObject(rowData)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((row, index) => {
              const rowData = row.value as Record<string, unknown>;
              const isExpanded = expandedRows.has(index);

              return (
                <div
                  key={row.id}
                  className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] cursor-pointer"
                    onClick={() => toggleRow(index)}
                  >
                    <span className="font-medium text-[var(--text-primary)]">
                      Item {index + 1}
                    </span>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-[var(--text-muted)]" />
                    ) : (
                      <ChevronRight size={16} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="p-3">
                    {(isExpanded ? columns : columns.slice(0, 5)).map((col) => (
                      <div key={col} className="py-1 flex">
                        <span className="font-medium text-[var(--text-secondary)] w-1/3 flex-shrink-0 truncate pr-2">
                          {col}:
                        </span>
                        <span className="font-mono text-sm flex-1 truncate">
                          {renderCellValue(rowData[col])}
                        </span>
                      </div>
                    ))}
                    {!isExpanded && columns.length > 5 && (
                      <div className="pt-2 text-xs text-[var(--text-muted)]">
                        +{columns.length - 5} more fields
                      </div>
                    )}
                    {isExpanded && Object.values(rowData).some(
                      v => typeof v === 'object' && v !== null && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)
                    ) && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Nested Data</div>
                        <div className="font-mono text-xs">
                          {Object.entries(rowData)
                            .filter(([_, v]) => typeof v === 'object' && v !== null && (Array.isArray(v) ? v.length > 0 : Object.keys(v as object).length > 0))
                            .map(([k, v]) => (
                              <div key={k} className="py-1">
                                <span className="font-medium text-[var(--type-key)]">{k}: </span>
                                {renderNestedObject(v)}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
