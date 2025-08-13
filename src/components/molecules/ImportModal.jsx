import { useState } from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import FileUpload from '@/components/molecules/FileUpload';
import { parseCSV } from '@/utils/csvUtils';
import { toast } from 'react-toastify';

export default function ImportModal({ show, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: processing

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setParsedData(null);
    setErrors([]);
    
    if (selectedFile) {
      try {
        const text = await selectedFile.text();
        const { data, errors: parseErrors } = parseCSV(text);
        
        if (parseErrors.length > 0) {
          setErrors(parseErrors);
          setStep(1);
        } else if (data.length > 0) {
          setParsedData(data);
          setStep(2);
        } else {
          setErrors(['No valid data found in CSV file']);
          setStep(1);
        }
      } catch (error) {
        setErrors(['Failed to read file. Please ensure it is a valid CSV file.']);
        setStep(1);
      }
    } else {
      setStep(1);
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setIsProcessing(true);
    setStep(3);

    try {
      await onImport(parsedData);
      toast.success(`Successfully imported ${parsedData.length} students`);
      handleClose();
    } catch (error) {
      toast.error('Failed to import students. Please try again.');
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setErrors([]);
    setStep(1);
    setIsProcessing(false);
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setParsedData(null);
      setErrors([]);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Import Students from CSV</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload a CSV file with student data to bulk import
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <FileUpload onFileSelect={handleFileSelect} accept=".csv" />
              
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ApperIcon name="AlertCircle" className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Import Errors</h4>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ApperIcon name="Info" className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">CSV Format Requirements</h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Your CSV file should include these columns:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• <strong>First Name</strong> (required)</li>
                        <li>• <strong>Last Name</strong> (required)</li>
                        <li>• <strong>Email</strong> (required)</li>
                        <li>• <strong>Class ID</strong> (required)</li>
                        <li>• <strong>Enrollment Date</strong> (optional, defaults to today)</li>
                        <li>• <strong>Status</strong> (optional, defaults to "active")</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && parsedData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Preview Import Data</h3>
                  <p className="text-sm text-gray-600">
                    {parsedData.length} students ready to import
                  </p>
                </div>
                <Button variant="outline" onClick={handleBack}>
                  <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedData.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {student.classId}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={cn(
                              "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                              student.status === 'active' && "bg-green-100 text-green-800",
                              student.status === 'inactive' && "bg-gray-100 text-gray-800",
                              student.status === 'graduated' && "bg-blue-100 text-blue-800"
                            )}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button onClick={handleImport} variant="primary">
                  <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
                  Import {parsedData.length} Students
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900">Importing Students...</h3>
              <p className="text-sm text-gray-600 mt-1">
                Please wait while we process your data
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}