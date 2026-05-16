import { ProjectWorkspace } from "@/components/tasks/project-workspace";

export default async function ProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkspace projectId={projectId} />;
}
