/**
 * Formats a benefit object into a readable string
 * Handles different benefit types with their specific properties
 */

interface Benefit {
  text: string;
  type?: string;
  quantity?: number;
  [key: string]: any;
}

export function formatBenefit(benefit: Benefit): string {
  // If benefit is already a simple string object, return it
  if (typeof benefit === 'string') {
    return benefit;
  }

  // If benefit.text doesn't contain field markers, return as-is
  if (!benefit.text || typeof benefit.text !== 'string') {
    return '';
  }

  const text = benefit.text;

  // Check if text contains object notation (e.g., "{text=...}")
  if (!text.includes('{') && !text.includes('=')) {
    return text;
  }

  // Parse the structured benefit text
  // Example: "{text=Name on digital Founders Wall, type=name_on_wall}"
  const benefitData: Record<string, string> = {};

  // Extract key=value pairs from the text
  const matches = text.matchAll(/(\w+)=([^,}]+)/g);
  for (const match of matches) {
    const [, key, value] = match;
    benefitData[key] = value.trim();
  }

  // If no structured data found, return original text
  if (Object.keys(benefitData).length === 0) {
    return text;
  }

  // Format based on type
  const displayText = benefitData.text || text;
  const quantity = benefitData.quantity || benefit.quantity;

  // Add quantity if present and greater than 1
  if (quantity && parseInt(quantity) > 1) {
    return `${displayText} (${quantity})`;
  }

  return displayText;
}

/**
 * Formats an array of benefits
 */
export function formatBenefits(benefits: Benefit[]): string[] {
  if (!Array.isArray(benefits)) {
    return [];
  }

  return benefits.map(formatBenefit).filter(Boolean);
}
