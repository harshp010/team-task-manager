import { ActivityAction, ProjectRole, type Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import type {
  AddMemberInput,
  CreateProjectInput,
  UpdateProjectInput
} from "./project.schemas.js";

const memberUserSelect = {
  id: true,
  name: true,
  email: true
} satisfies Prisma.UserSelect;

export const getProjectMembership = async (projectId: string, userId: string) => {
  return prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });
};

export const requireProjectMembership = async (projectId: string, userId: string) => {
  const membership = await getProjectMembership(projectId, userId);

  if (!membership) {
    throw new HttpError(403, "You do not have access to this project");
  }

  return membership;
};

export const requireProjectRole = async (
  projectId: string,
  userId: string,
  allowedRoles: ProjectRole[]
) => {
  const membership = await requireProjectMembership(projectId, userId);

  if (!allowedRoles.includes(membership.role)) {
    throw new HttpError(403, "You do not have permission to perform this action");
  }

  return membership;
};

export const listProjects = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      members: {
        where: { userId },
        select: { role: true }
      },
      tasks: {
        select: {
          status: true,
          dueDate: true
        }
      },
      _count: {
        select: {
          members: true,
          tasks: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const now = new Date();

  return projects.map(({ members, tasks, _count, ...project }) => ({
    ...project,
    currentUserRole: members[0]?.role,
    counts: {
      members: _count.members,
      tasks: _count.tasks,
      completedTasks: tasks.filter((task) => task.status === "DONE").length,
      overdueTasks: tasks.filter(
        (task) => task.dueDate && task.dueDate < now && task.status !== "DONE"
      ).length
    }
  }));
};

export const createProject = async (userId: string, input: CreateProjectInput) => {
  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        name: input.name,
        description: input.description,
        createdById: userId
      }
    });

    await tx.projectMember.create({
      data: {
        projectId: createdProject.id,
        userId,
        role: ProjectRole.ADMIN
      }
    });

    await tx.activity.create({
      data: {
        action: ActivityAction.PROJECT_CREATED,
        message: "Project created",
        actorId: userId,
        projectId: createdProject.id
      }
    });

    return createdProject;
  });

  return getProject(project.id, userId);
};

export const getProject = async (projectId: string, userId: string) => {
  const membership = await requireProjectMembership(projectId, userId);
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        include: {
          user: {
            select: memberUserSelect
          }
        }
      },
      _count: {
        select: {
          members: true,
          tasks: true
        }
      }
    }
  });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return {
    ...project,
    currentUserRole: membership.role
  };
};

export const updateProject = async (
  projectId: string,
  userId: string,
  input: UpdateProjectInput
) => {
  await requireProjectRole(projectId, userId, [ProjectRole.ADMIN]);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      description: input.description
    }
  });

  await prisma.activity.create({
    data: {
      action: ActivityAction.PROJECT_UPDATED,
      message: "Project details updated",
      actorId: userId,
      projectId
    }
  });

  return project;
};

export const deleteProject = async (projectId: string, userId: string) => {
  await requireProjectRole(projectId, userId, [ProjectRole.ADMIN]);

  await prisma.project.delete({
    where: { id: projectId }
  });
};

export const listProjectMembers = async (projectId: string, userId: string) => {
  await requireProjectMembership(projectId, userId);

  return prisma.projectMember.findMany({
    where: { projectId },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    include: {
      user: {
        select: memberUserSelect
      }
    }
  });
};

export const addProjectMember = async (
  projectId: string,
  userId: string,
  input: AddMemberInput
) => {
  await requireProjectRole(projectId, userId, [ProjectRole.ADMIN]);

  const userToAdd = await prisma.user.findUnique({
    where: { email: input.email },
    select: memberUserSelect
  });

  if (!userToAdd) {
    throw new HttpError(404, "No user exists with that email address");
  }

  const existingMembership = await getProjectMembership(projectId, userToAdd.id);

  if (existingMembership) {
    throw new HttpError(409, "User is already a project member");
  }

  const membership = await prisma.projectMember.create({
    data: {
      projectId,
      userId: userToAdd.id,
      role: input.role
    },
    include: {
      user: {
        select: memberUserSelect
      }
    }
  });

  await prisma.activity.create({
    data: {
      action: ActivityAction.MEMBER_ADDED,
      message: `${userToAdd.name} was added to the project`,
      actorId: userId,
      projectId,
      metadata: {
        memberId: userToAdd.id,
        role: input.role
      }
    }
  });

  return membership;
};

export const removeProjectMember = async (
  projectId: string,
  actingUserId: string,
  memberUserId: string
) => {
  await requireProjectRole(projectId, actingUserId, [ProjectRole.ADMIN]);

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: memberUserId
      }
    },
    include: {
      user: {
        select: memberUserSelect
      }
    }
  });

  if (!membership) {
    throw new HttpError(404, "Project member not found");
  }

  if (membership.role === ProjectRole.ADMIN) {
    const adminCount = await prisma.projectMember.count({
      where: {
        projectId,
        role: ProjectRole.ADMIN
      }
    });

    if (adminCount <= 1) {
      throw new HttpError(400, "A project must keep at least one admin");
    }
  }

  await prisma.$transaction([
    prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberUserId
        }
      }
    }),
    prisma.activity.create({
      data: {
        action: ActivityAction.MEMBER_REMOVED,
        message: `${membership.user.name} was removed from the project`,
        actorId: actingUserId,
        projectId,
        metadata: {
          memberId: memberUserId
        }
      }
    })
  ]);
};
