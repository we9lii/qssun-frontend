import { supabase } from '../supabaseClient';
import { Report } from '../types';

const TABLE_NAME = 'reports';

// Helper to map DB report (snake_case) to App report (camelCase)
const mapDbReportToAppReport = (dbReport: any): Report => {
    if (!dbReport) return dbReport;
    return {
        id: dbReport.id,
        employeeId: dbReport.employee_id,
        employeeName: dbReport.employee_name,
        branch: dbReport.branch,
        department: dbReport.department,
        type: dbReport.type,
        date: dbReport.date,
        status: dbReport.status,
        details: dbReport.details,
        evaluation: dbReport.evaluation,
        modifications: dbReport.modifications,
    };
};

// Helper to map App Report object (camelCase) to DB record (snake_case) for inserts/updates
const mapAppReportToDbPayload = (reportPayload: Partial<Omit<Report, 'id'>>): any => {
    const dbPayload: any = {};
    if (reportPayload.employeeId) dbPayload.employee_id = reportPayload.employeeId;
    if (reportPayload.employeeName) dbPayload.employee_name = reportPayload.employeeName;
    if (reportPayload.branch) dbPayload.branch = reportPayload.branch;
    if (reportPayload.department) dbPayload.department = reportPayload.department;
    if (reportPayload.type) dbPayload.type = reportPayload.type;
    if (reportPayload.date) dbPayload.date = reportPayload.date;
    if (reportPayload.status) dbPayload.status = reportPayload.status;
    if (reportPayload.details) dbPayload.details = reportPayload.details;
    if (reportPayload.evaluation) dbPayload.evaluation = reportPayload.evaluation;
    if (reportPayload.modifications) dbPayload.modifications = reportPayload.modifications;
    return dbPayload;
};


export const api_reports = {
  /**
   * Fetches all reports from the database.
   */
  getReports: async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      console.error("Error fetching reports:", error.message, error);
      throw new Error(error.message);
    }
    // The `details` column in Supabase is likely JSONB. 
    // The Supabase client should parse it automatically.
    return data.map(mapDbReportToAppReport);
  },

  /**
   * Creates a new report in the database.
   */
  createReport: async (reportData: Omit<Report, 'id'>): Promise<Report> => {
    const dbPayload = mapAppReportToDbPayload(reportData);
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(dbPayload)
        .select()
        .single();

    if (error) throw error;
    return mapDbReportToAppReport(data);
  },

  /**
   * Updates an existing report.
   */
  updateReport: async (reportId: string, updateData: Partial<Omit<Report, 'id'>>): Promise<Report> => {
    const dbPayload = mapAppReportToDbPayload(updateData);
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(dbPayload)
        .eq('id', reportId)
        .select()
        .single();
    
    if (error) throw error;
    return mapDbReportToAppReport(data);
  },

  /**
   * Deletes a report by its ID.
   */
  deleteReport: async (reportId: string): Promise<{ id: string }> => {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', reportId);
    if (error) throw error;
    return { id: reportId };
  }
};
