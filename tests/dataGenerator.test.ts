import { describe, it } from 'node:test';
import assert from 'node:assert';
import dataGenerator, { getRandomName } from '../src/lib/dataGeneratorGenerator';

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

  describe('word / text / default', () => {
    it('returns a lowercase word', () => {
      for (let i = 0; i < 20; i++) {
        assert.match(generator.word(), /^[a-z]+$/);
        assert.match(generator.text(), /^[a-z]+$/);
        assert.match(generator.default(), /^[a-z]+$/);
      }
    });
  });

  describe('title', () => {
    it('returns at least two words by default', () => {
      for (let i = 0; i < 10; i++) {
        const value = generator.title();
        assert.ok(value.split(' ').length >= 2);
      }
    });

    it('honors a fixed word count range', () => {
      const value = generator.title('5');
      assert.strictEqual(value.split(' ').length, 6);
    });
  });

  describe('desc / textarea', () => {
    it('returns a non-empty string', () => {
      for (let i = 0; i < 10; i++) {
        const value = generator.textarea();
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
    it('returns MM/DD/YYYY', () => {
      assert.match(generator.date(), /^\d{1,2}\/\d{1,2}\/\d{4}$/);
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
