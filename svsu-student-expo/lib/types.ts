export interface EntryRecord {
  id: string;
  entryTime: string;
  exitTime: string | null;
  vehicleNo: string | null;
  isTemporary: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  course: string;
  semester: string;
  faculty: string | null;
  rollNo: string;
  vehicleNo: string;
  license: string | null;
  rcPhoto: string;
  idCardFront: string;
  idCardBack: string;
  profilePhoto: string | null;
  buildingId: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  entries: EntryRecord[];
}

export interface RegisterFormData {
  name: string;
  course: string;
  semester: string;
  faculty: string;
  rollNo: string;
  password: string;
  vehicleNo: string;
  license: string;
  rcPhoto: string;
  idCardFront: string;
  idCardBack: string;
  profilePhoto: string;
  buildingId: string;
}
