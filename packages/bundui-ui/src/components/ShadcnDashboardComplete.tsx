"use client";

/**
 * ShadcnDashboardComplete - VThink 1.0
 * 
 * Dashboard completo que replica exactamente el design de shadcnuikit.com/dashboard/default
 * Usando únicamente componentes Bundui Premium desacoplados con theming completo
 */

import React, { useState } from 'react';

// UI Components
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from './components/ui/table';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { Progress } from './components/ui/progress';

// Layout Components - Complete Bundui Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Chart Components
import { BunduiTotalRevenueChart } from '@/shared/components/dashboard/BunduiTotalRevenueChart';
import { BunduiExerciseMinutes } from '@/shared/components/dashboard/BunduiExerciseMinutes';

// Icons
import { Download, CreditCard, DollarSign, Users, Activity } from 'lucide-react';

interface ShadcnDashboardCompleteProps {
  withLayout?: boolean;
}

/**
 * Componente principal del dashboard completo
 */
const ShadcnDashboardComplete: React.FC<ShadcnDashboardCompleteProps> = ({ 
  withLayout = false 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Mock data para latest payments
  const latestPayments = [
    {
      id: '1',
      customer: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      amount: '+$1,999.00',
      avatar: 'OM'
    },
    {
      id: '2', 
      customer: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      amount: '+$39.00',
      avatar: 'JL'
    },
    {
      id: '3',
      customer: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      amount: '+$299.00',
      avatar: 'IN'
    },
    {
      id: '4',
      customer: 'William Kim',
      email: 'will@email.com',
      amount: '+$99.00',
      avatar: 'WK'
    },
    {
      id: '5',
      customer: 'Sofia Davis',
      email: 'sofia.davis@email.com',
      amount: '+$39.00',
      avatar: 'SD'
    }
  ];

  // Mock data para team members
  const teamMembers = [
    { name: 'Sofia Davis', role: 'UI/UX Designer', avatar: 'SD' },
    { name: 'Jackson Lee', role: 'Frontend Developer', avatar: 'JL' },
    { name: 'Isabella Nguyen', role: 'Product Manager', avatar: 'IN' },
    { name: 'William Kim', role: 'Backend Developer', avatar: 'WK' },
    { name: 'Olivia Martin', role: 'DevOps Engineer', avatar: 'OM' }
  ];

  const dashboardContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VibeThink Dashboard</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            29 Jun 2025 - 26 Jul 2025
          </div>
          <Button size="sm" className="ml-auto gap-1">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+180.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+19%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+201</span> since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - First Row: Overview Chart + Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Chart Section - Using exact Bundui component */}
        <div className="col-span-4">
          <BunduiTotalRevenueChart />
        </div>

        {/* Recent Sales */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              You made 265 sales this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {latestPayments.map((payment) => (
                <div key={payment.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{payment.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {payment.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {payment.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Exercise Minutes + Latest Payments Table */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Exercise Minutes Card - Using exact Bundui component */}
        <div className="col-span-4">
          <BunduiExerciseMinutes />
        </div>

        {/* Latest Payments Table */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Latest Payments</CardTitle>
            <CardDescription>
              Recent payment transactions from your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestPayments.slice(0, 3).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{payment.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">{payment.customer}</div>
                          <div className="text-xs text-muted-foreground">{payment.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {payment.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Team Members + Payment Method */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Team Members Card */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team members and their account permissions here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{member.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Add a new payment method to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CreditCard className="mb-3 h-6 w-6" />
                  Card
                </Label>
              </div>
              <div>
                <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                <Label
                  htmlFor="paypal"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.298-.93 4.778-4.005 6.45-7.935 6.45h-1.934c-.394 0-.715.29-.772.683L8.023 21.25a.384.384 0 0 0 .379.441h3.46c.394 0 .715-.29.772-.683l.637-4.034h1.295c3.486 0 6.212-1.418 7.012-5.51.47-2.41-.063-4.362-1.356-5.537z"/>
                  </svg>
                  PayPal
                </Label>
              </div>
              <div>
                <RadioGroupItem value="apple" id="apple" className="peer sr-only" />
                <Label
                  htmlFor="apple"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </Label>
              </div>
            </RadioGroup>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="First Last" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number">Card number</Label>
              <Input id="number" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Expires</Label>
                <Input id="month" placeholder="MM/YY" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="CVC" />
              </div>
            </div>
            <Button className="w-full">Continue</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (withLayout) {
    return (
      <DashboardLayout>
        {dashboardContent}
      </DashboardLayout>
    );
  }

  return dashboardContent;
};

export default ShadcnDashboardComplete;
