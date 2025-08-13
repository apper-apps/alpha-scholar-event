import { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { attendanceService } from "@/services/api/attendanceService";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { toast } from "react-toastify";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [viewMode, setViewMode] = useState("daily"); // daily, weekly

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [attendanceData, studentsData, classesData] = await Promise.all([
        attendanceService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setAttendance(attendanceData);
      setStudents(studentsData);
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

  const getAttendanceForStudentAndDate = (studentId, date) => {
    return attendance.find(a => a.studentId === studentId && a.date === date);
  };

  const handleAttendanceChange = async (studentId, date, status) => {
    try {
      const existingRecord = getAttendanceForStudentAndDate(studentId, date);
      
      if (existingRecord) {
        const updatedRecord = await attendanceService.update(existingRecord.Id, { status });
        const updatedAttendance = attendance.map(a => 
          a.Id === existingRecord.Id ? updatedRecord : a
        );
        setAttendance(updatedAttendance);
      } else {
        const newRecord = await attendanceService.create({
          studentId,
          date,
          status,
          notes: ""
        });
        setAttendance([...attendance, newRecord]);
      }
    } catch (err) {
      toast.error("Failed to update attendance");
    }
  };

  const markAllPresent = async () => {
    if (!selectedClass) return;
    
    const classStudents = getFilteredStudents();
    
    try {
      const promises = classStudents.map(student => {
        const existingRecord = getAttendanceForStudentAndDate(student.Id, selectedDate);
        if (!existingRecord) {
          return attendanceService.create({
            studentId: student.Id,
            date: selectedDate,
            status: "present",
            notes: ""
          });
        }
        return null;
      }).filter(Boolean);
      
      const newRecords = await Promise.all(promises);
      setAttendance([...attendance, ...newRecords]);
      toast.success("All students marked present");
    } catch (err) {
      toast.error("Failed to mark all present");
    }
  };

  const getAttendanceStats = () => {
    if (!selectedClass) return { total: 0, present: 0, absent: 0, late: 0 };
    
    const classStudents = getFilteredStudents();
    const dateAttendance = attendance.filter(a => a.date === selectedDate);
    const classAttendance = dateAttendance.filter(a => 
      classStudents.some(s => s.Id === a.studentId)
    );
    
    return {
      total: classStudents.length,
      present: classAttendance.filter(a => a.status === "present").length,
      absent: classAttendance.filter(a => a.status === "absent").length,
      late: classAttendance.filter(a => a.status === "late").length
    };
  };

  const getStatusBadge = (status) => {
    const variants = {
      present: { variant: "success", label: "Present" },
      absent: { variant: "error", label: "Absent" },
      late: { variant: "warning", label: "Late" },
      excused: { variant: "info", label: "Excused" }
    };
    
    const config = variants[status] || { variant: "default", label: "Not Marked" };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getWeekDates = () => {
    const start = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Attendance" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Attendance" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Error onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  const stats = getAttendanceStats();
  const classStudents = getFilteredStudents();

  if (classes.length === 0) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Attendance" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Empty
            title="No classes found"
            message="Create classes first to start tracking attendance."
            icon="Calendar"
            actionLabel="Go to Classes"
            onAction={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 lg:ml-64">
      <Header title="Attendance" showSearch={false} />
      
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex h-11 w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={markAllPresent}
                  disabled={!selectedClass}
                >
                  <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2" />
                  Mark All Present
                </Button>
                <Button
                  variant={viewMode === "daily" ? "primary" : "ghost"}
                  onClick={() => setViewMode("daily")}
                >
                  Daily View
                </Button>
                <Button
                  variant={viewMode === "weekly" ? "primary" : "ghost"}
                  onClick={() => setViewMode("weekly")}
                >
                  Weekly View
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <Card.Content className="text-center">
              <p className="text-2xl font-bold gradient-text">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <p className="text-2xl font-bold text-success">{stats.present}</p>
              <p className="text-sm text-gray-600">Present</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <p className="text-2xl font-bold text-error">{stats.absent}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.late}</p>
              <p className="text-sm text-gray-600">Late</p>
            </Card.Content>
          </Card>
        </div>

        {/* Attendance Grid */}
        {classStudents.length === 0 ? (
          <Empty
            title="No students in this class"
            message="Add students to this class to start tracking attendance."
            icon="Users"
            actionLabel="Go to Students"
            onAction={() => {}}
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Student
                    </th>
                    {viewMode === "daily" ? (
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        {format(new Date(selectedDate), "MMM dd, yyyy")}
                      </th>
                    ) : (
                      getWeekDates().map(date => (
                        <th key={date.toISOString()} className="text-center py-4 px-6 font-semibold text-gray-700">
                          {format(date, "EEE\nMMM dd")}
                        </th>
                      ))
                    )}
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
                      {viewMode === "daily" ? (
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {["present", "absent", "late", "excused"].map(status => {
                              const isSelected = getAttendanceForStudentAndDate(student.Id, selectedDate)?.status === status;
                              return (
                                <button
                                  key={status}
                                  onClick={() => handleAttendanceChange(student.Id, selectedDate, status)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isSelected 
                                      ? status === "present" 
                                        ? "bg-success border-success text-white" 
                                        : status === "absent"
                                        ? "bg-error border-error text-white"
                                        : status === "late"
                                        ? "bg-warning border-warning text-white"
                                        : "bg-info border-info text-white"
                                      : "border-gray-300 hover:border-gray-400"
                                  }`}
                                  title={status.charAt(0).toUpperCase() + status.slice(1)}
                                >
                                  <ApperIcon 
                                    name={
                                      status === "present" ? "Check" :
                                      status === "absent" ? "X" :
                                      status === "late" ? "Clock" :
                                      "AlertCircle"
                                    }
                                    className="w-4 h-4"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      ) : (
                        getWeekDates().map(date => {
                          const dateStr = format(date, "yyyy-MM-dd");
                          const record = getAttendanceForStudentAndDate(student.Id, dateStr);
                          return (
                            <td key={dateStr} className="py-4 px-6 text-center">
                              {record ? (
                                getStatusBadge(record.status)
                              ) : (
                                <Badge variant="default" size="sm">Not Marked</Badge>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Attendance;