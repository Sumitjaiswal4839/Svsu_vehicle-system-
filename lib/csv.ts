import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'data');
const CSV_PATH = path.join(LOG_DIR, 'vehicle_logs.csv');

export async function logToCSV(data: {
  type: 'ENTRY' | 'EXIT';
  fullName: string;
  rollNo: string;
  faculty: string;
  course: string;
  semester: string;
  vehicleNo: string;
  timestamp: string;
}) {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const header = 'Type,FullName,RollNo,Faculty,Course,Semester,VehicleNo,Timestamp\n';
  const row = `${data.type},"${data.fullName}","${data.rollNo}","${data.faculty}","${data.course}","${data.semester}","${data.vehicleNo}",${data.timestamp}\n`;

  if (isNewFile) {
    fs.writeFileSync(CSV_PATH, header + row);
  } else {
    fs.appendFileSync(CSV_PATH, row);
  }
}
