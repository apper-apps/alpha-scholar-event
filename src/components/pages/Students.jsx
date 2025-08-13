import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { toast } from "react-toastify";
import ImportModal from "@/components/molecules/ImportModal";
import { downloadCSV, generateCSV } from "@/utils/csvUtils";
import ApperIcon from "@/components/ApperIcon";
import Header from "@/components/organisms/Header";
import StudentTable from "@/components/organisms/StudentTable";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import gradesData from "@/services/mockData/grades.json";
import classesData from "@/services/mockData/classes.json";
import attendanceData from "@/services/mockData/attendance.json";
import studentsData from "@/services/mockData/students.json";
import assignmentsData from "@/services/mockData/assignments.json";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classId: "",
    status: "active"
  });

  const navigate = useNavigate();
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData] = await Promise.all([
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase()) ||
      student.classId.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredStudents(filtered);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      classId: "",
      status: "active"
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      classId: student.classId,
      status: student.status
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      return;
    }

    try {
      await studentService.delete(student.Id);
      const updatedStudents = students.filter(s => s.Id !== student.Id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      toast.success("Student deleted successfully");
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.classId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (showEditModal && selectedStudent) {
        const updatedStudent = await studentService.update(selectedStudent.Id, formData);
        const updatedStudents = students.map(s => s.Id === selectedStudent.Id ? updatedStudent : s);
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        toast.success("Student updated successfully");
        setShowEditModal(false);
      } else {
        const newStudent = await studentService.create(formData);
        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        toast.success("Student added successfully");
        setShowAddModal(false);
      }
      resetForm();
      setSelectedStudent(null);
    } catch (err) {
      toast.error("Failed to save student");
    }
  };

const handleRetry = () => {
    loadData();
  };

  const [showImportModal, setShowImportModal] = useState(false);

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast.error("No students to export");
      return;
    }

    try {
      const headers = ['First Name', 'Last Name', 'Email', 'Class', 'Status', 'Enrollment Date'];
      const data = filteredStudents.map(student => [
        student.firstName || '',
        student.lastName || '',
        student.email || '',
        student.classId || '',
        student.status || '',
        student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : ''
      ]);

      const csvContent = generateCSV(headers, data);
      downloadCSV(csvContent, `students_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Students exported successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export students");
    }
  };

  const handleImport = async (csvData) => {
    try {
      if (!csvData || csvData.length === 0) {
        toast.error("No data to import");
        return;
      }

      const importedStudents = [];
      const errors = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        if (!row.firstName || !row.lastName || !row.email || !row.classId) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        try {
          const studentData = {
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            email: row.email.trim(),
            classId: row.classId.trim(),
            status: row.status?.trim() || 'active'
          };

          const newStudent = await studentService.create(studentData);
          importedStudents.push(newStudent);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      if (importedStudents.length > 0) {
        const updatedStudents = [...students, ...importedStudents];
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        toast.success(`Successfully imported ${importedStudents.length} students`);
      }

      if (errors.length > 0) {
        console.error('Import errors:', errors);
        toast.warning(`${errors.length} rows had errors. Check console for details.`);
      }

      setShowImportModal(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import students");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Students" onSearch={handleSearch} />
        <div className="p-6 lg:p-8">
          <Loading type="table" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Students" onSearch={handleSearch} />
        <div className="p-6 lg:p-8">
          <Error onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 lg:ml-64">
      <Header title="Students" onSearch={handleSearch} />
      
      <div className="p-6 lg:p-8">
<div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Manage your student roster, track enrollment, and update student information.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleExport} variant="outline">
              <ApperIcon name="Download" className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setShowImportModal(true)} variant="outline">
              <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleAdd} variant="primary">
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        <ImportModal
          show={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />

        {filteredStudents.length === 0 ? (
          <Empty
            title="No students found"
            message="Start by adding your first student to the system."
            icon="Users"
            actionLabel="Add Student"
            onAction={handleAdd}
          />
        ) : (
          <StudentTable
            students={filteredStudents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Add/Edit Modal */}
        <Modal
          show={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
            setSelectedStudent(null);
          }}
          title={showEditModal ? "Edit Student" : "Add New Student"}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" required>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </FormField>
              <FormField label="Last Name" required>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </FormField>
            </div>
            
            <FormField label="Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </FormField>
            
            <FormField label="Class" required>
              <select
                value={formData.classId}
                onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select a class</option>
                {classes.map(classItem => (
                  <option key={classItem.Id} value={classItem.section}>
                    {classItem.section} - {classItem.name}
                  </option>
                ))}
              </select>
            </FormField>
            
            <FormField label="Status" required>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </FormField>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                  setSelectedStudent(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                {showEditModal ? "Update" : "Add"} Student
              </Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
          title="Student Details"
        >
          {selectedStudent && (
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-gray-600">{selectedStudent.email}</p>
              </div>
              
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{selectedStudent.classId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{selectedStudent.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrolled:</span>
                  <span className="font-medium">
                    {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedStudent(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedStudent);
                  }}
                >
                  Edit Student
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Students;