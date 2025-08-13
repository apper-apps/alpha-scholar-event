import gradesData from "@/services/mockData/grades.json";

let grades = [...gradesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const gradeService = {
  async getAll() {
    await delay(300);
    return [...grades];
  },

  async getById(id) {
    await delay(200);
    const grade = grades.find(g => g.Id === parseInt(id));
    if (!grade) {
      throw new Error("Grade not found");
    }
    return { ...grade };
  },

  async create(gradeData) {
    await delay(400);
    const newGrade = {
      ...gradeData,
      Id: Math.max(...grades.map(g => g.Id)) + 1,
      submittedDate: new Date().toISOString().split("T")[0]
    };
    grades.push(newGrade);
    return { ...newGrade };
  },

  async update(id, gradeData) {
    await delay(350);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    grades[index] = { ...grades[index], ...gradeData };
    return { ...grades[index] };
  },

  async delete(id) {
    await delay(250);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    const deletedGrade = grades.splice(index, 1)[0];
    return { ...deletedGrade };
  },

  async getByStudent(studentId) {
    await delay(300);
    return grades.filter(g => g.studentId === parseInt(studentId)).map(g => ({ ...g }));
  },

  async getByAssignment(assignmentId) {
    await delay(300);
    return grades.filter(g => g.assignmentId === parseInt(assignmentId)).map(g => ({ ...g }));
  }
};