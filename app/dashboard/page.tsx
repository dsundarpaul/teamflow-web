"use client";

import { useQuery } from "@tanstack/react-query";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { usersApi } from "@/lib/api/users";
import { teamsApi } from "@/lib/api/teams";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useProtectedRoute();

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => usersApi.getMe(),
    enabled: !!user,
  });

  const { data: teams, isLoading: isTeamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.listTeams(),
    enabled: !!user,
  });

  if (isAuthLoading || isUserLoading) {
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
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {userData?.name || userData?.email}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Teams</CardTitle>
              </CardHeader>
              <CardContent>
                {isTeamsLoading ? (
                  <p>Loading teams...</p>
                ) : teams && teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                      <TeamCard key={team.id} team={team} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No teams yet</p>
                    <Button>Create Team</Button>
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

