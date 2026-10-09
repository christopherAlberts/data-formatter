import type { TreeNode, SearchMatch } from '../types';

export function searchTree(node: TreeNode, query: string, caseSensitive: boolean = false): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  function search(n: TreeNode): void {
    const keyStr = String(n.key);
    const keyToMatch = caseSensitive ? keyStr : keyStr.toLowerCase();
    
    if (keyToMatch.includes(searchQuery)) {
      matches.push({
        nodeId: n.id,
        path: n.path,
        matchType: 'key',
        matchText: keyStr,
      });
    }
    
    if (n.type !== 'object' && n.type !== 'array') {
      const valueStr = String(n.value);
      const valueToMatch = caseSensitive ? valueStr : valueStr.toLowerCase();
      
      if (valueToMatch.includes(searchQuery)) {
        matches.push({
          nodeId: n.id,
          path: n.path,
          matchType: 'value',
          matchText: valueStr,
        });
      }
    }
    
    if (n.children) {
      for (const child of n.children) {
        search(child);
      }
    }
  }
  
  if (query.trim()) {
    search(node);
  }
  
  return matches;
}

export function highlightText(text: string, query: string, caseSensitive: boolean = false): string {
  if (!query.trim()) return text;
  
  const flags = caseSensitive ? 'g' : 'gi';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, flags);
  
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

export function getMatchingNodeIds(matches: SearchMatch[]): Set<string> {
  return new Set(matches.map(m => m.nodeId));
}

export function getAncestorIds(node: TreeNode, targetId: string): string[] {
  const ancestors: string[] = [];
  
  function findPath(n: TreeNode, path: string[]): boolean {
    if (n.id === targetId) {
      ancestors.push(...path);
      return true;
    }
    
    if (n.children) {
      for (const child of n.children) {
        if (findPath(child, [...path, n.id])) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  findPath(node, []);
  return ancestors;
}

export function getAllAncestorIds(root: TreeNode, matches: SearchMatch[]): Set<string> {
  const ancestorIds = new Set<string>();
  
  for (const match of matches) {
    const ancestors = getAncestorIds(root, match.nodeId);
    for (const id of ancestors) {
      ancestorIds.add(id);
    }
  }
  
  return ancestorIds;
}
