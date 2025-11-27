"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { projectsApi } from "@/lib/api/projects";
import { tasksApi, Task } from "@/lib/api/tasks";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useProtectedRoute();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => projectsApi.getProject(projectId),
    enabled: !!user && !!projectId,
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => tasksApi.listTasks(projectId),
    enabled: !!user && !!projectId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) =>
      tasksApi.createTask({ ...data, projectId, status: data.status || "todo" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsCreateDialogOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskFormData }) =>
      tasksApi.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsEditDialogOpen(false);
      setEditingTask(null);
    },
  });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmitCreate = async (data: TaskFormData) => {
    await createTaskMutation.mutateAsync(data);
    resetCreate();
  };

  const onSubmitEdit = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ taskId: editingTask.id, data });
      resetEdit();
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    resetEdit({
      title: task.title,
      description: task.description || "",
      status: task.status,
    });
    setIsEditDialogOpen(true);
  };

  if (isProjectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{project?.name}</h1>
                {project?.description && (
                  <p className="text-muted-foreground mt-2">{project.description}</p>
                )}
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task to this project. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-title">Task Title</Label>
                      <Input
                        id="create-title"
                        {...registerCreate("title")}
                        placeholder="Task title"
                      />
                      {createErrors.title && (
                        <p className="text-sm text-destructive">{createErrors.title.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-description">Description (Optional)</Label>
                      <Input
                        id="create-description"
                        {...registerCreate("description")}
                        placeholder="Task description"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>All tasks in this project</CardDescription>
              </CardHeader>
              <CardContent>
                {isTasksLoading ? (
                  <p>Loading tasks...</p>
                ) : tasks && tasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tasks yet. Create one to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>Update task details. Click save when you're done.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Task Title</Label>
                    <Input id="edit-title" {...registerEdit("title")} placeholder="Task title" />
                    {editErrors.title && (
                      <p className="text-sm text-destructive">{editErrors.title.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description (Optional)</Label>
                    <Input
                      id="edit-description"
                      {...registerEdit("description")}
                      placeholder="Task description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      {...registerEdit("status")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setEditingTask(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateTaskMutation.isPending}>
                      {updateTaskMutation.isPending ? "Updating..." : "Update"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}

