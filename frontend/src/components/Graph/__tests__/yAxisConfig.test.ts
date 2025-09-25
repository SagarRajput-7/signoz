import { getYAxisFormattedValue } from '../yAxisConfig';

describe('getYAxisFormattedValue', () => {
	describe('none format', () => {
		test('should format integers correctly', () => {
			expect(getYAxisFormattedValue('250034', 'none')).toBe('250034');
			expect(getYAxisFormattedValue('250034897', 'none')).toBe('250034897');
			expect(getYAxisFormattedValue('1000', 'none')).toBe('1000');
		});

		test('should format decimals with appropriate precision', () => {
			expect(getYAxisFormattedValue('250034897.02354', 'none')).toBe('250034897.0235');
			expect(getYAxisFormattedValue('9999999.9999', 'none')).toBe('9999999.999');
			expect(getYAxisFormattedValue('1.0000234', 'none')).toBe('1.0000234');
			expect(getYAxisFormattedValue('0.00003', 'none')).toBe('0.00003');
			expect(getYAxisFormattedValue('0.000000250034', 'none')).toBe('0.00000025');
			expect(getYAxisFormattedValue('0.00000025', 'none')).toBe('0.00000025');
			expect(getYAxisFormattedValue('0.0001', 'none')).toBe('0.0001');
			expect(getYAxisFormattedValue('-0.0001', 'none')).toBe('-0.0001');
			expect(getYAxisFormattedValue('0.000000001', 'none')).toBe('0.000000001');
		});

		test('should handle very small numbers', () => {
			expect(getYAxisFormattedValue('1.0000000000000001', 'none')).toBe('1');
			expect(getYAxisFormattedValue('0.1', 'none')).toBe('0.1');
			expect(getYAxisFormattedValue('0.2', 'none')).toBe('0.2');
			expect(getYAxisFormattedValue('0.3', 'none')).toBe('0.3');
			expect(getYAxisFormattedValue('1.0000000001', 'none')).toBe('1.0000000001');
		});

		test('should format numbers with trailing zeros correctly', () => {
			expect(getYAxisFormattedValue('1000.000', 'none')).toBe('1000');
			expect(getYAxisFormattedValue('99.500', 'none')).toBe('99.5');
			expect(getYAxisFormattedValue('1.000', 'none')).toBe('1');
		});

		test('should handle significant decimals correctly', () => {
			expect(getYAxisFormattedValue('99.5458', 'none')).toBe('99.545');
			expect(getYAxisFormattedValue('1.234567', 'none')).toBe('1.234');
			expect(getYAxisFormattedValue('99.998', 'none')).toBe('99.998');
		});
	});

	describe('time formats', () => {
		test('should format milliseconds', () => {
			expect(getYAxisFormattedValue('1500', 'ms')).toBe('1.5 s');
			expect(getYAxisFormattedValue('500', 'ms')).toBe('500 ms');
			expect(getYAxisFormattedValue('60000', 'ms')).toBe('1 min');
		});

		test('should format seconds', () => {
			expect(getYAxisFormattedValue('90', 's')).toBe('1.5 mins');
			expect(getYAxisFormattedValue('30', 's')).toBe('30 s');
			expect(getYAxisFormattedValue('3600', 's')).toBe('1 hour');
		});

		test('should format minutes', () => {
			expect(getYAxisFormattedValue('90', 'm')).toBe('1.5 hours');
			expect(getYAxisFormattedValue('30', 'm')).toBe('30 min');
			expect(getYAxisFormattedValue('1440', 'm')).toBe('1 day');
		});
	});

	describe('data size formats', () => {
		test('should format bytes', () => {
			expect(getYAxisFormattedValue('1024', 'bytes')).toBe('1 KiB');
			expect(getYAxisFormattedValue('512', 'bytes')).toBe('512 B');
			expect(getYAxisFormattedValue('1536', 'bytes')).toBe('1.5 KiB');
		});

		test('should format megabytes', () => {
			expect(getYAxisFormattedValue('1024', 'mbytes')).toBe('1 GiB');
			expect(getYAxisFormattedValue('512', 'mbytes')).toBe('512 MiB');
			expect(getYAxisFormattedValue('1536', 'mbytes')).toBe('1.5 GiB');
		});

		test('should format kilobytes', () => {
			expect(getYAxisFormattedValue('1024', 'kbytes')).toBe('1 MiB');
			expect(getYAxisFormattedValue('512', 'kbytes')).toBe('512 KiB');
			expect(getYAxisFormattedValue('1536', 'kbytes')).toBe('1.5 MiB');
		});
	});

	describe('short scale formats', () => {
		test('should format thousands', () => {
			expect(getYAxisFormattedValue('1000', 'short')).toBe('1 K');
			expect(getYAxisFormattedValue('1500', 'short')).toBe('1.5 K');
			expect(getYAxisFormattedValue('999', 'short')).toBe('999');
		});

		test('should format millions', () => {
			expect(getYAxisFormattedValue('1000000', 'short')).toBe('1 Mil');
			expect(getYAxisFormattedValue('1555600', 'short')).toBe('1.556 Mil');
			expect(getYAxisFormattedValue('999999', 'short')).toBe('999.999 K');
		});

		test('should format billions', () => {
			expect(getYAxisFormattedValue('1000000000', 'short')).toBe('1 Bil');
			expect(getYAxisFormattedValue('1500000000', 'short')).toBe('1.5 Bil');
			expect(getYAxisFormattedValue('999999999', 'short')).toBe('1000 Mil');
		});
	});

	describe('percentage and ratio formats', () => {
		test('should format percentages', () => {
			expect(getYAxisFormattedValue('0.15', 'percent')).toBe('0.15%');
			expect(getYAxisFormattedValue('0.1234', 'percent')).toBe('0.123%');
			expect(getYAxisFormattedValue('1.5', 'percent')).toBe('1.5%');
			expect(getYAxisFormattedValue('0.0001', 'percent')).toBe('0.0001%');
			expect(getYAxisFormattedValue('0.000000001', 'percent')).toBe('1e-9%');
			expect(getYAxisFormattedValue('0.000000250034', 'percent')).toBe('2.5e-7%');
			expect(getYAxisFormattedValue('0.00000025', 'percent')).toBe('2.5e-7%');
			expect(getYAxisFormattedValue('1.0000000000000001', 'percent')).toBe('1%');
		});

		test('should format ratios', () => {
			expect(getYAxisFormattedValue('0.5', 'ratio')).toBe('0.5 ratio');
			expect(getYAxisFormattedValue('1.25', 'ratio')).toBe('1.25 ratio');
			expect(getYAxisFormattedValue('2.0', 'ratio')).toBe('2 ratio');
		});
	});

	describe('temperature formats', () => {
		test('should format celsius', () => {
			expect(getYAxisFormattedValue('25', 'celsius')).toBe('25 °C');
			expect(getYAxisFormattedValue('0', 'celsius')).toBe('0 °C');
			expect(getYAxisFormattedValue('-10', 'celsius')).toBe('-10 °C');
		});

		test('should format fahrenheit', () => {
			expect(getYAxisFormattedValue('77', 'fahrenheit')).toBe('77 °F');
			expect(getYAxisFormattedValue('32', 'fahrenheit')).toBe('32 °F');
			expect(getYAxisFormattedValue('14', 'fahrenheit')).toBe('14 °F');
		});
	});

	describe('edge cases', () => {
		test('should handle zero values', () => {
			expect(getYAxisFormattedValue('0', 'none')).toBe('0');
			expect(getYAxisFormattedValue('-0', 'none')).toBe('0');
		});

		test('should handle special values', () => {
			expect(getYAxisFormattedValue('Infinity', 'none')).toBe('NaN');
			expect(getYAxisFormattedValue('-Infinity', 'none')).toBe('NaN');
		});

		test('should handle invalid inputs', () => {
			expect(getYAxisFormattedValue('invalid', 'none')).toBe('NaN');
			expect(getYAxisFormattedValue('', 'none')).toBe('NaN');
			expect(getYAxisFormattedValue('abc123', 'none')).toBe('NaN');
		});
	});
});