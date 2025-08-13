import { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { classService } from "@/services/api/classService";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    academicYear: "2023-2024",
    teacherId: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(),
        studentService.getAll()
      ]);
      
      setClasses(classesData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      section: "",
      academicYear: "2023-2024",
      teacherId: ""
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      section: classItem.section,
      academicYear: classItem.academicYear,
      teacherId: classItem.teacherId
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (classItem) => {
    setSelectedClass(classItem);
    setShowDetailModal(true);
  };

  const handleDelete = async (classItem) => {
    const classStudents = students.filter(s => s.classId === classItem.section);
    
    if (classStudents.length > 0) {
      toast.error("Cannot delete class with enrolled students");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${classItem.name}?`)) {
      return;
    }

    try {
      await classService.delete(classItem.Id);
      const updatedClasses = classes.filter(c => c.Id !== classItem.Id);
      setClasses(updatedClasses);
      toast.success("Class deleted successfully");
    } catch (err) {
      toast.error("Failed to delete class");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.section || !formData.academicYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (showEditModal && selectedClass) {
        const updatedClass = await classService.update(selectedClass.Id, formData);
        const updatedClasses = classes.map(c => c.Id === selectedClass.Id ? updatedClass : c);
        setClasses(updatedClasses);
        toast.success("Class updated successfully");
        setShowEditModal(false);
      } else {
        const newClass = await classService.create(formData);
        setClasses([...classes, newClass]);
        toast.success("Class added successfully");
        setShowAddModal(false);
      }
      resetForm();
      setSelectedClass(null);
    } catch (err) {
      toast.error("Failed to save class");
    }
  };

  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Classes" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Loading type="cards" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Classes" showSearch={false} />
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
      <Header title="Classes" showSearch={false} />
      
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Manage your classes, sections, and academic year information.
            </p>
          </div>
          <Button onClick={handleAdd} variant="primary">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </div>

        {classes.length === 0 ? (
          <Empty
            title="No classes found"
            message="Start by creating your first class to organize students."
            icon="BookOpen"
            actionLabel="Add Class"
            onAction={handleAdd}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => {
              const classStudents = students.filter(s => s.classId === classItem.section);
              const activeStudents = classStudents.filter(s => s.status === "active").length;
              
              return (
                <Card key={classItem.Id} hover className="group">
                  <Card.Content>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {classItem.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="primary" size="sm">{classItem.section}</Badge>
                          <Badge variant="secondary" size="sm">{classItem.academicYear}</Badge>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(classItem)}
                            className="p-2"
                          >
                            <ApperIcon name="Eye" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(classItem)}
                            className="p-2"
                          >
                            <ApperIcon name="Edit" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(classItem)}
                            className="p-2 text-error hover:bg-error/10"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Students:</span>
                        <span className="font-medium text-gray-900">{classStudents.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Students:</span>
                        <span className="font-medium text-success">{activeStudents}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Teacher ID:</span>
                        <span className="font-medium text-gray-900">{classItem.teacherId}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewDetails(classItem)}
                      >
                        <ApperIcon name="Users" className="w-4 h-4 mr-2" />
                        View Students
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          show={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
            setSelectedClass(null);
          }}
          title={showEditModal ? "Edit Class" : "Add New Class"}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <FormField label="Class Name" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mathematics Advanced"
              />
            </FormField>
            
            <FormField label="Section" required>
              <Input
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                placeholder="e.g., 10A"
              />
            </FormField>
            
            <FormField label="Academic Year" required>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </FormField>
            
            <FormField label="Teacher ID">
              <Input
                value={formData.teacherId}
                onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                placeholder="Enter teacher ID"
              />
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
                  setSelectedClass(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                {showEditModal ? "Update" : "Add"} Class
              </Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClass(null);
          }}
          title="Class Details"
        >
          {selectedClass && (
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="BookOpen" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedClass.name}
                </h3>
                <p className="text-gray-600">{selectedClass.section}</p>
              </div>
              
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Academic Year:</span>
                  <span className="font-medium">{selectedClass.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teacher ID:</span>
                  <span className="font-medium">{selectedClass.teacherId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Students:</span>
                  <span className="font-medium">
                    {students.filter(s => s.classId === selectedClass.section).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Students:</span>
                  <span className="font-medium text-success">
                    {students.filter(s => s.classId === selectedClass.section && s.status === "active").length}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Students in this class:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {students
                    .filter(s => s.classId === selectedClass.section)
                    .map(student => (
                      <div key={student.Id} className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg">
                        <span className="text-sm font-medium">
                          {student.firstName} {student.lastName}
                        </span>
                        <Badge 
                          variant={student.status === "active" ? "success" : student.status === "inactive" ? "warning" : "primary"} 
                          size="sm"
                        >
                          {student.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedClass(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedClass);
                  }}
                >
                  Edit Class
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Classes;