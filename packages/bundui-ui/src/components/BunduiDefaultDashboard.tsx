"use client";

import React from 'react';
import { Button } from './components/ui/button';
import CustomDateRangePicker from './components/custom-date-range-picker';
import { Download } from 'lucide-react';

// Componentes del dashboard default
import { TeamMembersCard } from './dashboard-components/TeamMembersCard';
import { SubscriptionsCard } from './dashboard-components/SubscriptionsCard';
import { TotalRevenueCard } from './dashboard-components/TotalRevenueCard';
import { ChatWidget } from './dashboard-components/ChatWidget';
import { ExerciseMinutes } from './dashboard-components/ExerciseMinutes';
import { LatestPayments } from './dashboard-components/LatestPayments';
import { PaymentMethodCard } from './dashboard-components/PaymentMethodCard';

/**
 * BunduiDefaultDashboard - 100% idéntico al dashboard default de Bundui-Premium
 * 
 * Este dashboard replica exactamente la estructura y componentes del dashboard
 * default de external/bundui-premium/app/dashboard/(auth)/default/page.tsx
 */
export default function BunduiDefaultDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <CustomDateRangePicker />
          <Button>
            <Download />
            <span className="hidden lg:inline">Download</span>
          </Button>
        </div>
      </div>
      <div className="gap-4 space-y-4 lg:grid lg:grid-cols-3 lg:space-y-0">
        <TeamMembersCard />
        <SubscriptionsCard />
        <TotalRevenueCard />
        <ChatWidget />
        <div className="lg:col-span-2">
          <ExerciseMinutes />
        </div>
        <div className="lg:col-span-2">
          <LatestPayments />
        </div>
        <PaymentMethodCard />
      </div>
    </div>
  );
}


