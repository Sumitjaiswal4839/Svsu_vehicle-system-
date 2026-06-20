import { prisma } from './prisma';

export interface ActivityLogData {
  type: 'ENTRY' | 'EXIT';
  fullName: string;
  rollNo: string;
  faculty: string;
  course: string;
  semester: string;
  vehicleNo: string;
  timestamp: string;
}

/**
 * Logs vehicle entry/exit to the database ActivityLog table.
 * Replaces the old fs-based CSV logging which doesn't work on Vercel serverless.
 */
export async function logToCSV(data: ActivityLogData) {
  try {
    await (prisma as any).activityLog.create({
      data: {
        type: data.type,
        fullName: data.fullName,
        rollNo: data.rollNo,
        faculty: data.faculty,
        course: data.course,
        semester: data.semester,
        vehicleNo: data.vehicleNo,
        timestamp: new Date(data.timestamp),
      },
    });
  } catch (error) {
    // Silent fail — logging should never break the main flow
    console.error('[ActivityLog] Failed to log activity:', error);
  }
}
