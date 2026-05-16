"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, FolderKanban, Timer } from "lucide-react";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectCard } from "@/components/dashboard/project-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Project, ProjectListItem } from "@/types/api";

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<{ projects: ProjectListItem[] }>("/projects");
      return data.projects;
    }
  });

  const projects = projectsQuery.data ?? [];
  const totalTasks = projects.reduce((sum, project) => sum + project.counts.tasks, 0);
  const completedTasks = projects.reduce(
    (sum, project) => sum + project.counts.completedTasks,
    0
  );
  const overdueTasks = projects.reduce((sum, project) => sum + project.counts.overdueTasks, 0);

  const handleProjectCreated = (project: Project) => {
    queryClient.setQueryData<ProjectListItem[]>(["projects"], (current = []) => [
      {
        ...project,
        counts: {
          members: project._count?.members ?? 1,
          tasks: project._count?.tasks ?? 0,
          completedTasks: 0,
          overdueTasks: 0
        }
      },
      ...current
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Project dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track ownership, task health, and team workload across active projects.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} />
        <StatCard label="Total tasks" value={totalTasks} icon={ClipboardList} />
        <StatCard label="Completed" value={completedTasks} icon={CheckCircle2} tone="success" />
        <StatCard label="Overdue" value={overdueTasks} icon={Timer} tone="danger" />
      </div>

      <CreateProjectForm onCreated={handleProjectCreated} />

      {projectsQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </div>
      )}

      {!projectsQuery.isLoading && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start adding members, assigning work, and tracking progress."
        />
      )}

      {projects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
