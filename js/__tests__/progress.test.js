const { saveProgress, getModuleProgress } = require('../main.js');

describe('progress tracking helpers', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('saveProgress records completed units per module', () => {
        saveProgress('1', '1.1');
        expect(getModuleProgress('1')).toBe(1);

        const stored = JSON.parse(localStorage.getItem('progress'));
        expect(stored).toEqual({ '1': { '1.1': true } });
    });

    test('saveProgress deduplicates units and keeps other modules separate', () => {
        saveProgress('1', '1.1');
        saveProgress('1', '1.1'); // duplicate
        saveProgress('1', '1.2');
        saveProgress('2', '2.1');

        expect(getModuleProgress('1')).toBe(2);
        expect(getModuleProgress('2')).toBe(1);
    });

    test('getModuleProgress tolerates malformed data', () => {
        localStorage.setItem('progress', 'not-json');
        expect(getModuleProgress('1')).toBe(0);
    });
});

