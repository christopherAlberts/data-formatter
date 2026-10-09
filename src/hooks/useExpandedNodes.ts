import { useState, useCallback } from 'react';
import type { TreeNode } from '../types';
import { getAllNodeIds } from '../utils/treeModel';

export function useExpandedNodes(root: TreeNode | null) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!root) return;
    const allIds = getAllNodeIds(root);
    setExpandedIds(new Set(allIds));
  }, [root]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const expandToDepth = useCallback((depth: number) => {
    if (!root) return;
    
    const idsToExpand = new Set<string>();
    
    function collectIds(node: TreeNode, currentDepth: number): void {
      if (currentDepth < depth && node.children && node.children.length > 0) {
        idsToExpand.add(node.id);
        for (const child of node.children) {
          collectIds(child, currentDepth + 1);
        }
      }
    }
    
    collectIds(root, 0);
    setExpandedIds(idsToExpand);
  }, [root]);

  const isExpanded = useCallback((id: string) => expandedIds.has(id), [expandedIds]);

  const expandNodes = useCallback((ids: string[]) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      for (const id of ids) {
        next.add(id);
      }
      return next;
    });
  }, []);

  return {
    expandedIds,
    toggle,
    expandAll,
    collapseAll,
    expandToDepth,
    isExpanded,
    expandNodes,
  };
}
