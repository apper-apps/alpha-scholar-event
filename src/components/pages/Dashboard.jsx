import { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { studentService } from "@/services/api/studentService";
import { attendanceService } from "@/services/api/attendanceService";
import { gradeService } from "@/services/api/gradeService";
import { classService } from "@/services/api/classService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData, attendanceData, gradesData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        attendanceService.getAll(),
        gradeService.getAll()
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
      setAttendance(attendanceData);
      setGrades(gradesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRetry = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Dashboard" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Loading type="cards" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 lg:ml-64">
        <Header title="Dashboard" showSearch={false} />
        <div className="p-6 lg:p-8">
          <Error onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === "active").length;
  const totalClasses = classes.length;
  
  const todayAttendance = attendance.filter(a => a.date === format(new Date(), "yyyy-MM-dd"));
  const presentToday = todayAttendance.filter(a => a.status === "present").length;
  const attendanceRate = todayAttendance.length > 0 ? ((presentToday / todayAttendance.length) * 100).toFixed(1) : "0";

  const averageGrade = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : "0";

  const recentActivity = [
    { id: 1, type: "attendance", message: "Daily attendance marked for Class 10A", time: "2 hours ago", icon: "Calendar" },
    { id: 2, type: "grade", message: "Algebra Quiz 1 grades updated", time: "4 hours ago", icon: "Award" },
    { id: 3, type: "student", message: "New student Emma Thompson enrolled", time: "1 day ago", icon: "UserPlus" },
    { id: 4, type: "class", message: "Mathematics Advanced schedule updated", time: "2 days ago", icon: "BookOpen" }
  ];

  const quickActions = [
    { label: "Mark Attendance", icon: "Calendar", action: () => toast.info("Redirecting to attendance...") },
    { label: "Add Student", icon: "UserPlus", action: () => toast.info("Opening add student form...") },
    { label: "Enter Grades", icon: "Award", action: () => toast.info("Redirecting to grades...") },
    { label: "View Reports", icon: "FileText", action: () => toast.info("Generating reports...") }
  ];

  return (
    <div className="flex-1 lg:ml-64">
      <Header title="Dashboard" showSearch={false} />
      
      <div className="p-6 lg:p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon="Users"
            change="+5.2%"
            changeType="positive"
          />
          <StatCard
            title="Active Students"
            value={activeStudents}
            icon="UserCheck"
            change="+2.1%"
            changeType="positive"
          />
          <StatCard
            title="Classes"
            value={totalClasses}
            icon="BookOpen"
          />
          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            icon="Calendar"
            change="+1.5%"
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </Card.Header>
            <Card.Content className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={action.action}
                >
                  <ApperIcon name={action.icon} className="w-5 h-5 mr-3" />
                  {action.label}
                </Button>
              ))}
            </Card.Content>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </Card.Header>
            <Card.Content className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                    <ApperIcon name={activity.icon} className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </Card.Content>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Class Performance</h3>
            </Card.Header>
            <Card.Content className="space-y-4">
              {classes.map((classItem) => {
                const classStudents = students.filter(s => s.classId === classItem.section);
                const classGrades = grades.filter(g => 
                  classStudents.some(s => s.Id === g.studentId)
                );
                const avgGrade = classGrades.length > 0 
                  ? (classGrades.reduce((sum, g) => sum + g.score, 0) / classGrades.length).toFixed(1)
                  : "0";
                
                return (
                  <div key={classItem.Id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{classItem.name}</p>
                      <p className="text-sm text-gray-600">{classStudents.length} students</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg gradient-text">{avgGrade}%</p>
                      <Badge variant="success" size="sm">Active</Badge>
                    </div>
                  </div>
                );
              })}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Summary</h3>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-surface rounded-lg">
                  <p className="text-2xl font-bold gradient-text">{presentToday}</p>
                  <p className="text-sm text-gray-600">Present Today</p>
                </div>
                <div className="text-center p-4 bg-surface rounded-lg">
                  <p className="text-2xl font-bold text-warning">{todayAttendance.length - presentToday}</p>
                  <p className="text-sm text-gray-600">Absent Today</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {classes.map((classItem) => {
                  const classAttendance = todayAttendance.filter(a => {
                    const student = students.find(s => s.Id === a.studentId);
                    return student?.classId === classItem.section;
                  });
                  const presentInClass = classAttendance.filter(a => a.status === "present").length;
                  const attendancePercent = classAttendance.length > 0 
                    ? ((presentInClass / classAttendance.length) * 100).toFixed(0)
                    : "0";
                  
                  return (
                    <div key={classItem.Id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{classItem.section}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-success to-secondary h-2 rounded-full"
                            style={{ width: `${attendancePercent}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{attendancePercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;