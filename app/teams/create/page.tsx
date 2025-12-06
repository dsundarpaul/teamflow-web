"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useCreateTeam } from "@/src/hooks/api/teams";
import { showErrorToast, showSuccessToast } from "@/lib/error-handler";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z
    .string()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      "Must be a valid URL"
    )
    .optional(),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export default function CreateTeamPage() {
  const router = useRouter();
  const { user } = useProtectedRoute();
  const createTeam = useCreateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
  });

  const onSubmit = async (data: CreateTeamFormData) => {
    try {
      const team = await createTeam.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        icon: data.icon || undefined,
      });
      showSuccessToast("Team created successfully!");
      router.push(`/teams/${team.id}`);
    } catch (error) {
      showErrorToast(error, "Failed to create team. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Create New Team</CardTitle>
                <CardDescription>
                  Create a new team to collaborate with others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="My Team"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description (Optional)
                    </Label>
                    <Input
                      id="description"
                      {...register("description")}
                      placeholder="Team description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon URL (Optional)</Label>
                    <Input
                      id="icon"
                      {...register("icon")}
                      placeholder="https://example.com/icon.png"
                    />
                    {errors.icon && (
                      <p className="text-sm text-destructive">
                        {errors.icon.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTeam.isPending}>
                      {createTeam.isPending ? "Creating..." : "Create Team"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

