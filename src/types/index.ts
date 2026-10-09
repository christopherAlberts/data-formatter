export type DataFormat = 'json' | 'json5' | 'python' | 'xml' | 'yaml' | 'csv' | 'unknown';

export type TreeNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface TreeNode {
  id: string;
  key: string | number;
  value: unknown;
  type: TreeNodeType;
  children?: TreeNode[];
  path: string;
  depth: number;
  isEmpty?: boolean;
}

export interface ParseResult {
  success: boolean;
  data: unknown;
  format: DataFormat;
  warning?: string;
  error?: string;
}

export interface FormatDetection {
  format: DataFormat;
  confidence: number;
}

export type ViewMode = 'tree' | 'table' | 'card';

export interface SearchMatch {
  nodeId: string;
  path: string;
  matchType: 'key' | 'value';
  matchText: string;
}
