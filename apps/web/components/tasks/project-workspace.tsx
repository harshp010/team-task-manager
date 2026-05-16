"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDate, isOverdue, priorityLabels, statusLabels } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Project,
  ProjectDashboard,
  ProjectMember,
  Task,
  TaskPriority,
  TaskStatus
} from "@/types/api";

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

const taskFormSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assigneeId: z.string().optional()
});

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"])
});

type TaskFormValues = z.infer<typeof taskFormSchema>;
type AddMemberValues = z.infer<typeof addMemberSchema>;

const toInputDate = (value?: string | null) => (value ? value.slice(0, 10) : "");
const toApiDueDate = (value?: string) => (value ? new Date(`${value}T12:00:00`).toISOString() : null);

const priorityVariant = (priority: TaskPriority) => {
  if (priority === "HIGH") return "danger";
  if (priority === "MEDIUM") return "warning";
  return "secondary";
};

const statusVariant = (status: TaskStatus) => {
  if (status === "DONE") return "success";
  if (status === "IN_PROGRESS") return "warning";
  return "secondary";
};

export const ProjectWorkspace = ({ projectId }: { projectId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | TaskStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<"ALL" | TaskPriority>("ALL");
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await api.get<{ project: Project }>(`/projects/${projectId}`);
      return data.project;
    }
  });

  const dashboardQuery = useQuery({
    queryKey: ["project-dashboard", projectId],
    queryFn: async () => {
      const { data } = await api.get<{ dashboard: ProjectDashboard }>(
        `/projects/${projectId}/dashboard`
      );
      return data.dashboard;
    }
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", projectId, statusFilter, priorityFilter],
    queryFn: async () => {
      const { data } = await api.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`, {
        params: {
          status: statusFilter === "ALL" ? undefined : statusFilter,
          priority: priorityFilter === "ALL" ? undefined : priorityFilter
        }
      });
      return data.tasks;
    }
  });

  const project = projectQuery.data;
  const dashboard = dashboardQuery.data;
  const tasks = tasksQuery.data ?? [];
  const isAdmin = project?.currentUserRole === "ADMIN";

  const invalidateWorkspace = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, values }: { taskId: string; values: Partial<TaskFormValues> }) => {
      const { data } = await api.patch<{ task: Task }>(`/tasks/${taskId}`, values);
      return data.task;
    },
    onSuccess: () => {
      invalidateWorkspace();
      toast.success("Task updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      invalidateWorkspace();
      toast.success("Task deleted");
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  if (projectQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-sm text-muted-foreground">Project not found or no longer accessible.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-normal">{project.name}</h1>
            <Badge variant={isAdmin ? "default" : "secondary"}>{project.currentUserRole}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {project.description || "No project description added yet."}
          </p>
        </div>
      </div>

      <Analytics dashboard={dashboard} isLoading={dashboardQuery.isLoading} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {isAdmin && (
            <TaskForm
              projectId={projectId}
              members={project.members}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
              onSaved={() => {
                setEditingTask(null);
                invalidateWorkspace();
              }}
            />
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>
                    {isAdmin
                      ? "Manage all project tasks and assignments."
                      : "View assigned work and update progress."}
                  </CardDescription>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "ALL" | TaskStatus)}
                  >
                    <option value="ALL">All statuses</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </Select>
                  <Select
                    aria-label="Filter by priority"
                    value={priorityFilter}
                    onChange={(event) =>
                      setPriorityFilter(event.target.value as "ALL" | TaskPriority)
                    }
                  >
                    <option value="ALL">All priorities</option>
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TaskTable
                tasks={tasks}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                isLoading={tasksQuery.isLoading}
                onEdit={setEditingTask}
                onStatusChange={(task, status) =>
                  updateTaskMutation.mutate({ taskId: task.id, values: { status } })
                }
                onDelete={(task) => deleteTaskMutation.mutate(task.id)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <MembersPanel projectId={projectId} members={project.members} isAdmin={isAdmin} />
          <ActivityPanel dashboard={dashboard} />
        </div>
      </div>
    </div>
  );
};

const Analytics = ({
  dashboard,
  isLoading
}: {
  dashboard?: ProjectDashboard;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    );
  }

  const total = dashboard?.totalTasks ?? 0;
  const done = dashboard?.byStatus.find((item) => item.status === "DONE")?.count ?? 0;
  const inProgress =
    dashboard?.byStatus.find((item) => item.status === "IN_PROGRESS")?.count ?? 0;
  const overdue = dashboard?.overdue.count ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Metric label="Total tasks" value={total} icon={Activity} />
      <Metric label="In progress" value={inProgress} icon={CalendarClock} tone="warning" />
      <Metric label="Done" value={done} icon={CheckCircle2} tone="success" />
      <Metric label="Overdue" value={overdue} icon={CalendarClock} tone="danger" />
    </div>
  );
};

const Metric = ({
  label,
  value,
  icon: Icon,
  tone = "default"
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  tone?: "default" | "success" | "warning" | "danger";
}) => {
  const tones = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    danger: "bg-red-500/10 text-red-500"
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-md", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
};

const TaskForm = ({
  projectId,
  members,
  editingTask,
  onCancelEdit,
  onSaved
}: {
  projectId: string;
  members: ProjectMember[];
  editingTask: Task | null;
  onCancelEdit: () => void;
  onSaved: () => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      priority: "MEDIUM",
      status: "TODO",
      assigneeId: ""
    }
  });

  React.useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? "",
        dueDate: toInputDate(editingTask.dueDate),
        priority: editingTask.priority,
        status: editingTask.status,
        assigneeId: editingTask.assigneeId ?? ""
      });
    } else {
      reset({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        status: "TODO",
        assigneeId: ""
      });
    }
  }, [editingTask, reset]);

  const onSubmit = async (values: TaskFormValues) => {
    const payload = {
      ...values,
      description: values.description || null,
      dueDate: toApiDueDate(values.dueDate),
      assigneeId: values.assigneeId || null
    };

    try {
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, payload);
        toast.success("Task updated");
      } else {
        await api.post(`/projects/${projectId}/tasks`, payload);
        toast.success("Task created");
      }
      reset();
      onSaved();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{editingTask ? "Edit task" : "Create task"}</CardTitle>
            <CardDescription>Admins can manage the full task record and assignment.</CardDescription>
          </div>
          {editingTask && (
            <Button variant="outline" size="sm" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-field">
              <Label htmlFor="task-title">Title</Label>
              <Input id="task-title" placeholder="Prepare launch checklist" {...register("title")} />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>
            <div className="form-field">
              <Label htmlFor="task-assignee">Assigned user</Label>
              <Select id="task-assignee" {...register("assigneeId")}>
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="form-field">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Scope, acceptance criteria, links"
              {...register("description")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="form-field">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input id="task-due-date" type="date" {...register("dueDate")} />
            </div>
            <div className="form-field">
              <Label htmlFor="task-priority">Priority</Label>
              <Select id="task-priority" {...register("priority")}>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="form-field">
              <Label htmlFor="task-status">Status</Label>
              <Select id="task-status" {...register("status")}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingTask ? "Save changes" : "Create task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TaskTable = ({
  tasks,
  currentUserId,
  isAdmin,
  isLoading,
  onEdit,
  onStatusChange,
  onDelete
}: {
  tasks: Task[];
  currentUserId?: string;
  isAdmin: boolean;
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}) => {
  if (isLoading) {
    return <Skeleton className="h-72" />;
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No tasks match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="hidden grid-cols-[1.4fr_130px_120px_150px_130px] gap-4 border-b bg-secondary/70 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground md:grid">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Assignee</span>
        <span className="text-right">Actions</span>
      </div>
      <div className="divide-y">
        {tasks.map((task) => {
          const canUpdateStatus = isAdmin || task.assigneeId === currentUserId;
          const overdue = isOverdue(task.dueDate, task.status);

          return (
            <div
              key={task.id}
              className={cn(
                "grid gap-4 p-4 md:grid-cols-[1.4fr_130px_120px_150px_130px] md:items-center",
                overdue && "bg-red-500/5"
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{task.title}</p>
                  {overdue && <Badge variant="danger">Overdue</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {task.description || "No description."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Due {formatDate(task.dueDate)}</p>
              </div>
              <div>
                {canUpdateStatus ? (
                  <Select
                    value={task.status}
                    onChange={(event) => onStatusChange(task, event.target.value as TaskStatus)}
                    aria-label={`Update status for ${task.title}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Badge variant={statusVariant(task.status)}>{statusLabels[task.status]}</Badge>
                )}
              </div>
              <Badge variant={priorityVariant(task.priority)}>{priorityLabels[task.priority]}</Badge>
              <p className="truncate text-sm text-muted-foreground">
                {task.assignee?.name || "Unassigned"}
              </p>
              <div className="flex justify-start gap-2 md:justify-end">
                {isAdmin && (
                  <>
                    <Button variant="outline" size="icon" aria-label="Edit task" onClick={() => onEdit(task)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label="Delete task"
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MembersPanel = ({
  projectId,
  members,
  isAdmin
}: {
  projectId: string;
  members: ProjectMember[];
  isAdmin: boolean;
}) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      role: "MEMBER"
    }
  });

  const invalidateMembers = () => {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
  };

  const onSubmit = async (values: AddMemberValues) => {
    try {
      await api.post(`/projects/${projectId}/members`, values);
      toast.success("Member added");
      reset({ email: "", role: "MEMBER" });
      invalidateMembers();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const removeMember = async (member: ProjectMember) => {
    try {
      await api.delete(`/projects/${projectId}/members/${member.userId}`);
      toast.success("Member removed");
      invalidateMembers();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>{members.length} people have access to this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdmin && (
          <form className="space-y-3 rounded-lg border bg-secondary/40 p-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-field">
              <Label htmlFor="member-email">Email</Label>
              <Input id="member-email" type="email" placeholder="member@example.com" {...register("email")} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Select aria-label="Member role" {...register("role")}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <Button disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add
              </Button>
            </div>
          </form>
        )}
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>{member.role}</Badge>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${member.user.name}`}
                    onClick={() => removeMember(member)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityPanel = ({ dashboard }: { dashboard?: ProjectDashboard }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent activity</CardTitle>
      <CardDescription>Latest changes inside this project.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {(dashboard?.recentActivity ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        )}
        {(dashboard?.recentActivity ?? []).map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
            <div>
              <p className="text-sm">{item.message}</p>
              <p className="text-xs text-muted-foreground">
                {item.actor?.name || "System"} · {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
