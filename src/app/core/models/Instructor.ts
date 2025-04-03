export interface IInstructor {
  _id?: string | undefined;
  userName: string;
  email: string;
  phone: string;
  place: string;
  state: string;
  qualification: string;
  workExperience: string;
  lastWorkingPlace: string;
  specialization: string;
  linkedinProfile?: string;
  isActive?: boolean;
  createdAt?: Date;
  approvedAt?: Date;
  profilePhoto?: string;
}

export interface IModule {
  title: string;
  lessons: ILesson[];
}

export interface ILesson {
  title: string;
  content: string;
  document: string;
}

export interface IAnnouncement {
  instructorId: string;
  title: string;
  description: string;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRevenue {
  _id: string;
  course: string;
  enrollment: string;
  studentName: string;
  instructorShare: number;
  adminShare : number
  date: string;
  withdrawable?: boolean;
  courseTitle: string
  price: number
  insWithdrawn?: boolean; 
  admWithdrawn?: boolean; 
  insWithdrawableAmount?: number;
  admWithdrawableAmount?: number;
}



