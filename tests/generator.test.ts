import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processData,
  generateData,
  processUserData,
  processArrayData,
  processObjectData,
  process,
} from '../src/lib/generator';

describe('generator', () => {
  describe('processUserData', () => {
    it('returns the fixed value when there is no pipe', () => {
      assert.strictEqual(processUserData('fixed-value'), 'fixed-value');
    });

    it('returns one of the options when pipe-separated', () => {
      for (let i = 0; i < 30; i++) {
        const value = processUserData('a|b|c');
        assert.ok(['a', 'b', 'c'].includes(value));
      }
    });

    it('returns an empty string for empty input', () => {
      assert.strictEqual(processUserData(''), '');
    });

    it('returns comma-separated values literally (only | splits options)', () => {
      assert.strictEqual(processUserData('a,b,c'), 'a,b,c');
    });
  });

  describe('generateData', () => {
    it('returns a random word for an empty type', () => {
      const value = generateData('', {}, {});
      assert.strictEqual(typeof value, 'string');
      assert.ok(value.length > 0);
    });

    it('falls back to user data for unknown types', () => {
      assert.strictEqual(generateData('unknown-type', {}, {}), 'unknown-type');
    });

    it('supports integer with a digit parameter', () => {
      for (let i = 0; i < 20; i++) {
        const value = generateData('int:3', {}, {});
        assert.ok(value >= 100 && value <= 999);
      }
    });

    it('supports title', () => {
      const value = generateData('title', {}, {});
      assert.strictEqual(typeof value, 'string');
      assert.ok(value.length > 0);
    });

    it('supports boolean', () => {
      const value = generateData('boolean', {}, {});
      assert.strictEqual(typeof value, 'boolean');
    });

    it('supports every documented return type', () => {
      const types = [
        'id', 'uuid', 'boolean', 'text', 'title', 'textarea',
        'integer', 'float', 'phone', 'zipcode', 'date', 'time',
        'date-time', 'url', 'email', 'image', 'pdf', 'csv', 'doc',
        'ipaddress', 'second', 'alphanumeric',
      ];
      types.forEach((type) => {
        const value = generateData(type, {}, {});
        assert.notStrictEqual(value, undefined, `${type} should produce a value`);
        assert.notStrictEqual(value, null, `${type} should produce a value`);
      });
    });
  });

  describe('processData', () => {
    it('returns a single generated value for a simple type', () => {
      const value = processData('boolean', {}, {});
      assert.strictEqual(typeof value, 'boolean');
    });

    it('concatenates types chained with >', () => {
      // "01" (fixed) + one of 5..9 + a 2-digit integer
      const value = processData('01>5|6|7|8|9>int:2', {}, {});
      assert.match(String(value), /^01[5-9]\d{2}$/);
    });
  });

  describe('processArrayData', () => {
    it('generates an array of the requested length for a single value', () => {
      const result = processArrayData(['text'], { __range: '3' }, {});
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 3);
      result.forEach((item: any) => {
        assert.strictEqual(typeof item, 'string');
        assert.ok(item.length > 0);
      });
    });

    it('generates an array of objects for an object schema', () => {
      const result = processArrayData([{ title: 'title', active: 'boolean' }], { __range: '2' }, {});
      assert.strictEqual(result.length, 2);
      result.forEach((obj: any) => {
        assert.strictEqual(typeof obj.title, 'string');
        assert.strictEqual(typeof obj.active, 'boolean');
      });
    });

    it('picks a random element when multiple values are provided', () => {
      const result = processArrayData(['a', 'b', 'c'], {}, {});
      assert.ok(['a', 'b', 'c'].includes(result[0]));
    });
  });

  describe('processObjectData', () => {
    it('processes a plain object schema recursively', () => {
      const result = processObjectData({ title: 'title', active: 'boolean' }, {}, {});
      assert.strictEqual(typeof result.title, 'string');
      assert.strictEqual(typeof result.active, 'boolean');
    });

    it('processes an array type object', () => {
      const result = processObjectData(
        { __type: 'array', __range: '2', __property: { id: 'uuid' } },
        {},
        {}
      );
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 2);
    });

    it('processes a scalar __type object', () => {
      const result = processObjectData({ __type: 'boolean' }, {}, {});
      assert.strictEqual(typeof result, 'boolean');
    });

    it('processes a token type object into a jwt', () => {
      const result = processObjectData(
        { __type: 'token', __property: { user: 'text', role: 'text' } },
        {},
        { secret: 'test-secret' }
      );
      assert.strictEqual(typeof result, 'string');
      assert.strictEqual(result.split('.').length, 3);
    });
  });

  describe('process', () => {
    it('processes a full nested schema', () => {
      const result = process(
        {
          name: 'title',
          age: 'int:2',
          active: 'boolean',
          tags: ['text'],
          nested: { email: 'email' },
          array: { __type: 'array', __range: '2', __property: { id: 'uuid' } },
        },
        {},
        {}
      );

      assert.strictEqual(typeof result.name, 'string');
      assert.ok(result.age >= 10 && result.age <= 99);
      assert.strictEqual(typeof result.active, 'boolean');
      assert.ok(Array.isArray(result.tags));
      assert.strictEqual(typeof result.nested.email, 'string');
      assert.ok(Array.isArray(result.array));
      assert.strictEqual(result.array.length, 2);
    });

    it('skips keys whose value is the __auth sentinel', () => {
      const result = process({ auth: '__auth', name: 'text' }, {}, {});
      assert.strictEqual(result.auth, undefined);
      assert.strictEqual(typeof result.name, 'string');
    });

    it('generates the documented schema shape (README)', () => {
      const schema = {
        'key-01': 'title',
        'key-02': ['text'],
        'key-03': 'fixed value',
        'key-04': 'option-1|option-2|option-3',
        'key-05': {
          'child-01': 'email',
          'child-02': {
            'nested-01': 'boolean',
          },
        },
        'key-06': {
          '__type': 'uuid',
        },
        'key-07': {
          '__type': 'array',
          '__range': '3',
          '__property': 'int:2',
        },
        'key-08': {
          '__type': 'array',
          '__range': '2,4',
          '__property': {
            'array-property-01': 'title',
          },
        },
        'key-09': {
          '__type': 'token',
          '__property': {
            'token-key-01': 'text',
          },
        },
      };

      const result = process({ __output: schema }, {}, { secret: 'test-secret' });

      const output = result.__output;
      assert.strictEqual(typeof output['key-01'], 'string');
      assert.ok(Array.isArray(output['key-02']));
      assert.strictEqual(output['key-03'], 'fixed value');
      assert.ok(['option-1', 'option-2', 'option-3'].includes(output['key-04']));
      assert.strictEqual(typeof output['key-05']['child-01'], 'string');
      assert.strictEqual(typeof output['key-05']['child-02']['nested-01'], 'boolean');
      assert.match(String(output['key-06']), /^[0-9a-f-]{36}$/);
      assert.strictEqual(output['key-07'].length, 3);
      assert.ok(output['key-07'].every((n: any) => n >= 10 && n <= 99));
      assert.ok(output['key-08'].length >= 2 && output['key-08'].length <= 4);
      assert.strictEqual(typeof output['key-09'], 'string');
      assert.strictEqual(output['key-09'].split('.').length, 3);
    });
  });
});
