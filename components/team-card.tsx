"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/lib/api/teams";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
          {team.description && <CardDescription>{team.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Created {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

