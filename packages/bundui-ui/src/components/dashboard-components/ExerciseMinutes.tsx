"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Progress } from "./components/ui/progress";

export function ExerciseMinutes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Minutes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>Goal: 30 minutes</span>
          <span className="text-muted-foreground">25 minutes</span>
        </div>
        <Progress value={83} className="w-full" />
        <div className="text-xs text-muted-foreground">
          You're 83% of the way to your daily goal.
        </div>
      </CardContent>
    </Card>
  );
}


