/**
 * Parse CSV file and extract chemical combinations
 * Expected format: Column 1 = Chemical 1, Column 2 = Chemical 2, etc.
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must contain header and at least one row');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (handles basic comma-separated, quoted values)
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^"|"$/g, ''));

    const chemicals = cells.filter(c => c.length > 0);
    if (chemicals.length < 2) {
      throw new Error(`Row ${i + 1} must contain at least 2 chemicals`);
    }
    rows.push({ id: i, chemicals, name: `Combination ${i}` });
  }

  if (rows.length === 0) throw new Error('No valid rows found in CSV');
  return rows;
}

/**
 * Export results to CSV
 */
export function exportResultsToCSV(results, filename = 'batch_simulation_results.csv') {
  const headers = [
    'Combination',
    'Chemicals',
    'Risk Score',
    'Health Impact',
    'Environmental Impact',
    'VOC Level',
    'Reactivity',
    'Hazard Symbols',
    'Status'
  ];

  const rows = results.map(r => [
    r.name,
    r.chemicals.join(' + '),
    r.risk_score ?? '-',
    r.health_impact ?? '-',
    r.environmental_impact ?? '-',
    r.voc_level ?? '-',
    r.reactivity ?? '-',
    r.hazard_symbols?.join('; ') || '-',
    r.error ? 'Error' : 'Complete'
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}