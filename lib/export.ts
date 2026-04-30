export function convertToCSV(data: any[]) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      let val = obj[header];
      if (val instanceof Date) val = val.toISOString();
      if (typeof val === 'string') val = val.replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
