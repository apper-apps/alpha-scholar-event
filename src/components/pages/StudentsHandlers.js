import { toast } from 'react-toastify';
import { studentService } from '@/services/api/studentService';
import { generateCSV, downloadCSV } from '@/utils/csvUtils';

// Export handler for Students component
export const handleExport = async () => {
  try {
    const students = await studentService.exportToCSV();
    const csvContent = generateCSV(students);
    
    if (csvContent) {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csvContent, `students-${timestamp}.csv`);
      toast.success(`Exported ${students.length} students successfully`);
    } else {
      toast.info('No student data to export');
    }
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export student data');
  }
};

// Import handler for Students component
export const handleImport = async (csvData, loadData) => {
  try {
    const result = await studentService.importFromCSV(csvData);
    
    // Reload the data to show imported students
    await loadData();
    
    // Show success message with details
    if (result.skipped > 0) {
      toast.success(
        `Imported ${result.imported} students successfully. ${result.skipped} duplicates were skipped.`
      );
    } else {
      toast.success(`Imported ${result.imported} students successfully`);
    }
    
    return result;
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('Failed to import students');
  }
};