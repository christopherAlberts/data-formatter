import * as yaml from 'js-yaml';
import Papa from 'papaparse';
import type { DataFormat, ParseResult } from '../types';

export function parseData(input: string, format: DataFormat): ParseResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { success: false, data: null, format, error: 'Input is empty' };
  }

  switch (format) {
    case 'json':
      return parseJSON(trimmed);
    case 'json5':
      return parseJSON5(trimmed);
    case 'python':
      return parsePython(trimmed);
    case 'xml':
      return parseXML(trimmed);
    case 'yaml':
      return parseYAML(trimmed);
    case 'csv':
      return parseCSV(trimmed);
    case 'unknown':
      return attemptBestEffortParse(trimmed);
    default:
      return { success: false, data: null, format, error: 'Unknown format' };
  }
}

function parseJSON(input: string): ParseResult {
  try {
    const data = JSON.parse(input);
    return { success: true, data, format: 'json' };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Invalid JSON';
    return { success: false, data: null, format: 'json', error };
  }
}

function parseJSON5(input: string): ParseResult {
  try {
    // Remove single-line comments
    let cleaned = input.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    // Replace single quotes with double quotes (simple approach)
    cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    // Remove trailing commas before } or ]
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    const data = JSON.parse(cleaned);
    return { success: true, data, format: 'json5' };
  } catch (e) {
    // Fall back to trying as plain JSON
    const jsonResult = parseJSON(input);
    if (jsonResult.success) {
      return { ...jsonResult, format: 'json5' };
    }
    
    const error = e instanceof Error ? e.message : 'Invalid JSON5';
    return { success: false, data: null, format: 'json5', error };
  }
}

function parsePython(input: string): ParseResult {
  try {
    let cleaned = input;
    
    // Replace Python booleans and None
    cleaned = cleaned.replace(/\bTrue\b/g, 'true');
    cleaned = cleaned.replace(/\bFalse\b/g, 'false');
    cleaned = cleaned.replace(/\bNone\b/g, 'null');
    
    // Replace single quotes with double quotes
    cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    
    // Replace tuples with arrays (simple cases)
    cleaned = cleaned.replace(/\(([^()]*)\)/g, '[$1]');
    
    // Remove trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    const data = JSON.parse(cleaned);
    return { success: true, data, format: 'python' };
  } catch (e) {
    // Try a more lenient approach
    try {
      const jsonResult = parseJSON5(input);
      if (jsonResult.success) {
        return { ...jsonResult, format: 'python' };
      }
    } catch {
      // Continue to error
    }
    
    const error = e instanceof Error ? e.message : 'Invalid Python dict/list';
    return { success: false, data: null, format: 'python', error };
  }
}

function parseXML(input: string): ParseResult {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'application/xml');
    
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      const errorText = parseError.textContent || 'Invalid XML';
      return { success: false, data: null, format: 'xml', error: errorText };
    }
    
    const data = xmlToObject(doc.documentElement);
    return { success: true, data, format: 'xml' };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Invalid XML';
    return { success: false, data: null, format: 'xml', error };
  }
}

function xmlToObject(element: Element): unknown {
  const hasChildElements = Array.from(element.children).length > 0;
  
  if (!hasChildElements) {
    const text = element.textContent?.trim() || '';
    // Try to parse as number or boolean
    if (text === 'true') return true;
    if (text === 'false') return false;
    if (text === '' && element.children.length === 0) return text;
    const num = Number(text);
    if (!isNaN(num) && text !== '') return num;
    return text;
  }
  
  const result: Record<string, unknown> = {};
  
  // Add attributes
  Array.from(element.attributes).forEach(attr => {
    result[`@${attr.name}`] = attr.value;
  });
  
  // Group children by tag name
  const childGroups: Record<string, Element[]> = {};
  Array.from(element.children).forEach(child => {
    const name = child.tagName;
    if (!childGroups[name]) {
      childGroups[name] = [];
    }
    childGroups[name].push(child);
  });
  
  // Convert children
  Object.entries(childGroups).forEach(([name, children]) => {
    if (children.length === 1) {
      result[name] = xmlToObject(children[0]);
    } else {
      result[name] = children.map(child => xmlToObject(child));
    }
  });
  
  return result;
}

function parseYAML(input: string): ParseResult {
  try {
    const data = yaml.load(input);
    return { success: true, data, format: 'yaml' };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Invalid YAML';
    return { success: false, data: null, format: 'yaml', error };
  }
}

function parseCSV(input: string): ParseResult {
  try {
    const result = Papa.parse(input, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    
    if (result.errors.length > 0 && result.data.length === 0) {
      return { 
        success: false, 
        data: null, 
        format: 'csv', 
        error: result.errors.map(e => e.message).join('; ') 
      };
    }
    
    const warning = result.errors.length > 0 
      ? `Parsed with warnings: ${result.errors.map(e => e.message).join('; ')}`
      : undefined;
    
    return { success: true, data: result.data, format: 'csv', warning };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Invalid CSV';
    return { success: false, data: null, format: 'csv', error };
  }
}

function attemptBestEffortParse(input: string): ParseResult {
  // Try each parser in order of likelihood
  const parsers: Array<{ parse: (input: string) => ParseResult; name: string }> = [
    { parse: parseJSON, name: 'JSON' },
    { parse: parseJSON5, name: 'JSON5' },
    { parse: parsePython, name: 'Python' },
    { parse: parseYAML, name: 'YAML' },
    { parse: parseXML, name: 'XML' },
    { parse: parseCSV, name: 'CSV' },
  ];

  for (const { parse, name } of parsers) {
    const result = parse(input);
    if (result.success) {
      return {
        ...result,
        warning: `Auto-detected as ${name}`
      };
    }
  }

  // If nothing works, return as plain string
  return {
    success: true,
    data: input,
    format: 'unknown',
    warning: 'Could not parse as structured data. Displayed as plain text.'
  };
}
