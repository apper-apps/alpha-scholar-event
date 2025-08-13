const { ApperClient } = window.ApperSDK;

export const studentService = {
  async getAll() {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "enrollment_date_c" } },
          { field: { Name: "status_c" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching students:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "enrollment_date_c" } },
          { field: { Name: "status_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById('student_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching student with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async create(studentData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include updateable fields
      const createData = {
        Name: `${studentData.firstName || studentData.first_name_c} ${studentData.lastName || studentData.last_name_c}`,
        first_name_c: studentData.firstName || studentData.first_name_c,
        last_name_c: studentData.lastName || studentData.last_name_c,
        email_c: studentData.email || studentData.email_c,
        class_id_c: studentData.classId || studentData.class_id_c,
        enrollment_date_c: studentData.enrollmentDate || studentData.enrollment_date_c || new Date().toISOString().split("T")[0],
        status_c: studentData.status || studentData.status_c || 'active'
      };
      
      const params = {
        records: [createData]
      };
      
      const response = await apperClient.createRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create student ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create student');
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating student:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, studentData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include updateable fields
      const updateData = {
        Id: parseInt(id),
        Name: `${studentData.firstName || studentData.first_name_c} ${studentData.lastName || studentData.last_name_c}`,
        first_name_c: studentData.firstName || studentData.first_name_c,
        last_name_c: studentData.lastName || studentData.last_name_c,
        email_c: studentData.email || studentData.email_c,
        class_id_c: studentData.classId || studentData.class_id_c,
        enrollment_date_c: studentData.enrollmentDate || studentData.enrollment_date_c,
        status_c: studentData.status || studentData.status_c
      };
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update student ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message || 'Failed to update student');
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating student:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete student ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message || 'Failed to delete student');
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting student:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getByClass(classId) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "enrollment_date_c" } },
          { field: { Name: "status_c" } }
        ],
        where: [
          {
            FieldName: "class_id_c",
            Operator: "EqualTo",
            Values: [classId]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching students by class:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async importFromCSV(csvData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Get existing students to check for duplicates
      const existingStudents = await this.getAll();
      const existingEmails = new Set(existingStudents.map(s => s.email_c?.toLowerCase()));
      
      const studentsToCreate = [];
      let skipped = 0;
      
      for (const studentData of csvData) {
        // Check for duplicate email
        if (existingEmails.has(studentData.email.toLowerCase())) {
          skipped++;
          continue;
        }
        
        const createData = {
          Name: `${studentData.firstName} ${studentData.lastName}`,
          first_name_c: studentData.firstName,
          last_name_c: studentData.lastName,
          email_c: studentData.email,
          class_id_c: studentData.classId,
          enrollment_date_c: studentData.enrollmentDate || new Date().toISOString().split('T')[0],
          status_c: studentData.status || 'active'
        };
        
        studentsToCreate.push(createData);
        existingEmails.add(studentData.email.toLowerCase());
      }
      
      if (studentsToCreate.length === 0) {
        return {
          imported: 0,
          skipped: skipped,
          students: []
        };
      }
      
      const params = {
        records: studentsToCreate
      };
      
      const response = await apperClient.createRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to import ${failedRecords.length} student records:${JSON.stringify(failedRecords)}`);
        }
        
        return {
          imported: successfulRecords.length,
          skipped: skipped + failedRecords.length,
          students: successfulRecords.map(result => result.data)
        };
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error importing students:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async exportToCSV() {
    try {
      const students = await this.getAll();
      return students.map(s => ({
        firstName: s.first_name_c,
        lastName: s.last_name_c,
        email: s.email_c,
        classId: s.class_id_c,
        enrollmentDate: s.enrollment_date_c,
        status: s.status_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error exporting students:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};