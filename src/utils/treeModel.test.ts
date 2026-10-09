import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTree,
  resetIdCounter,
  findNodeById,
  findNodeByPath,
  getChildCount,
  getAllNodeIds,
  getMaxDepth,
  isArrayOfObjects,
  getUnionKeys,
} from './treeModel';

describe('treeModel', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('buildTree', () => {
    it('builds tree from simple object', () => {
      const data = { name: 'John', age: 30 };
      const tree = buildTree(data);
      
      expect(tree.type).toBe('object');
      expect(tree.children).toHaveLength(2);
      expect(tree.children![0].key).toBe('name');
      expect(tree.children![0].value).toBe('John');
      expect(tree.children![0].type).toBe('string');
      expect(tree.children![1].key).toBe('age');
      expect(tree.children![1].value).toBe(30);
      expect(tree.children![1].type).toBe('number');
    });

    it('builds tree from array', () => {
      const data = [1, 2, 3];
      const tree = buildTree(data);
      
      expect(tree.type).toBe('array');
      expect(tree.children).toHaveLength(3);
      expect(tree.children![0].key).toBe(0);
      expect(tree.children![0].value).toBe(1);
    });

    it('builds tree with nested data', () => {
      const data = { person: { name: 'John', hobbies: ['reading', 'coding'] } };
      const tree = buildTree(data);
      
      expect(tree.type).toBe('object');
      const personNode = tree.children![0];
      expect(personNode.type).toBe('object');
      expect(personNode.children).toHaveLength(2);
      
      const hobbiesNode = personNode.children![1];
      expect(hobbiesNode.type).toBe('array');
      expect(hobbiesNode.children).toHaveLength(2);
    });

    it('handles null values', () => {
      const data = { value: null };
      const tree = buildTree(data);
      
      expect(tree.children![0].type).toBe('null');
      expect(tree.children![0].isEmpty).toBe(true);
    });

    it('handles boolean values', () => {
      const data = { active: true, disabled: false };
      const tree = buildTree(data);
      
      expect(tree.children![0].type).toBe('boolean');
      expect(tree.children![0].value).toBe(true);
      expect(tree.children![1].type).toBe('boolean');
      expect(tree.children![1].value).toBe(false);
    });

    it('marks empty strings as empty', () => {
      const data = { name: '' };
      const tree = buildTree(data);
      
      expect(tree.children![0].isEmpty).toBe(true);
    });

    it('marks empty arrays as empty', () => {
      const data = { items: [] };
      const tree = buildTree(data);
      
      expect(tree.children![0].isEmpty).toBe(true);
    });

    it('marks empty objects as empty', () => {
      const data = { config: {} };
      const tree = buildTree(data);
      
      expect(tree.children![0].isEmpty).toBe(true);
    });

    it('generates correct paths', () => {
      const data = { users: [{ name: 'John' }] };
      const tree = buildTree(data);
      
      const usersNode = tree.children![0];
      expect(usersNode.path).toBe('users');
      
      const firstUserNode = usersNode.children![0];
      expect(firstUserNode.path).toBe('users[0]');
      
      const nameNode = firstUserNode.children![0];
      expect(nameNode.path).toBe('users[0].name');
    });
  });

  describe('findNodeById', () => {
    it('finds node by id', () => {
      const data = { name: 'John' };
      const tree = buildTree(data);
      const nameNode = tree.children![0];
      
      const found = findNodeById(tree, nameNode.id);
      expect(found).toBe(nameNode);
    });

    it('returns null for non-existent id', () => {
      const data = { name: 'John' };
      const tree = buildTree(data);
      
      const found = findNodeById(tree, 'non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findNodeByPath', () => {
    it('finds node by path', () => {
      const data = { users: [{ name: 'John' }] };
      const tree = buildTree(data);
      
      const found = findNodeByPath(tree, 'users[0].name');
      expect(found).toBeDefined();
      expect(found!.value).toBe('John');
    });
  });

  describe('getChildCount', () => {
    it('returns correct child count for arrays', () => {
      const data = [1, 2, 3, 4, 5];
      const tree = buildTree(data);
      
      expect(getChildCount(tree)).toBe(5);
    });

    it('returns correct child count for objects', () => {
      const data = { a: 1, b: 2, c: 3 };
      const tree = buildTree(data);
      
      expect(getChildCount(tree)).toBe(3);
    });

    it('returns 0 for leaf nodes', () => {
      const data = 'string';
      const tree = buildTree(data);
      
      expect(getChildCount(tree)).toBe(0);
    });
  });

  describe('getAllNodeIds', () => {
    it('returns all node ids', () => {
      const data = { a: { b: 1 } };
      const tree = buildTree(data);
      
      const ids = getAllNodeIds(tree);
      expect(ids).toHaveLength(3);
    });
  });

  describe('getMaxDepth', () => {
    it('returns correct max depth', () => {
      const data = { a: { b: { c: { d: 1 } } } };
      const tree = buildTree(data);
      
      expect(getMaxDepth(tree)).toBe(4);
    });

    it('returns 0 for flat data', () => {
      const data = 'string';
      const tree = buildTree(data);
      
      expect(getMaxDepth(tree)).toBe(0);
    });
  });

  describe('isArrayOfObjects', () => {
    it('returns true for array of objects', () => {
      const data = [{ a: 1 }, { b: 2 }];
      const tree = buildTree(data);
      
      expect(isArrayOfObjects(tree)).toBe(true);
    });

    it('returns false for array of primitives', () => {
      const data = [1, 2, 3];
      const tree = buildTree(data);
      
      expect(isArrayOfObjects(tree)).toBe(false);
    });

    it('returns false for objects', () => {
      const data = { a: 1 };
      const tree = buildTree(data);
      
      expect(isArrayOfObjects(tree)).toBe(false);
    });

    it('returns false for empty arrays', () => {
      const data: unknown[] = [];
      const tree = buildTree(data);
      
      expect(isArrayOfObjects(tree)).toBe(false);
    });
  });

  describe('getUnionKeys', () => {
    it('returns union of all keys in array of objects', () => {
      const data = [
        { a: 1, b: 2 },
        { b: 3, c: 4 },
        { a: 5, c: 6 },
      ];
      const tree = buildTree(data);
      
      const keys = getUnionKeys(tree);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys).toHaveLength(3);
    });

    it('returns empty array for non-array-of-objects', () => {
      const data = { a: 1 };
      const tree = buildTree(data);
      
      expect(getUnionKeys(tree)).toEqual([]);
    });
  });
});
