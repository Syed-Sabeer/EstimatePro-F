import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// Utility function to safely format area values that might be strings or numbers
export function formatArea(value, decimals = 1) {
	if (value === null || value === undefined || value === '') {
		return null;
	}
	
	const numValue = typeof value === 'string' ? parseFloat(value) : value;
	
	if (isNaN(numValue)) {
		return null;
	}
	
	return numValue.toFixed(decimals);
}

// Utility function to safely display area with unit
export function displayArea(value, unit = 'm²', decimals = 1) {
	const formatted = formatArea(value, decimals);
	return formatted ? `${formatted} ${unit}` : '-';
}