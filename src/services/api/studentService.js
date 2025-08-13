import studentsData from "@/services/mockData/students.json";

let students = [...studentsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const studentService = {
  async getAll() {
    await delay(300);
    return [...students];
  },

  async getById(id) {
    await delay(200);
    const student = students.find(s => s.Id === parseInt(id));
    if (!student) {
      throw new Error("Student not found");
    }
    return { ...student };
  },

  async create(studentData) {
    await delay(400);
    const newStudent = {
      ...studentData,
      Id: Math.max(...students.map(s => s.Id)) + 1,
      enrollmentDate: new Date().toISOString().split("T")[0]
    };
    students.push(newStudent);
    return { ...newStudent };
  },

  async update(id, studentData) {
    await delay(350);
    const index = students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    students[index] = { ...students[index], ...studentData };
    return { ...students[index] };
  },

  async delete(id) {
    await delay(250);
    const index = students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    const deletedStudent = students.splice(index, 1)[0];
    return { ...deletedStudent };
  },

async getByClass(classId) {
    await delay(300);
    return students.filter(s => s.classId === classId).map(s => ({ ...s }));
  },

  async importFromCSV(csvData) {
    await delay(500);
    
    const importedStudents = [];
    const existingEmails = new Set(students.map(s => s.email.toLowerCase()));
    
    for (const studentData of csvData) {
      // Check for duplicate email
      if (existingEmails.has(studentData.email.toLowerCase())) {
        continue; // Skip duplicates
      }
      
      // Generate new ID
      const newId = Math.max(...students.map(s => s.Id)) + 1 + importedStudents.length;
      
      const newStudent = {
        Id: newId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        classId: studentData.classId,
        enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0],
        status: studentData.status || 'active'
      };
      
      students.push(newStudent);
      importedStudents.push(newStudent);
      existingEmails.add(studentData.email.toLowerCase());
    }
    
    return {
      imported: importedStudents.length,
      skipped: csvData.length - importedStudents.length,
      students: importedStudents.map(s => ({ ...s }))
    };
  },

  async exportToCSV() {
    await delay(200);
    return students.map(s => ({ ...s }));
  }
};