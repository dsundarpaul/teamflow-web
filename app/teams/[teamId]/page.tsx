"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  useTeam,
  useUpdateTeam,
  useDeleteTeam,
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateMemberRole,
  useLeaveTeam,
  TeamRole,
} from "@/src/hooks/api/teams";
import { useUsers } from "@/src/hooks/api/users";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, LogOut, Shield, User } from "lucide-react";

const updateTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.nativeEnum(TeamRole).optional(),
});

type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;
type AddMemberFormData = z.infer<typeof addMemberSchema>;

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { user: currentUser } = useProtectedRoute();

  const { data: team, isLoading: isTeamLoading } = useTeam(teamId);
  const { data: users } = useUsers({
    page: "0",
    limit: "100",
    sort: "asc",
  });

  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const updateMemberRole = useUpdateMemberRole();
  const leaveTeam = useLeaveTeam();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: updateErrors },
    reset: resetUpdate,
  } = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema),
    values: team
      ? {
          name: team.name,
          description: team.description || "",
          icon: team.icon || "",
        }
      : undefined,
  });

  const {
    register: registerAddMember,
    handleSubmit: handleSubmitAddMember,
    formState: { errors: addMemberErrors },
    reset: resetAddMember,
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
  });

  const isAdmin = team?.members.find(
    (m) => m.userId === currentUser?.id && m.role === TeamRole.ADMIN
  );

  const isMember = team?.members.some((m) => m.userId === currentUser?.id);

  const availableUsers =
    users?.filter(
      (u) => !team?.members.some((m) => m.userId === u.id)
    ) || [];

  const onSubmitUpdate = async (data: UpdateTeamFormData) => {
    if (!isAdmin) return;
    try {
      await updateTeam.mutateAsync({
        id: teamId,
        data: {
          name: data.name,
          description: data.description || undefined,
          icon: data.icon || undefined,
        },
      });
      showSuccessToast("Team updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      showErrorToast(error, "Failed to update team.");
    }
  };

  const onSubmitAddMember = async (data: AddMemberFormData) => {
    if (!isAdmin) return;
    try {
      await addMember.mutateAsync({
        teamId,
        data: {
          userId: data.userId,
          role: data.role || TeamRole.MEMBER,
        },
      });
      showSuccessToast("Member added successfully!");
      setIsAddMemberDialogOpen(false);
      resetAddMember();
    } catch (error) {
      showErrorToast(error, "Failed to add member.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!isAdmin) return;
    if (
      confirm(
        "Are you sure you want to remove this member from the team?"
      )
    ) {
      try {
        await removeMember.mutateAsync({ teamId, userId });
        showSuccessToast("Member removed successfully!");
      } catch (error) {
        showErrorToast(error, "Failed to remove member.");
      }
    }
  };

  const handleUpdateRole = async (userId: string, role: TeamRole) => {
    if (!isAdmin) return;
    try {
      await updateMemberRole.mutateAsync({
        teamId,
        userId,
        data: { role },
      });
      showSuccessToast("Member role updated successfully!");
    } catch (error) {
      showErrorToast(error, "Failed to update member role.");
    }
  };

  const handleLeaveTeam = async () => {
    if (
      confirm(
        "Are you sure you want to leave this team? You will need to be re-invited to rejoin."
      )
    ) {
      try {
        await leaveTeam.mutateAsync(teamId);
        showSuccessToast("You have left the team.");
        router.push("/dashboard");
      } catch (error) {
        showErrorToast(error, "Failed to leave team.");
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (!isAdmin) return;
    if (
      confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      try {
        await deleteTeam.mutateAsync(teamId);
        showSuccessToast("Team deleted successfully!");
        router.push("/dashboard");
      } catch (error) {
        showErrorToast(error, "Failed to delete team.");
      }
    }
  };

  if (isTeamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Team not found</p>
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
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{team.name}</h1>
                  {isAdmin && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                {team.description && (
                  <p className="text-muted-foreground mt-2">{team.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <>
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">Edit Team</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team</DialogTitle>
                          <DialogDescription>
                            Update team information. Click save when you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleSubmitUpdate(onSubmitUpdate)}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="name">Team Name</Label>
                            <Input
                              id="name"
                              {...registerUpdate("name")}
                              placeholder="Team name"
                            />
                            {updateErrors.name && (
                              <p className="text-sm text-destructive">
                                {updateErrors.name.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">
                              Description (Optional)
                            </Label>
                            <Input
                              id="description"
                              {...registerUpdate("description")}
                              placeholder="Team description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="icon">Icon URL (Optional)</Label>
                            <Input
                              id="icon"
                              {...registerUpdate("icon")}
                              placeholder="https://example.com/icon.png"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={updateTeam.isPending}
                            >
                              {updateTeam.isPending ? "Updating..." : "Update"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive">Delete Team</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Team</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this team? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteTeam}
                            disabled={deleteTeam.isPending}
                          >
                            {deleteTeam.isPending ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {isMember && !isAdmin && (
                  <Button variant="outline" onClick={handleLeaveTeam}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Team
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage team members and their roles
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Dialog
                      open={isAddMemberDialogOpen}
                      onOpenChange={setIsAddMemberDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Team Member</DialogTitle>
                          <DialogDescription>
                            Add a user to this team. They will be added as a
                            member by default.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleSubmitAddMember(onSubmitAddMember)}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="userId">User</Label>
                            <select
                              id="userId"
                              {...registerAddMember("userId")}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Select a user</option>
                              {availableUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.username} ({user.email})
                                </option>
                              ))}
                            </select>
                            {addMemberErrors.userId && (
                              <p className="text-sm text-destructive">
                                {addMemberErrors.userId.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <select
                              id="role"
                              {...registerAddMember("role")}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              defaultValue={TeamRole.MEMBER}
                            >
                              <option value={TeamRole.MEMBER}>Member</option>
                              <option value={TeamRole.ADMIN}>Admin</option>
                            </select>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddMemberDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={addMember.isPending}
                            >
                              {addMember.isPending ? "Adding..." : "Add"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {team.members && team.members.length > 0 ? (
                  <div className="space-y-3">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                            {member.role === TeamRole.ADMIN ? (
                              <Shield className="h-5 w-5 text-primary" />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {member.user.username}
                              </p>
                              <Badge
                                variant={
                                  member.role === TeamRole.ADMIN
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {member.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                        {isAdmin && member.userId !== currentUser?.id && (
                          <div className="flex items-center gap-2">
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleUpdateRole(
                                  member.userId,
                                  e.target.value as TeamRole
                                )
                              }
                              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                              disabled={updateMemberRole.isPending}
                            >
                              <option value={TeamRole.MEMBER}>Member</option>
                              <option value={TeamRole.ADMIN}>Admin</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.userId)}
                              disabled={removeMember.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No members yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
