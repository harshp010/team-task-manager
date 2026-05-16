import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  ActivityAction,
  PrismaClient,
  ProjectRole,
  TaskPriority,
  TaskStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Avery Admin",
      passwordHash
    },
    create: {
      name: "Avery Admin",
      email: "admin@example.com",
      passwordHash
    }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {
      name: "Mina Member",
      passwordHash
    },
    create: {
      name: "Mina Member",
      email: "member@example.com",
      passwordHash
    }
  });

  const existingProject = await prisma.project.findFirst({
    where: {
      name: "Website Redesign",
      createdById: admin.id
    }
  });

  const project =
    existingProject ??
    (await prisma.project.create({
      data: {
        name: "Website Redesign",
        description: "Launch a polished company website with a tighter task workflow.",
        createdById: admin.id
      }
    }));

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: admin.id
      }
    },
    update: { role: ProjectRole.ADMIN },
    create: {
      projectId: project.id,
      userId: admin.id,
      role: ProjectRole.ADMIN
    }
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: member.id
      }
    },
    update: { role: ProjectRole.MEMBER },
    create: {
      projectId: project.id,
      userId: member.id,
      role: ProjectRole.MEMBER
    }
  });

  const seedTasks = [
    {
      title: "Create dashboard wireframes",
      description: "Draft the main dashboard and project detail screens.",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      assigneeId: member.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Set up Railway deployment",
      description: "Prepare environment variables and deployment commands.",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      assigneeId: admin.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Review overdue task styling",
      description: "Make overdue tasks visually obvious in the task table.",
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
      assigneeId: member.id,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  for (const taskData of seedTasks) {
    const existingTask = await prisma.task.findFirst({
      where: {
        projectId: project.id,
        title: taskData.title
      }
    });

    if (existingTask) {
      await prisma.task.update({
        where: { id: existingTask.id },
        data: taskData
      });
    } else {
      await prisma.task.create({
        data: {
          ...taskData,
          projectId: project.id,
          createdById: admin.id
        }
      });
    }
  }

  await prisma.activity.deleteMany({
    where: { projectId: project.id }
  });

  await prisma.activity.createMany({
    data: [
      {
        action: ActivityAction.PROJECT_CREATED,
        message: "Project created",
        actorId: admin.id,
        projectId: project.id
      },
      {
        action: ActivityAction.MEMBER_ADDED,
        message: `${member.name} was added to the project`,
        actorId: admin.id,
        projectId: project.id
      },
      {
        action: ActivityAction.TASK_CREATED,
        message: "Task created: Create dashboard wireframes",
        actorId: admin.id,
        projectId: project.id
      }
    ]
  });

  console.log("Seed complete");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
