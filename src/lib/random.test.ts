import { describe, it, expect } from 'vitest';
import { randomString } from './random';

describe('generateRandomString', () => {
    it('should generate a string of the specified length', () => {
        const result = randomString(16);
        expect(result).toHaveLength(16);
    });

    it('should include only valid characters', () => {
        const result = randomString(1000);
        for (const char of result) {
            expect('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-<>[]').toContain(char);
        }
    });

    it('should generate different strings each time', () => {
        const string1 = randomString(16);
        const string2 = randomString(16);
        expect(string1).not.toBe(string2);
    });
});
