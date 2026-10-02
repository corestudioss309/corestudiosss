/**
 * CSV Export Utility - A secure alternative to xlsx for data export
 * This utility provides basic CSV export functionality without the security vulnerabilities
 * present in the xlsx package (Prototype Pollution, ReDoS).
 */

type ExportData = Record<string, string | number | boolean | null | undefined>;

/**
 * Escapes a value for safe CSV output
 * Handles special characters: commas, quotes, newlines
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if escaping is needed
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    // Escape double quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts an array of objects to a CSV string
 */
export function convertToCSV(data: ExportData[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(',');

  // Convert data rows
  const dataRows = data.map((row) =>
    headers.map((header) => escapeCSVValue(row[header])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Downloads a CSV file with the given data
 */
export function downloadCSV(data: ExportData[], filename: string): void {
  const csvContent = convertToCSV(data);
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
