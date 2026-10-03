import { describe, it } from 'node:test';
import assert from 'node:assert';
import dataGenerator, { getRandomName } from '../src/lib/dataGenerator';

const generator = dataGenerator as any;

describe('dataGenerator', () => {
  describe('getRandomName', () => {
    it('returns a lowercase string with length between 3 and max', () => {
      for (let i = 0; i < 20; i++) {
        const value = getRandomName(9);
        assert.match(value, /^[a-z]{3,9}$/);
      }
    });
  });

  describe('word / default', () => {
    it('returns a lowercase word', () => {
      for (let i = 0; i < 20; i++) {
        assert.match(generator.word(), /^[a-z]+$/);
        assert.match(generator.default(), /^[a-z]+$/);
      }
    });
  });

  describe('desc', () => {
    it('returns a non-empty string', () => {
      for (let i = 0; i < 10; i++) {
        const value = generator.desc();
        assert.strictEqual(typeof value, 'string');
        assert.ok(value.length > 0);
      }
    });
  });

  describe('boolean', () => {
    it('returns a boolean', () => {
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(typeof generator.boolean(), 'boolean');
      }
    });
  });

  describe('int / integer', () => {
    it('returns a number with the requested digit count', () => {
      for (let i = 0; i < 20; i++) {
        const value = generator.int('3');
        assert.ok(value >= 100 && value <= 999);
      }
    });

    it('supports min,max ranges', () => {
      for (let i = 0; i < 20; i++) {
        const value = generator.int('5,8');
        assert.ok(value >= 5 && value <= 8);
      }
    });

    it('integer alias behaves like int', () => {
      const value = generator.integer('2');
      assert.ok(value >= 10 && value <= 99);
    });

    it('defaults to a 3-digit integer without a parameter', () => {
      for (let i = 0; i < 20; i++) {
        const value = generator.integer();
        assert.ok(Number.isInteger(value));
        assert.ok(value >= 100 && value <= 999);
      }
    });
  });

  describe('float', () => {
    it('returns a finite number with decimals', () => {
      for (let i = 0; i < 20; i++) {
        const value = generator.float('3.2');
        assert.strictEqual(typeof value, 'number');
        assert.ok(Number.isFinite(value));
        assert.ok(value % 1 !== 0, `expected decimals, got ${value}`);
      }
    });

    it('defaults to a finite decimal without a parameter', () => {
      for (let i = 0; i < 20; i++) {
        const value = generator.float();
        assert.strictEqual(typeof value, 'number');
        assert.ok(Number.isFinite(value), `expected a finite number, got ${value}`);
      }
    });
  });

  describe('uuid / id', () => {
    it('returns a valid uuid v4', () => {
      assert.match(
        generator.uuid(),
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('id alias returns a uuid shape', () => {
      assert.match(generator.id(), /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('phone', () => {
    it('returns a XXX-XXX-XXXX phone number', () => {
      assert.match(generator.phone(), /^\d{3}-\d{3}-\d{4}$/);
    });
  });

  describe('zipCode / zipcode', () => {
    it('returns a 5-digit zip', () => {
      assert.match(generator.zipCode(), /^\d{5}$/);
      assert.match(generator.zipcode(), /^\d{5}$/);
    });
  });

  describe('domain / url', () => {
    it('returns an https url', () => {
      assert.match(generator.domain(), /^https:\/\//);
      assert.match(generator.url(), /^https:\/\//);
    });
  });

  describe('email', () => {
    it('returns an email shape', () => {
      assert.match(generator.email(), /^[a-z]+@[a-z.]+$/);
    });
  });

  describe('date', () => {
    it('returns DD/MM/YYYY for today by default', () => {
      assert.match(generator.date(), /^\d{2}\/\d{2}\/\d{4}$/);
      const today = new Date();
      const value = generator.date().split('/');
      assert.strictEqual(value[0], `${today.getDate()}`.padStart(2, '0'));
      assert.strictEqual(value[1], `${today.getMonth() + 1}`.padStart(2, '0'));
      assert.strictEqual(value[2], `${today.getFullYear()}`);
    });

    it('returns a future date for a positive offset', () => {
      const value = generator.date('5');
      assert.match(value, /^\d{2}\/\d{2}\/\d{4}$/);
      const expected = new Date();
      expected.setDate(expected.getDate() + 5);
      assert.strictEqual(value, [
        `${expected.getDate()}`.padStart(2, '0'),
        `${expected.getMonth() + 1}`.padStart(2, '0'),
        `${expected.getFullYear()}`
      ].join('/'));
    });

    it('returns a past date for a negative offset', () => {
      const value = generator.date('-3');
      const expected = new Date();
      expected.setDate(expected.getDate() - 3);
      assert.strictEqual(value, [
        `${expected.getDate()}`.padStart(2, '0'),
        `${expected.getMonth() + 1}`.padStart(2, '0'),
        `${expected.getFullYear()}`
      ].join('/'));
    });

    it('honors a custom format with offset', () => {
      const value = generator.date('YYYY-MM-DD|2');
      const expected = new Date();
      expected.setDate(expected.getDate() + 2);
      assert.strictEqual(value, [
        `${expected.getFullYear()}`,
        `${expected.getMonth() + 1}`.padStart(2, '0'),
        `${expected.getDate()}`.padStart(2, '0')
      ].join('-'));
    });

    it('honors a custom format without offset', () => {
      const today = new Date();
      const value = generator.date('MM/DD/YYYY');
      assert.strictEqual(value, [
        `${today.getMonth() + 1}`.padStart(2, '0'),
        `${today.getDate()}`.padStart(2, '0'),
        `${today.getFullYear()}`
      ].join('/'));
    });
  });

  describe('time', () => {
    it('returns H:MM AM/PM', () => {
      assert.match(generator.time(), /^\d{1,2}:\d{1,2} (AM|PM)$/);
    });
  });

  describe('dateTime / date-time', () => {
    it('returns a parseable ISO string', () => {
      assert.ok(!Number.isNaN(Date.parse(generator.dateTime())));
      assert.ok(!Number.isNaN(Date.parse(generator['date-time']())));
    });

    it('returns today for zero', () => {
      const value = new Date(generator.dateTime('0'));
      const today = new Date();
      assert.strictEqual(value.getDate(), today.getDate());
      assert.strictEqual(value.getMonth(), today.getMonth());
      assert.strictEqual(value.getFullYear(), today.getFullYear());
    });

    it('returns a future date for a positive offset', () => {
      const value = new Date(generator.dateTime('5'));
      const expected = new Date();
      expected.setDate(expected.getDate() + 5);
      assert.strictEqual(value.getDate(), expected.getDate());
      assert.strictEqual(value.getMonth(), expected.getMonth());
      assert.strictEqual(value.getFullYear(), expected.getFullYear());
    });

    it('returns a past date for a negative offset', () => {
      const value = new Date(generator.dateTime('-2'));
      const expected = new Date();
      expected.setDate(expected.getDate() - 2);
      assert.strictEqual(value.getDate(), expected.getDate());
      assert.strictEqual(value.getMonth(), expected.getMonth());
      assert.strictEqual(value.getFullYear(), expected.getFullYear());
    });
  });

  describe('second', () => {
    it('returns a numeric timestamp', () => {
      const value = generator.second();
      assert.strictEqual(typeof value, 'number');
      assert.ok(Number.isFinite(value));
    });
  });

  describe('image / pdf / csv / doc', () => {
    it('returns local asset urls', () => {
      assert.match(generator.image(), /^http:\/\/localhost:\d+\/assets\/images\/image\d+\.png$/);
      assert.match(generator.pdf(), /^http:\/\/localhost:\d+\/assets\/files\/pdf-file1\.pdf$/);
      assert.match(generator.csv(), /^http:\/\/localhost:\d+\/assets\/files\/csv-file1\.csv$/);
      assert.match(generator.doc(), /^http:\/\/localhost:\d+\/assets\/files\/doc-file1\.docx$/);
    });
  });

  describe('ip / ipaddress', () => {
    it('returns an ipv4 shape', () => {
      assert.match(generator.ip(), /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
      assert.match(generator.ipaddress(), /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });
  });

  describe('alphanumeric', () => {
    it('returns 25 alphanumeric characters by default', () => {
      const value = generator.alphanumeric('', {}, {});
      assert.match(value, /^[a-zA-Z0-9]{25}$/);
    });
  });

  describe('token', () => {
    it('throws when the payload is empty', () => {
      assert.throws(() => generator.token('', {}, {}), /Payload is required/);
    });

    it('returns a signed jwt with 3 parts', () => {
      const value = generator.token('', { user: 'john', role: 'admin' }, { secret: 'test-secret' });
      assert.strictEqual(typeof value, 'string');
      assert.strictEqual(value.split('.').length, 3);
    });
  });
});
