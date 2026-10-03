import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  randomNumberGenerator,
  getMinMax,
  randomArrayData,
  domainList,
  emailDomainList,
  imageList,
  pdfFileList,
  csvFileList,
  docFileList,
  smallCharList,
  capitalCharList,
  alphanumericCharList,
  allowed_end_of_line,
  allowed_block_text,
} from '../src/lib/storageb/storage';

describe('storage', () => {
  describe('randomNumberGenerator', () => {
    it('returns a number within [min, max] when max is provided', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomNumberGenerator(10, 5);
        assert.ok(value >= 5 && value <= 10, `expected value in [5,10], got ${value}`);
      }
    });

    it('returns 0 or 1 when no arguments are given', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomNumberGenerator();
        assert.ok(value === 0 || value === 1, `expected 0 or 1, got ${value}`);
      }
    });

    it('returns min when max equals min', () => {
      assert.strictEqual(randomNumberGenerator(5, 5), 5);
    });
  });

  describe('getMinMax', () => {
    it('returns default range for an empty range', () => {
      assert.deepStrictEqual(getMinMax(''), { max: 10, min: 1 });
    });

    it('returns min 0 and the parsed max for a single number', () => {
      assert.deepStrictEqual(getMinMax('7'), { min: 0, max: 7 });
    });

    it('parses a comma-separated range', () => {
      assert.deepStrictEqual(getMinMax('10,15'), { max: 10, min: 15 });
    });
  });

  describe('randomArrayData', () => {
    it('always returns an element of the given array', () => {
      const list = ['a', 'b', 'c'];
      for (let i = 0; i < 50; i++) {
        assert.ok(list.includes(randomArrayData(list)));
      }
    });

    it('returns undefined for an empty array', () => {
      assert.strictEqual(randomArrayData([]), undefined);
    });
  });

  describe('data lists', () => {
    it('domainList contains known TLDs', () => {
      assert.ok(domainList.includes('com'));
      assert.ok(domainList.includes('org'));
      assert.ok(domainList.length > 0);
    });

    it('emailDomainList contains known domains', () => {
      assert.ok(emailDomainList.includes('gmail.com'));
      assert.ok(emailDomainList.length > 0);
    });

    it('imageList contains image paths', () => {
      assert.ok(imageList.length > 0);
      imageList.forEach((path) => assert.match(path, /^images\/image\d+\.png$/));
    });

    it('file lists have the expected extensions', () => {
      pdfFileList.forEach((p) => assert.match(p, /\.pdf$/));
      csvFileList.forEach((p) => assert.match(p, /\.csv$/));
      docFileList.forEach((p) => assert.match(p, /\.docx$/));
    });

    it('smallCharList contains 26 lowercase letters', () => {
      assert.strictEqual(smallCharList.length, 26);
      assert.ok(smallCharList.every((c) => /^[a-z]$/.test(c)));
    });

    it('capitalCharList contains 26 uppercase letters', () => {
      assert.strictEqual(capitalCharList.length, 26);
      assert.ok(capitalCharList.every((c) => /^[A-Z]$/.test(c)));
    });

    it('alphanumericCharList mixes lowercase, uppercase and digits', () => {
      assert.ok(alphanumericCharList.includes('a'));
      assert.ok(alphanumericCharList.includes('Z'));
      assert.ok(alphanumericCharList.includes(9));
    });

    it('allowed_end_of_line contains punctuation', () => {
      assert.ok(allowed_end_of_line.includes('.'));
      assert.ok(allowed_end_of_line.includes('!'));
      assert.ok(allowed_end_of_line.includes(','));
    });
  });

  describe('allowed_block_text', () => {
    it('wraps the text in quotes or parentheses', () => {
      for (let i = 0; i < 30; i++) {
        const result = allowed_block_text('hello');
        assert.ok(
          ["'hello'", '"hello"', '(hello)'].includes(result),
          `unexpected result: ${result}`
        );
      }
    });
  });
});
