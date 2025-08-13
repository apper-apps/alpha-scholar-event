import { useState, useRef } from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

export default function FileUpload({ onFileSelect, accept = '.csv', className, ...props }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors",
        isDragOver && "border-primary bg-blue-50",
        selectedFile && "border-green-500 bg-green-50",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      {...props}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <ApperIcon name="FileText" className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleBrowseClick}>
              <ApperIcon name="RefreshCw" className="w-4 h-4 mr-1" />
              Replace
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveFile}>
              <ApperIcon name="X" className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <ApperIcon name="Upload" className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Drop your CSV file here, or{' '}
              <button
                type="button"
                onClick={handleBrowseClick}
                className="text-primary hover:text-blue-600 underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports CSV files up to 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}