import { formattedValueToString, getValueFormat } from '@grafana/data';

// Convert a number to a plain decimal string without scientific notation
function toDecimalString(num: number): string {
	if (Object.is(num, -0)) return '0';
	if (Number.isNaN(num)) return 'NaN';
	if (num === 0) return '0';
	const abs = Math.abs(num);
	if (abs < 1e-6 || abs > 1e21) {
		const [mantissa, expStr] = num.toExponential().split('e');
		const exp = parseInt(expStr, 10);
		let digits = mantissa.replace('.', '');
		const sign = num < 0 ? '-' : '';
		if (exp < 0) {
			return `${sign}0.${'0'.repeat(-exp - 1)}${digits}`;
		}
		if (digits.length <= exp + 1) digits += '0'.repeat(exp + 1 - digits.length);
		return (
			sign +
			digits.slice(0, exp + 1) +
			(digits.length > exp + 1 ? `.${digits.slice(exp + 1)}` : '')
		);
	}
	return num.toString();
}

// Keep up to three significant digits in the decimal part, preserving leading zeros
function trimToThreeSignificantDecimals(numStr: string): string {
	if (!numStr.includes('.')) return numStr;
	const [intPart, decPart] = numStr.split('.');

	let started = false;
	let count = 0;

	const trimmedDec = decPart
		.split('')
		.filter((digit) => {
			if (!started && digit !== '0') started = true;
			if (!started) return true; // keep leading zeros
			if (count < 3) {
				count += 1;
				return true;
			}
			return false;
		})
		.join('')
		.replace(/0+$/, '');

	return trimmedDec ? `${intPart}.${trimmedDec}` : intPart;
}

function getFormattedValue(value: number): string {
	const decimalStr = toDecimalString(value);
	return trimToThreeSignificantDecimals(decimalStr);
}

function pluralizeTimeUnits(output: string): string {
	const match = output.match(/^(-?\d+(?:\.\d+)?)[ ](min|hour)$/);
	if (!match) return output;
	const [, numericStr, unit] = match;
	const numericVal = Number.parseFloat(numericStr);
	if (unit === 'min') {
		if (!Number.isInteger(numericVal)) return `${numericStr} mins`;
		return output;
	}
	if (unit === 'hour') {
		if (numericVal !== 1) return `${numericStr} hours`;
		return output;
	}
	return output;
}

export const getYAxisFormattedValue = (
	value: string,
	format: string,
): string => {
	try {
		const numericValue = parseFloat(value);

		// Invalid numbers and ±Infinity should render as 'NaN'
		if (!Number.isFinite(numericValue)) {
			return 'NaN';
		}

		// For custom 'none' format, apply our decimal logic directly
		if (format === 'none') {
			if (numericValue === 0 || Object.is(numericValue, -0)) return '0';
			return getFormattedValue(numericValue);
		}

		// For all other units, use Grafana's formatter and clean trailing zeros
		const adjustedValue = getFormattedValue(numericValue);
		const decimalPlaces = adjustedValue.split('.')[1]?.length;
		const formatter = getValueFormat(format);
		const formattedValue = formatter(
			numericValue,
			decimalPlaces === undefined ? 3 : decimalPlaces,
			undefined,
			undefined,
		);
		const cleanText = Number.parseFloat(formattedValue.text).toString();
		const result = formattedValueToString({ ...formattedValue, text: cleanText });
		return pluralizeTimeUnits(result);
	} catch (_) {
		// Fall back to a best-effort numeric string
		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) ? parsed.toString() : 'NaN';
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
