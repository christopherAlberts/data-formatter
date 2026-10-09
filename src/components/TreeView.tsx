import { memo, useCallback } from 'react';
import { ChevronRight, ChevronDown, Copy, Clipboard } from 'lucide-react';
import type { TreeNode } from '../types';
import { getChildCount } from '../utils/treeModel';

interface TreeViewProps {
  node: TreeNode;
  isExpanded: (id: string) => boolean;
  onToggle: (id: string) => void;
  searchQuery: string;
  matchingNodeIds: Set<string>;
  onCopyValue: (value: unknown) => void;
  onCopyPath: (path: string) => void;
  depth?: number;
}

const TreeNodeComponent = memo(function TreeNodeComponent({
  node,
  isExpanded,
  onToggle,
  searchQuery,
  matchingNodeIds,
  onCopyValue,
  onCopyPath,
  depth = 0,
}: TreeViewProps) {
  const expanded = isExpanded(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const childCount = getChildCount(node);
  const isMatch = matchingNodeIds.has(node.id);

  const handleToggle = useCallback(() => {
    onToggle(node.id);
  }, [node.id, onToggle]);

  const handleCopyValue = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyValue(node.value);
  }, [node.value, onCopyValue]);

  const handleCopyPath = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPath(node.path);
  }, [node.path, onCopyPath]);

  const renderValue = () => {
    if (node.type === 'array') {
      if (!expanded && childCount > 0) {
        return (
          <span className="text-[var(--text-muted)]">
            [{childCount} item{childCount !== 1 ? 's' : ''}]
          </span>
        );
      }
      if (node.isEmpty) {
        return <span className="empty-badge">[] empty</span>;
      }
      return <span className="text-[var(--text-muted)]">[</span>;
    }
    
    if (node.type === 'object') {
      if (!expanded && childCount > 0) {
        return (
          <span className="text-[var(--text-muted)]">
            {'{'}
            {childCount} key{childCount !== 1 ? 's' : ''}
            {'}'}
          </span>
        );
      }
      if (node.isEmpty) {
        return <span className="empty-badge">{'{}'} empty</span>;
      }
      return <span className="text-[var(--text-muted)]">{'{'}</span>;
    }
    
    if (node.type === 'null') {
      return <span className="tree-value-null">null</span>;
    }
    
    if (node.type === 'boolean') {
      return <span className="tree-value-boolean">{String(node.value)}</span>;
    }
    
    if (node.type === 'number') {
      return <span className="tree-value-number">{String(node.value)}</span>;
    }
    
    if (node.type === 'string') {
      const str = node.value as string;
      if (str === '') {
        return <span className="empty-badge">"" empty</span>;
      }
      const displayStr = str.length > 100 ? str.slice(0, 100) + '...' : str;
      return <span className="tree-value-string">"{highlightMatch(displayStr, searchQuery)}"</span>;
    }
    
    return <span className="text-[var(--text-secondary)]">{String(node.value)}</span>;
  };

  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <mark className="search-highlight">{text.slice(index, index + query.length)}</mark>
        {text.slice(index + query.length)}
      </>
    );
  };

  const renderKey = () => {
    if (depth === 0 && node.key === 'root') return null;
    
    const keyStr = String(node.key);
    const isNumeric = typeof node.key === 'number';
    
    return (
      <span className={isNumeric ? 'text-[var(--text-muted)]' : 'tree-key font-medium'}>
        {isNumeric ? `[${keyStr}]` : highlightMatch(keyStr, searchQuery)}
        {!isNumeric && <span className="text-[var(--text-muted)]">: </span>}
      </span>
    );
  };

  return (
    <div className={`${isMatch ? 'bg-yellow-500/10' : ''}`}>
      <div
        className={`tree-node flex items-center gap-1 py-0.5 px-2 cursor-pointer group`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={hasChildren ? handleToggle : undefined}
      >
        <span className="expand-collapse-btn flex-shrink-0">
          {hasChildren ? (
            expanded ? (
              <ChevronDown size={14} className="text-[var(--text-muted)]" />
            ) : (
              <ChevronRight size={14} className="text-[var(--text-muted)]" />
            )
          ) : (
            <span className="w-[14px]" />
          )}
        </span>
        
        <span className="flex-1 font-mono text-sm truncate">
          {renderKey()}
          {renderValue()}
        </span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={handleCopyValue}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
            title="Copy value"
          >
            <Copy size={12} />
          </button>
          {node.path && (
            <button
              onClick={handleCopyPath}
              className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
              title="Copy path"
            >
              <Clipboard size={12} />
            </button>
          )}
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              isExpanded={isExpanded}
              onToggle={onToggle}
              searchQuery={searchQuery}
              matchingNodeIds={matchingNodeIds}
              onCopyValue={onCopyValue}
              onCopyPath={onCopyPath}
              depth={depth + 1}
            />
          ))}
          {node.type === 'array' && (
            <div
              className="py-0.5 px-2 font-mono text-sm text-[var(--text-muted)]"
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              ]
            </div>
          )}
          {node.type === 'object' && (
            <div
              className="py-0.5 px-2 font-mono text-sm text-[var(--text-muted)]"
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              {'}'}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export { TreeNodeComponent as TreeView };
