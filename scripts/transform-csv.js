const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const csvDir = path.join(__dirname, '../public/assets/csv');

// Define which columns should be editable and their edit types
const columnConfig = {
  // Broker table
  'ARN': { editable: false, type: 'text free text' },
  'Code': { editable: false, type: 'text free text' },
  'BRN_NAME': { editable: true, type: 'text free text' },
  'RMCODE': { editable: false, type: 'text free text' },
  'RMNAME ( Only for reference )': { editable: false, type: 'text free text' },
  'Start Date': { editable: true, type: 'date calendar' },
  'End Date': { editable: true, type: 'date calendar' },
  'Inactive': { editable: true, type: 'dropdown' },
  'REMARKS': { editable: true, type: 'text free text' },
  
  // Add configurations for other tables here...
};

function transformCsvFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse(fileContent, { header: true });
  
  if (result.data.length === 0) return;
  
  // Get headers from the first row
  const headers = Object.keys(result.data[0]);
  
  // Create editability row
  const editabilityRow = headers.map(header => 
    columnConfig[header]?.editable ? 'editable' : 'non-editable'
  );
  
  // Create edit type row
  const editTypeRow = headers.map(header => 
    columnConfig[header]?.type || 'text free text'
  );
  
  // Combine all rows
  const newData = [
    headers,
    editabilityRow,
    editTypeRow,
    ...result.data.map(row => headers.map(header => row[header]))
  ];
  
  // Convert back to CSV
  const newCsv = Papa.unparse(newData);
  
  // Write transformed file
  const transformedPath = path.join(
    path.dirname(filePath),
    'transformed_' + path.basename(filePath)
  );
  fs.writeFileSync(transformedPath, newCsv);
  
  console.log(`Transformed ${path.basename(filePath)} -> ${path.basename(transformedPath)}`);
}

// Transform all CSV files in the directory
fs.readdirSync(csvDir)
  .filter(file => file.endsWith('.csv'))
  .forEach(file => {
    transformCsvFile(path.join(csvDir, file));
  });
