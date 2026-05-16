import type { TaskPriority, TaskStatus } from "@/types/api";

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
};

export const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

export const formatDate = (value?: string | null) => {
  if (!value) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

export const isOverdue = (value?: string | null, status?: TaskStatus) => {
  if (!value || status === "DONE") return false;
  return new Date(value).getTime() < Date.now();
};
