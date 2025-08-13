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
import { gradeService } from "@/services/api/gradeService";
import { studentService } from "@/services/api/studentService";
import { assignmentService } from "@/services/api/assignmentService";
import { classService } from "@/services/api/classService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    type: "quiz",
    dueDate: "",
    maxScore: 100
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [gradesData, studentsData, assignmentsData, classesData] = await Promise.all([
        gradeService.getAll(),
        studentService.getAll(),
        assignmentService.getAll(),
        classService.getAll()
      ]);
      
      setGrades(gradesData);
      setStudents(studentsData);
      setAssignments(assignmentsData);
      setClasses(classesData);
      
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].section);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = () => {
    loadData();
  };

  const getFilteredStudents = () => {
    return students.filter(s => s.classId === selectedClass && s.status === "active");
  };

  const getClassAssignments = () => {
    return assignments.filter(a => a.classId === selectedClass);
  };

  const getGradeForStudentAndAssignment = (studentId, assignmentId) => {
    return grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId);
  };

  const calculateLetterGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    
    if (!assignmentForm.title || !assignmentForm.dueDate || !selectedClass) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newAssignment = await assignmentService.create({
        ...assignmentForm,
        classId: selectedClass
      });
      setAssignments([...assignments, newAssignment]);
      setShowAddAssignmentModal(false);
      setAssignmentForm({
        title: "",
        type: "quiz",
        dueDate: "",
        maxScore: 100
      });
      toast.success("Assignment added successfully");
    } catch (err) {
      toast.error("Failed to add assignment");
    }
  };

  const handleGradeChange = async (studentId, assignmentId, score) => {
    try {
      const assignment = assignments.find(a => a.Id === assignmentId);
      const letterGrade = calculateLetterGrade(score, assignment.maxScore);
      
      const existingGrade = getGradeForStudentAndAssignment(studentId, assignmentId);
      
      if (existingGrade) {
        const updatedGrade = await gradeService.update(existingGrade.Id, {
          score: parseInt(score),
          letterGrade
        });
        const updatedGrades = grades.map(g => 
          g.Id === existingGrade.Id ? updatedGrade : g
        );
        setGrades(updatedGrades);
      } else {
        const newGrade = await gradeService.create({
          studentId,
          assignmentId,
          score: parseInt(score),
          maxScore: assignment.maxScore,
          letterGrade
        });
        setGrades([...grades, newGrade]);
      }
    } catch (err) {
      toast.error("Failed to update grade");
    }
  };

  const getStudentAverage = (studentId) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    
    const total = studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0);
    return (total / studentGrades.length).toFixed(1);
  };

  const getAssignmentStats = (assignmentId) => {
    const assignmentGrades = grades.filter(g => g.assignmentId === assignmentId);
    if (assignmentGrades.length === 0) return { average: 0, submitted: 0 };
    
    const total = assignmentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0);
    return {
      average: (total / assignmentGrades.length).toFixed(1),
      submitted: assignmentGrades.length
    };
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Grades" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Grades" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Error onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  const classStudents = getFilteredStudents();
  const classAssignments = getClassAssignments();

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

  if (classes.length === 0) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Grades" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Empty
            title="No classes found"
            message="Create classes first to start managing grades."
            icon="Award"
            actionLabel="Go to Classes"
            onAction={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 lg:ml-64">
      <Header title="Grades" showSearch={false} />
      
      <div className="p-6 lg:p-8">
        {/* Controls */}
        <Card className="mb-6">
          <Card.Content>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="flex h-11 w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary"
                  >
                    {classes.map(classItem => (
                      <option key={classItem.Id} value={classItem.section}>
                        {classItem.section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddAssignmentModal(true)}
                  disabled={!selectedClass}
                >
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add Assignment
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Assignments List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignments</h3>
            {classAssignments.length === 0 ? (
              <Empty
                title="No assignments found"
                message="Create assignments to start grading students."
                icon="FileText"
                actionLabel="Add Assignment"
                onAction={() => setShowAddAssignmentModal(true)}
              />
            ) : (
              <div className="space-y-4">
                {classAssignments.map((assignment) => {
                  const stats = getAssignmentStats(assignment.Id);
                  return (
                    <Card key={assignment.Id} hover>
                      <Card.Content>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                              <Badge variant="primary" size="sm">{assignment.type}</Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}</span>
                              <span>Max Score: {assignment.maxScore}</span>
                              <span>Submitted: {stats.submitted}/{classStudents.length}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold gradient-text">{stats.average}%</p>
                            <p className="text-xs text-gray-500">Class Average</p>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Rankings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
            <Card>
              <Card.Content>
                {classStudents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No students in class</p>
                ) : (
                  <div className="space-y-3">
                    {classStudents
                      .map(student => ({
                        ...student,
                        average: getStudentAverage(student.Id)
                      }))
                      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
                      .slice(0, 10)
                      .map((student, index) => (
                        <div key={student.Id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="w-6 h-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mr-3 text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {student.firstName} {student.lastName}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-primary">{student.average}%</span>
                        </div>
                      ))}
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Grades Grid */}
        {classAssignments.length > 0 && classStudents.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 min-w-[200px]">
                      Student
                    </th>
                    {classAssignments.map(assignment => (
                      <th key={assignment.Id} className="text-center py-4 px-4 font-semibold text-gray-700 min-w-[120px]">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-xs text-gray-500 font-normal">
                            {assignment.maxScore} pts
                          </p>
                        </div>
                      </th>
                    ))}
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classStudents.map((student) => (
                    <tr key={student.Id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-primary">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      {classAssignments.map(assignment => {
                        const grade = getGradeForStudentAndAssignment(student.Id, assignment.Id);
                        return (
                          <td key={assignment.Id} className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <input
                                type="number"
                                min="0"
                                max={assignment.maxScore}
                                value={grade?.score || ""}
                                onChange={(e) => {
                                  if (e.target.value === "" || (parseInt(e.target.value) >= 0 && parseInt(e.target.value) <= assignment.maxScore)) {
                                    if (e.target.value !== "") {
                                      handleGradeChange(student.Id, assignment.Id, e.target.value);
                                    }
                                  }
                                }}
                                placeholder="--"
                                className="w-16 h-8 text-center border border-gray-300 rounded px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                              {grade && (
                                <Badge 
                                  variant={
                                    grade.letterGrade === "A" ? "success" :
                                    grade.letterGrade === "B" ? "primary" :
                                    grade.letterGrade === "C" ? "warning" :
                                    "error"
                                  } 
                                  size="sm"
                                >
                                  {grade.letterGrade}
                                </Badge>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-4 px-6 text-center">
                        <span className="text-lg font-bold gradient-text">
                          {getStudentAverage(student.Id)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Add Assignment Modal */}
        <Modal
          show={showAddAssignmentModal}
          onClose={() => {
            setShowAddAssignmentModal(false);
            setAssignmentForm({
              title: "",
              type: "quiz",
              dueDate: "",
              maxScore: 100
            });
          }}
          title="Add New Assignment"
        >
          <form onSubmit={handleAddAssignment} className="p-6 space-y-4">
            <FormField label="Assignment Title" required>
              <Input
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
              />
            </FormField>
            
            <FormField label="Type" required>
              <select
                value={assignmentForm.type}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, type: e.target.value }))}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary"
              >
                <option value="quiz">Quiz</option>
                <option value="test">Test</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
              </select>
            </FormField>
            
            <FormField label="Due Date" required>
              <Input
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </FormField>
            
            <FormField label="Maximum Score" required>
              <Input
                type="number"
                min="1"
                value={assignmentForm.maxScore}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))}
                placeholder="100"
              />
            </FormField>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowAddAssignmentModal(false);
                  setAssignmentForm({
                    title: "",
                    type: "quiz",
                    dueDate: "",
                    maxScore: 100
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Add Assignment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Grades;