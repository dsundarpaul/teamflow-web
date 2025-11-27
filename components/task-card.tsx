"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/api/tasks";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const statusColors = {
  todo: "bg-gray-500 text-white",
  in_progress: "bg-blue-500 text-white",
  done: "bg-green-500 text-white",
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            {task.description && <CardDescription className="mt-2">{task.description}</CardDescription>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge className={statusColors[task.status]}>{task.status.replace("_", " ")}</Badge>
          <p className="text-xs text-muted-foreground">
            {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

