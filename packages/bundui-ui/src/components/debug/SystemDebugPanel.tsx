/**
 * VTHINK DEBUG PANEL - Performance Monitoring
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function SystemDebugPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Debug Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Debug information and performance metrics
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Build:</span> Development
            </div>
            <div>
              <span className="font-semibold">Mode:</span> Mock DB
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
