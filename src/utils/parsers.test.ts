import { describe, it, expect } from 'vitest';
import { parseData } from './parsers';

describe('parseData', () => {
  describe('JSON parsing', () => {
    it('parses valid JSON object', () => {
      const result = parseData('{"key": "value", "num": 42}', 'json');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value', num: 42 });
    });

    it('parses valid JSON array', () => {
      const result = parseData('[1, 2, 3]', 'json');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });

    it('handles invalid JSON', () => {
      const result = parseData('{invalid}', 'json');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('JSON5 parsing', () => {
    it('parses JSON with trailing commas', () => {
      const result = parseData('{"key": "value",}', 'json5');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('parses JSON with single quotes', () => {
      const result = parseData("{'key': 'value'}", 'json5');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('parses JSON with comments', () => {
      const result = parseData('{"key": "value"} // comment', 'json5');
      expect(result.success).toBe(true);
    });
  });

  describe('Python dict parsing', () => {
    it('parses dict with True/False/None', () => {
      const result = parseData("{'active': True, 'disabled': False, 'value': None}", 'python');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ active: true, disabled: false, value: null });
    });

    it('parses dict with single quotes', () => {
      const result = parseData("{'name': 'John', 'age': 30}", 'python');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('XML parsing', () => {
    it('parses simple XML', () => {
      const result = parseData('<root><name>John</name><age>30</age></root>', 'xml');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('parses XML with attributes', () => {
      const result = parseData('<person id="1"><name>John</name></person>', 'xml');
      expect(result.success).toBe(true);
      expect((result.data as any)['@id']).toBe('1');
    });

    it('handles invalid XML', () => {
      const result = parseData('<unclosed>', 'xml');
      expect(result.success).toBe(false);
    });
  });

  describe('YAML parsing', () => {
    it('parses simple YAML', () => {
      const result = parseData('name: John\nage: 30', 'yaml');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('parses YAML list', () => {
      const result = parseData('- one\n- two\n- three', 'yaml');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['one', 'two', 'three']);
    });

    it('parses nested YAML', () => {
      const result = parseData('person:\n  name: John\n  age: 30', 'yaml');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ person: { name: 'John', age: 30 } });
    });
  });

  describe('CSV parsing', () => {
    it('parses CSV with headers', () => {
      const result = parseData('name,age\nJohn,30\nJane,25', 'csv');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]);
    });

    it('handles quoted values', () => {
      const result = parseData('name,desc\nJohn,"Hello, World"', 'csv');
      expect(result.success).toBe(true);
      expect((result.data as any)[0].desc).toBe('Hello, World');
    });

    it('handles empty values', () => {
      const result = parseData('name,age\nJohn,\nJane,25', 'csv');
      expect(result.success).toBe(true);
    });
  });

  describe('Best-effort parsing', () => {
    it('attempts to parse unknown format as JSON first', () => {
      const result = parseData('{"key": "value"}', 'unknown');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('falls back to plain text for unparseable input', () => {
      // Note: YAML can parse most text as a string, so this will succeed as YAML
      const result = parseData('just plain text', 'unknown');
      expect(result.success).toBe(true);
      // YAML parses plain text as a string, which is valid
      expect(result.warning).toBeDefined();
    });
  });

  describe('Empty input handling', () => {
    it('handles empty input', () => {
      const result = parseData('', 'json');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Input is empty');
    });

    it('handles whitespace-only input', () => {
      const result = parseData('   ', 'json');
      expect(result.success).toBe(false);
    });
  });
});
