import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { ProjectListItem } from "@/types/api";

export const ProjectCard = ({ project }: { project: ProjectListItem }) => {
  const completion =
    project.counts.tasks === 0
      ? 0
      : Math.round((project.counts.completedTasks / project.counts.tasks) * 100);

  return (
    <Card className="transition-transform hover:-translate-y-0.5">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{project.name}</CardTitle>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {project.description || "No description added yet."}
            </p>
          </div>
          <Badge variant={project.currentUserRole === "ADMIN" ? "default" : "secondary"}>
            {project.currentUserRole}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completion}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-md bg-secondary/70 p-3">
            <Users className="mb-2 h-4 w-4 text-primary" />
            <p className="font-semibold">{project.counts.members}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div className="rounded-md bg-secondary/70 p-3">
            <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-500" />
            <p className="font-semibold">{project.counts.tasks}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>
          <div className="rounded-md bg-secondary/70 p-3">
            <CalendarClock className="mb-2 h-4 w-4 text-amber-500" />
            <p className="font-semibold">{project.counts.overdueTasks}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Updated {formatDate(project.updatedAt)}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${project.id}`}>
              Open
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
