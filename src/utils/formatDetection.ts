import type { DataFormat, FormatDetection } from '../types';

export function detectFormat(input: string): FormatDetection {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { format: 'unknown', confidence: 0 };
  }

  // Check for XML first (starts with < and contains tags)
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && /<\/?\w+/.test(trimmed))) {
    return { format: 'xml', confidence: 0.95 };
  }

  // Check for CSV/TSV (has consistent delimiters across lines)
  const csvCheck = checkCSV(trimmed);
  if (csvCheck.isCSV) {
    return { format: 'csv', confidence: csvCheck.confidence };
  }

  // Check for YAML (has YAML-specific patterns)
  const yamlCheck = checkYAML(trimmed);
  if (yamlCheck.isYAML) {
    return { format: 'yaml', confidence: yamlCheck.confidence };
  }

  // Check for JSON (strict)
  if (isStrictJSON(trimmed)) {
    return { format: 'json', confidence: 0.95 };
  }

  // Check for Python-style dict/list BEFORE JSON5 (both have single quotes, but Python has True/False/None)
  if (isPythonStyle(trimmed)) {
    return { format: 'python', confidence: 0.85 };
  }

  // Check for JSON5/lenient JSON (trailing commas, comments, single quotes)
  if (isJSON5Like(trimmed)) {
    return { format: 'json5', confidence: 0.8 };
  }

  return { format: 'unknown', confidence: 0 };
}

function isStrictJSON(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

function isJSON5Like(input: string): boolean {
  const hasTrailingComma = /,\s*[}\]]/.test(input);
  const hasSingleLineComment = /\/\/.*$/m.test(input);
  const hasMultiLineComment = /\/\*[\s\S]*?\*\//.test(input);
  const hasSingleQuotedStrings = /'[^']*'/.test(input);
  
  if ((input.startsWith('{') || input.startsWith('[')) && 
      (hasTrailingComma || hasSingleLineComment || hasMultiLineComment || hasSingleQuotedStrings)) {
    return true;
  }
  
  return false;
}

function isPythonStyle(input: string): boolean {
  const hasPythonBooleans = /\b(True|False|None)\b/.test(input);
  const hasTuples = /\([^)]*,/.test(input);
  const hasSingleQuotedKeys = /'\w+':\s*/.test(input);
  
  if ((input.startsWith('{') || input.startsWith('[') || input.startsWith('(')) && 
      (hasPythonBooleans || hasTuples || hasSingleQuotedKeys)) {
    return true;
  }
  
  return false;
}

function checkCSV(input: string): { isCSV: boolean; confidence: number } {
  const lines = input.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return { isCSV: false, confidence: 0 };
  }

  // Check for consistent comma or tab delimiters
  const commaPattern = lines[0].split(',').length;
  const tabPattern = lines[0].split('\t').length;
  
  if (commaPattern > 1) {
    const consistent = lines.every(line => {
      const count = line.split(',').length;
      return count === commaPattern || count === commaPattern - 1 || count === commaPattern + 1;
    });
    if (consistent) {
      return { isCSV: true, confidence: 0.85 };
    }
  }
  
  if (tabPattern > 1) {
    const consistent = lines.every(line => {
      const count = line.split('\t').length;
      return count === tabPattern || count === tabPattern - 1 || count === tabPattern + 1;
    });
    if (consistent) {
      return { isCSV: true, confidence: 0.85 };
    }
  }
  
  return { isCSV: false, confidence: 0 };
}

function checkYAML(input: string): { isYAML: boolean; confidence: number } {
  const lines = input.split('\n');
  
  // YAML document separator
  if (input.startsWith('---')) {
    return { isYAML: true, confidence: 0.95 };
  }
  
  // Check for YAML-like key: value patterns with indentation
  const keyValuePattern = /^\s*[\w-]+:\s*(.*)$/;
  const listItemPattern = /^\s*-\s+/;
  
  let yamlPatterns = 0;
  let totalLines = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    totalLines++;
    if (keyValuePattern.test(line) || listItemPattern.test(line)) {
      yamlPatterns++;
    }
  }
  
  if (totalLines > 0 && yamlPatterns / totalLines > 0.7) {
    return { isYAML: true, confidence: 0.75 };
  }
  
  return { isYAML: false, confidence: 0 };
}

export function formatDisplayName(format: DataFormat): string {
  const names: Record<DataFormat, string> = {
    json: 'JSON',
    json5: 'JSON5/Lenient JSON',
    python: 'Python Dict/List',
    xml: 'XML',
    yaml: 'YAML',
    csv: 'CSV/TSV',
    unknown: 'Unknown'
  };
  return names[format];
}
