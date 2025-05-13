import xlsx from 'xlsx';

export const parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];  // Assume data is on the first sheet
  
  // Convert the sheet into JSON
  const data = xlsx.utils.sheet_to_json(sheet);

  // Check if data is valid and return it, else log and throw an error
  if (!Array.isArray(data)) {
    throw new Error('Failed to parse Excel data. Invalid format.');
  }

  return data;
};
