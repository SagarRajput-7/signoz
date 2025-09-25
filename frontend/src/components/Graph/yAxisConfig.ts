import { formattedValueToString, getValueFormat } from '@grafana/data';

/**
 * Utility functions for number formatting
 */

/**
 * Converts a number to decimal string, handling very small or large numbers
 */
const toDecimalString = (num: number): string => {
	if (num === 0) return '0';

	const abs = Math.abs(num);
	if (abs < 1e-6 || abs > 1e21) {
		// Convert to full decimal string manually for extreme values
		const [mantissa, expStr] = num.toExponential().split('e');
		const exp = parseInt(expStr, 10);
		let digits = mantissa.replace('.', '');

		if (exp < 0) {
			return `${num < 0 ? '-' : ''}0.${'0'.repeat(-exp - 1)}${digits}`;
		}

		if (digits.length <= exp + 1) {
			digits += '0'.repeat(exp + 1 - digits.length);
		}

		return (
			(num < 0 ? '-' : '') +
			digits.slice(0, exp + 1) +
			(digits.length > exp + 1 ? `.${digits.slice(exp + 1)}` : '')
		);
	}

	return num.toString();
};

/**
 * Trims a number string to 3 significant decimal digits
 */
const trimToThreeSignificantDecimals = (numStr: string): string => {
	if (!numStr.includes('.')) return numStr;

	const [intPart, decPart] = numStr.split('.');

	let started = false;
	let count = 0;

	const trimmedDec = decPart
		.split('')
		.filter((digit) => {
			if (!started && digit !== '0') started = true;
			if (!started) return true; // Keep leading zeros
			if (count < 3) {
				count++;
				return true;
			}
			return false;
		})
		.join('')
		.replace(/0+$/, ''); // Remove trailing zeros after 3 significant digits

	return trimmedDec ? `${intPart}.${trimmedDec}` : intPart;
};

/**
 * Formats a number with custom decimal precision
 */
const formatWithCustomDecimals = (
	numValue: number,
	maxDecimals = 3,
): string => {
	const isNegative = numValue < 0;

	// Convert number to string without scientific notation
	const absStr = Math.abs(numValue).toLocaleString('fullwide', {
		useGrouping: false,
		maximumFractionDigits: 20,
	});

	const [intPart, decPart = ''] = absStr.split('.');

	if (!decPart) return isNegative ? `-${intPart}` : intPart;

	// Find index of first non-zero in decimal
	const firstNonZero = decPart.search(/[^0]/);
	if (firstNonZero === -1) return isNegative ? `-${intPart}` : intPart;

	// Calculate number of decimals to keep
	const decimalsToKeep = Math.min(firstNonZero + maxDecimals, decPart.length);

	// Slice and remove trailing zeros
	const formattedDec = decPart.slice(0, decimalsToKeep).replace(/0+$/, '');

	return formattedDec
		? isNegative
			? `-${intPart}.${formattedDec}`
			: `${intPart}.${formattedDec}`
		: isNegative
		? `-${intPart}`
		: intPart;
};

/**
 * Gets formatted value from string or number input
 */
const getFormattedValue = (value: number | string): string => {
	const numericValue = typeof value === 'string' ? parseFloat(value) : value;
	const decimalStr = toDecimalString(numericValue);
	return trimToThreeSignificantDecimals(decimalStr);
};

/**
 * Main Y-axis formatting function
 */
export const getYAxisFormattedValue = (
	value: string,
	format: string,
): string => {
	try {
		const adjustedValue = getFormattedValue(value);
		const numValue = parseFloat(adjustedValue);

		// Handle special values
		if (!isFinite(numValue)) {
			if (numValue === Infinity) return '∞';
			if (numValue === -Infinity) return '-∞';
			return 'NaN';
		}

		const formatter = getValueFormat(format);

		// Count decimal places
		const decimalPlaces = adjustedValue.split('.')[1]?.length || undefined;

		// For 'none' format, apply custom decimal logic
		if (format === 'none') {
			if (numValue === 0) {
				return '0';
			}
			return formatWithCustomDecimals(numValue, decimalPlaces);
		}

		const formattedValue = formatter(numValue, decimalPlaces || 3, undefined, undefined);

		// Remove unnecessary trailing zeros by parsing and converting back
		const cleanText = parseFloat(formattedValue.text).toString();

		return formattedValueToString({
			...formattedValue,
			text: cleanText,
		});
	} catch (error) {
		console.error('Error formatting Y-axis value:', error);
		return `${parseFloat(value) || 0}`;
	}
};

export const getToolTipValue = (value: string, format?: string): string => {
	try {
		return formattedValueToString(
			getValueFormat(format)(parseFloat(value), undefined, undefined, undefined),
		);
	} catch (error) {
		console.error(error);
	}
	return `${value}`;
};
