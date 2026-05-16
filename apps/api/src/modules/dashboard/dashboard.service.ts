import { ProjectRole, TaskStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { requireProjectMembership } from "../projects/project.service.js";

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
};

export const getProjectDashboard = async (projectId: string, userId: string) => {
  const membership = await requireProjectMembership(projectId, userId);
  const taskScope: Prisma.TaskWhereInput = {
    projectId,
    ...(membership.role === ProjectRole.MEMBER ? { assigneeId: userId } : {})
  };
  const now = new Date();

  const [totalTasks, statusRows, overdueTasks, perUserRows, recentActivity] =
    await prisma.$transaction([
      prisma.task.count({ where: taskScope }),
      prisma.task.groupBy({
        by: ["status"],
        where: taskScope,
        _count: { id: true },
        orderBy: { status: "asc" }
      }),
      prisma.task.findMany({
        where: {
          ...taskScope,
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE }
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          status: true,
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { dueDate: "asc" },
        take: 5
      }),
      prisma.task.groupBy({
        by: ["assigneeId"],
        where: taskScope,
        _count: { id: true },
        orderBy: { assigneeId: "asc" }
      }),
      prisma.activity.findMany({
        where: { projectId },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          task: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

  const getGroupCount = (row?: { _count?: true | { id?: number; _all?: number } }) => {
    if (!row || typeof row._count !== "object") return 0;
    return row._count.id ?? row._count._all ?? 0;
  };

  const byStatus = Object.values(TaskStatus).map((status) => ({
    status,
    label: statusLabels[status],
    count: getGroupCount(statusRows.find((row) => row.status === status))
  }));

  const userIds = perUserRows
    .map((row) => row.assigneeId)
    .filter((id): id is string => Boolean(id));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true
    }
  });
  const userMap = new Map(users.map((user) => [user.id, user]));

  return {
    totalTasks,
    byStatus,
    overdue: {
      count: overdueTasks.length,
      tasks: overdueTasks
    },
    tasksPerUser: perUserRows.map((row) => ({
      assigneeId: row.assigneeId,
      user: row.assigneeId ? userMap.get(row.assigneeId) ?? null : null,
      count: getGroupCount(row)
    })),
    recentActivity
  };
};
