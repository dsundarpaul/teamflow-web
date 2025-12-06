"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useMe } from "@/src/hooks/api/users";
import { useTeams } from "@/src/hooks/api/teams";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useProtectedRoute();

  const router = useRouter();

  const { data: userData, isLoading: isUserLoading } = useMe();

  const { data: teamsResponse, isLoading: isTeamsLoading } = useTeams();
  const teams = teamsResponse?.data || [];

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
                Welcome back, {userData?.username || userData?.email}
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Teams</CardTitle>
                  <Button onClick={() => router.push("/teams/create")}>
                    Create Team
                  </Button>
                </div>
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
                    <p className="text-muted-foreground mb-4">
                      No teams yet. Create your first team to get started.
                    </p>
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

