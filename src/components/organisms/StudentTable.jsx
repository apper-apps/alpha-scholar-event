import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { toast } from "react-toastify";

const StudentTable = ({ students, onEdit, onDelete, onViewDetails }) => {
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "enrollmentDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      inactive: "warning",
      graduated: "primary"
    };
    return <Badge variant={variants[status]} size="sm">{status}</Badge>;
  };

  const handleAction = (action, student) => {
    if (action === "edit") {
      onEdit?.(student);
    } else if (action === "delete") {
      onDelete?.(student);
    } else if (action === "view") {
      onViewDetails?.(student);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ApperIcon name="ArrowUpDown" className="w-4 h-4 text-gray-400" />;
    }
    return (
      <ApperIcon
        name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
        className="w-4 h-4 text-primary"
      />
    );
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface border-b border-gray-200">
            <tr>
              <th
                className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("firstName")}
              >
                <div className="flex items-center space-x-2">
                  <span>Name</span>
                  <SortIcon field="firstName" />
                </div>
              </th>
              <th
                className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center space-x-2">
                  <span>Email</span>
                  <SortIcon field="email" />
                </div>
              </th>
              <th
                className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("classId")}
              >
                <div className="flex items-center space-x-2">
                  <span>Class</span>
                  <SortIcon field="classId" />
                </div>
              </th>
              <th
                className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("enrollmentDate")}
              >
                <div className="flex items-center space-x-2">
                  <span>Enrolled</span>
                  <SortIcon field="enrollmentDate" />
                </div>
              </th>
              <th
                className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-2">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStudents.map((student) => (
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
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">{student.email}</td>
                <td className="py-4 px-6">
                  <Badge variant="primary" size="sm">{student.classId}</Badge>
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {format(new Date(student.enrollmentDate), "MMM dd, yyyy")}
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(student.status)}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction("view", student)}
                      className="p-2"
                    >
                      <ApperIcon name="Eye" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction("edit", student)}
                      className="p-2"
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction("delete", student)}
                      className="p-2 text-error hover:bg-error/10"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StudentTable;