// CSV utility functions for parsing and generation
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return { data: [], errors: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const errors = [];
  const data = [];

  // Define expected headers and their mapping
  const headerMapping = {
    'First Name': 'firstName',
    'firstName': 'firstName',
    'first_name': 'firstName',
    'Last Name': 'lastName',
    'lastName': 'lastName',
    'last_name': 'lastName',
    'Email': 'email',
    'email': 'email',
    'Class ID': 'classId',
    'classId': 'classId',
    'class_id': 'classId',
    'Class': 'classId',
    'Enrollment Date': 'enrollmentDate',
    'enrollmentDate': 'enrollmentDate',
    'enrollment_date': 'enrollmentDate',
    'Status': 'status',
    'status': 'status'
  };

  // Map headers to expected field names
  const fieldMapping = {};
  headers.forEach((header, index) => {
    const mappedField = headerMapping[header];
    if (mappedField) {
      fieldMapping[index] = mappedField;
    }
  });

  // Validate required fields are present
  const requiredFields = ['firstName', 'lastName', 'email', 'classId'];
  const mappedFields = Object.values(fieldMapping);
  const missingFields = requiredFields.filter(field => !mappedFields.includes(field));
  
  if (missingFields.length > 0) {
    errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    return { data: [], errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    let hasValidData = false;

    // Map values to fields
    Object.entries(fieldMapping).forEach(([index, field]) => {
      const value = values[parseInt(index)] || '';
      if (value) hasValidData = true;
      row[field] = value;
    });

    // Skip empty rows
    if (!hasValidData) continue;

    // Validate required fields
    const rowErrors = [];
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        rowErrors.push(`Row ${i + 1}: Missing ${field}`);
      }
    });

    // Validate email format
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      rowErrors.push(`Row ${i + 1}: Invalid email format`);
    }

    // Set defaults
    if (!row.enrollmentDate) {
      row.enrollmentDate = new Date().toISOString().split('T')[0];
    }
    if (!row.status) {
      row.status = 'active';
    }

    if (rowErrors.length === 0) {
      data.push(row);
    } else {
      errors.push(...rowErrors);
    }
  }

  return { data, errors };
}

export function generateCSV(students) {
  if (!students || students.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = ['First Name', 'Last Name', 'Email', 'Class ID', 'Enrollment Date', 'Status'];
  
  // Create CSV content
  const csvRows = [headers.join(',')];
  
  students.forEach(student => {
    const row = [
      `"${student.firstName || ''}"`,
      `"${student.lastName || ''}"`,
      `"${student.email || ''}"`,
      `"${student.classId || ''}"`,
      `"${student.enrollmentDate || ''}"`,
      `"${student.status || 'active'}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

export function downloadCSV(csvContent, filename = 'students.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}