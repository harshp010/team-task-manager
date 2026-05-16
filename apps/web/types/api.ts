export type ProjectRole = "ADMIN" | "MEMBER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectMember = {
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  user: User;
};

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  currentUserRole: ProjectRole;
  createdAt: string;
  updatedAt: string;
  counts: {
    members: number;
    tasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
};

export type Project = ProjectListItem & {
  members: ProjectMember[];
  _count: {
    members: number;
    tasks: number;
  };
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  assignee: User | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  actor: User | null;
  task: Pick<Task, "id" | "title"> | null;
};

export type ProjectDashboard = {
  totalTasks: number;
  byStatus: Array<{
    status: TaskStatus;
    label: string;
    count: number;
  }>;
  overdue: {
    count: number;
    tasks: Array<Pick<Task, "id" | "title" | "dueDate" | "priority" | "status" | "assignee">>;
  };
  tasksPerUser: Array<{
    assigneeId: string | null;
    user: User | null;
    count: number;
  }>;
  recentActivity: Activity[];
};
