import * as yaml from 'js-yaml';
import Papa from 'papaparse';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

export function valueToJSON(value: unknown, pretty: boolean = true): string {
  return JSON.stringify(value, null, pretty ? 2 : 0);
}

export function valueToYAML(value: unknown): string {
  return yaml.dump(value, { indent: 2, lineWidth: -1 });
}

export function valueToCSV(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  if (value.length === 0) return '';
  if (typeof value[0] !== 'object' || value[0] === null) return null;
  
  const csv = Papa.unparse(value as object[]);
  return csv;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildPath(parts: (string | number)[]): string {
  return parts
    .map((part, index) => {
      if (typeof part === 'number') {
        return `[${part}]`;
      }
      if (index === 0) {
        return part;
      }
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(part)) {
        return `.${part}`;
      }
      return `["${part}"]`;
    })
    .join('');
}
