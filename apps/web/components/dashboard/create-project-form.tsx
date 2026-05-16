"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Project } from "@/types/api";

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional()
});

type ProjectForm = z.infer<typeof projectSchema>;

export const CreateProjectForm = ({ onCreated }: { onCreated: (project: Project) => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema)
  });

  const onSubmit = async (values: ProjectForm) => {
    try {
      const { data } = await api.post<{ project: Project }>("/projects", {
        name: values.name,
        description: values.description || null
      });
      toast.success("Project created");
      reset();
      onCreated(data.project);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Project creators automatically become Admins.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-[1fr_1.3fr_auto] md:items-start">
            <div className="form-field">
              <Label htmlFor="project-name">Name</Label>
              <Input id="project-name" placeholder="Website Redesign" {...register("name")} />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div className="form-field">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                className="min-h-10 md:h-10"
                placeholder="Launch plan, owners, milestones"
                {...register("description")}
              />
            </div>
            <Button className="md:mt-7" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
