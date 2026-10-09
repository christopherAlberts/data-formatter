import type { TreeNode, TreeNodeType } from '../types';
import * as yaml from 'js-yaml';

let nodeIdCounter = 0;

function generateId(): string {
  return `node-${++nodeIdCounter}`;
}

export function resetIdCounter(): void {
  nodeIdCounter = 0;
}

function getType(value: unknown): TreeNodeType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

function buildPath(parentPath: string, key: string | number): string {
  if (parentPath === '') {
    return typeof key === 'number' ? `[${key}]` : String(key);
  }
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`;
  }
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
    return `${parentPath}.${key}`;
  }
  return `${parentPath}["${key}"]`;
}

function isEmpty(value: unknown): boolean {
  if (value === null) return true;
  if (value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return true;
  return false;
}

export function buildTree(data: unknown, key: string | number = 'root', parentPath: string = '', depth: number = 0): TreeNode {
  const type = getType(data);
  const path = depth === 0 ? '' : buildPath(parentPath, key);
  
  const node: TreeNode = {
    id: generateId(),
    key,
    value: data,
    type,
    path,
    depth,
    isEmpty: isEmpty(data),
  };

  if (type === 'array' && Array.isArray(data)) {
    node.children = data.map((item, index) => 
      buildTree(item, index, path, depth + 1)
    );
  } else if (type === 'object' && data !== null && typeof data === 'object') {
    node.children = Object.entries(data as Record<string, unknown>).map(([k, v]) =>
      buildTree(v, k, path, depth + 1)
    );
  }

  return node;
}

export function findNodeById(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function findNodeByPath(root: TreeNode, path: string): TreeNode | null {
  if (root.path === path) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByPath(child, path);
      if (found) return found;
    }
  }
  return null;
}

export function getChildCount(node: TreeNode): number {
  return node.children?.length ?? 0;
}

export function getAllNodeIds(node: TreeNode): string[] {
  const ids: string[] = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllNodeIds(child));
    }
  }
  return ids;
}

export function getNodesAtDepth(node: TreeNode, targetDepth: number, currentDepth: number = 0): TreeNode[] {
  if (currentDepth === targetDepth) return [node];
  if (!node.children) return [];
  
  const nodes: TreeNode[] = [];
  for (const child of node.children) {
    nodes.push(...getNodesAtDepth(child, targetDepth, currentDepth + 1));
  }
  return nodes;
}

export function getMaxDepth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) {
    return node.depth;
  }
  return Math.max(...node.children.map(getMaxDepth));
}

export function isArrayOfObjects(node: TreeNode): boolean {
  if (node.type !== 'array' || !node.children || node.children.length === 0) {
    return false;
  }
  return node.children.every(child => child.type === 'object');
}

export function getUnionKeys(node: TreeNode): string[] {
  if (!isArrayOfObjects(node)) return [];
  
  const keysSet = new Set<string>();
  for (const child of node.children!) {
    if (child.children) {
      for (const grandchild of child.children) {
        keysSet.add(String(grandchild.key));
      }
    }
  }
  return Array.from(keysSet);
}

export function nodeToJSON(node: TreeNode, pretty: boolean = true): string {
  return JSON.stringify(node.value, null, pretty ? 2 : 0);
}

export function nodeToYAML(node: TreeNode): string {
  return yaml.dump(node.value);
}
