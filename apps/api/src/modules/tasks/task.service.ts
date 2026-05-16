import {
  ActivityAction,
  ProjectRole,
  type Prisma,
  TaskPriority,
  TaskStatus
} from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { requireProjectMembership, requireProjectRole } from "../projects/project.service.js";
import type { CreateTaskInput, TaskFilterInput, UpdateTaskInput } from "./task.schemas.js";

const taskInclude = {
  assignee: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.TaskInclude;

const assertAssigneeIsProjectMember = async (projectId: string, assigneeId?: string | null) => {
  if (!assigneeId) return;

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: assigneeId
      }
    }
  });

  if (!membership) {
    throw new HttpError(400, "Assigned user must be a project member");
  }
};

const parseDueDate = (dueDate?: string | null) => {
  if (dueDate === undefined) return undefined;
  if (dueDate === null) return null;
  return new Date(dueDate);
};

export const listTasks = async (
  projectId: string,
  userId: string,
  filters: TaskFilterInput
) => {
  const membership = await requireProjectMembership(projectId, userId);
  const where: Prisma.TaskWhereInput = {
    projectId,
    status: filters.status as TaskStatus | undefined,
    priority: filters.priority as TaskPriority | undefined,
    assigneeId:
      membership.role === ProjectRole.MEMBER ? userId : filters.assigneeId
  };

  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" }
    ]
  });
};

export const createTask = async (
  projectId: string,
  userId: string,
  input: CreateTaskInput
) => {
  await requireProjectRole(projectId, userId, [ProjectRole.ADMIN]);
  await assertAssigneeIsProjectMember(projectId, input.assigneeId);

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      dueDate: parseDueDate(input.dueDate),
      priority: input.priority,
      status: input.status,
      assigneeId: input.assigneeId,
      projectId,
      createdById: userId
    },
    include: taskInclude
  });

  await prisma.activity.create({
    data: {
      action: ActivityAction.TASK_CREATED,
      message: `Task created: ${task.title}`,
      actorId: userId,
      projectId,
      taskId: task.id
    }
  });

  return task;
};

export const updateTask = async (taskId: string, userId: string, input: UpdateTaskInput) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskInclude
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  const membership = await requireProjectMembership(task.projectId, userId);
  const updatedFields = Object.entries(input).filter(([, value]) => value !== undefined);

  if (membership.role === ProjectRole.MEMBER) {
    const isAssignedUser = task.assigneeId === userId;
    const onlyStatusChanged = updatedFields.every(([key]) => key === "status");

    if (!isAssignedUser || !onlyStatusChanged) {
      throw new HttpError(403, "Members can only update status on tasks assigned to them");
    }
  }

  if (membership.role === ProjectRole.ADMIN) {
    await assertAssigneeIsProjectMember(task.projectId, input.assigneeId);
  }

  const updateData: Prisma.TaskUncheckedUpdateInput = {
    title: input.title,
    description: input.description,
    dueDate: parseDueDate(input.dueDate),
    priority: input.priority,
    status: input.status,
    assigneeId: input.assigneeId
  };

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: taskInclude
  });

  const statusChanged = input.status !== undefined && input.status !== task.status;

  await prisma.activity.create({
    data: {
      action: statusChanged ? ActivityAction.TASK_STATUS_CHANGED : ActivityAction.TASK_UPDATED,
      message: statusChanged
        ? `Task moved to ${updatedTask.status.replace("_", " ")}: ${updatedTask.title}`
        : `Task updated: ${updatedTask.title}`,
      actorId: userId,
      projectId: task.projectId,
      taskId: task.id,
      metadata: {
        changedFields: updatedFields.map(([key]) => key)
      }
    }
  });

  return updatedTask;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      projectId: true
    }
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  await requireProjectRole(task.projectId, userId, [ProjectRole.ADMIN]);

  await prisma.$transaction([
    prisma.activity.create({
      data: {
        action: ActivityAction.TASK_DELETED,
        message: `Task deleted: ${task.title}`,
        actorId: userId,
        projectId: task.projectId,
        taskId: task.id
      }
    }),
    prisma.task.delete({
      where: { id: taskId }
    })
  ]);
};
