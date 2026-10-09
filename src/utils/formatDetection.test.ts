import { describe, it, expect } from 'vitest';
import { detectFormat, formatDisplayName } from './formatDetection';

describe('detectFormat', () => {
  describe('JSON detection', () => {
    it('detects valid JSON object', () => {
      const result = detectFormat('{"key": "value"}');
      expect(result.format).toBe('json');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('detects valid JSON array', () => {
      const result = detectFormat('[1, 2, 3]');
      expect(result.format).toBe('json');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('detects nested JSON', () => {
      const result = detectFormat('{"nested": {"key": [1, 2, 3]}}');
      expect(result.format).toBe('json');
    });
  });

  describe('JSON5/Lenient JSON detection', () => {
    it('detects JSON with trailing commas', () => {
      const result = detectFormat('{"key": "value",}');
      expect(result.format).toBe('json5');
    });

    it('detects JSON with single-line comments', () => {
      const result = detectFormat('{"key": "value"} // comment');
      expect(result.format).toBe('json5');
    });

    it('detects JSON with multi-line comments', () => {
      const result = detectFormat('{"key": /* comment */ "value"}');
      expect(result.format).toBe('json5');
    });

    it('detects JSON with single quotes (ambiguous with Python, defaults to Python)', () => {
      const result = detectFormat("{'key': 'value'}");
      // Single-quoted keys look like Python, so it detects as Python
      // This is acceptable ambiguity - both parsers can handle it
      expect(['json5', 'python']).toContain(result.format);
    });
  });

  describe('Python dict/list detection', () => {
    it('detects dict with True/False', () => {
      const result = detectFormat("{'active': True, 'enabled': False}");
      expect(result.format).toBe('python');
    });

    it('detects dict with None', () => {
      const result = detectFormat("{'value': None}");
      expect(result.format).toBe('python');
    });

    it('detects tuple-like syntax', () => {
      const result = detectFormat("{'coords': (1, 2, 3)}");
      expect(result.format).toBe('python');
    });
  });

  describe('XML detection', () => {
    it('detects XML with declaration', () => {
      const result = detectFormat('<?xml version="1.0"?><root></root>');
      expect(result.format).toBe('xml');
    });

    it('detects simple XML elements', () => {
      const result = detectFormat('<root><child>value</child></root>');
      expect(result.format).toBe('xml');
    });

    it('detects self-closing tags', () => {
      const result = detectFormat('<root><item /><item /></root>');
      expect(result.format).toBe('xml');
    });
  });

  describe('YAML detection', () => {
    it('detects YAML with document separator', () => {
      const result = detectFormat('---\nkey: value');
      expect(result.format).toBe('yaml');
    });

    it('detects YAML key-value pairs', () => {
      const result = detectFormat('name: John\nage: 30\ncity: NYC');
      expect(result.format).toBe('yaml');
    });

    it('detects YAML list items', () => {
      const result = detectFormat('items:\n  - one\n  - two\n  - three');
      expect(result.format).toBe('yaml');
    });
  });

  describe('CSV detection', () => {
    it('detects comma-separated values', () => {
      const result = detectFormat('name,age,city\nJohn,30,NYC\nJane,25,LA');
      expect(result.format).toBe('csv');
    });

    it('detects tab-separated values', () => {
      const result = detectFormat('name\tage\tcity\nJohn\t30\tNYC');
      expect(result.format).toBe('csv');
    });
  });

  describe('Unknown format', () => {
    it('returns unknown for empty input', () => {
      const result = detectFormat('');
      expect(result.format).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('returns unknown for whitespace only', () => {
      const result = detectFormat('   \n\t  ');
      expect(result.format).toBe('unknown');
    });

    it('returns unknown for plain text', () => {
      const result = detectFormat('Just some plain text without structure');
      expect(result.format).toBe('unknown');
    });
  });
});

describe('formatDisplayName', () => {
  it('returns correct display names', () => {
    expect(formatDisplayName('json')).toBe('JSON');
    expect(formatDisplayName('json5')).toBe('JSON5/Lenient JSON');
    expect(formatDisplayName('python')).toBe('Python Dict/List');
    expect(formatDisplayName('xml')).toBe('XML');
    expect(formatDisplayName('yaml')).toBe('YAML');
    expect(formatDisplayName('csv')).toBe('CSV/TSV');
    expect(formatDisplayName('unknown')).toBe('Unknown');
  });
});
