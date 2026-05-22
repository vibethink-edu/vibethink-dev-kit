"use client";

/**
 * ShadcnStyleDashboard - Dashboard estilo Shadcn UI Kit
 * 
 * Replica el diseño y funcionalidad del dashboard demo oficial de Shadcn UI Kit
 * con componentes premium de Bundui integrados en VibeThink.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Separator } from './components/ui/separator';
import Icon from './components/icon';

// Mock data similar to Shadcn UI Kit demo
const mockData = {
  revenue: {
    total: "$45,231.89",
    percentage: "+20.1%",
    description: "from last month"
  },
  subscriptions: {
    total: "+2350",
    percentage: "+180.1%",
    description: "from last month"
  },
  sales: {
    total: "+12,234",
    percentage: "+19%",
    description: "from last month"
  },
  activeNow: {
    total: "+573",
    percentage: "+201",
    description: "since last hour"
  },
  recentSales: [
    {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      amount: "+$1,999.00",
      avatar: "OM"
    },
    {
      name: "Jackson Lee",
      email: "jackson.lee@email.com", 
      amount: "+$39.00",
      avatar: "JL"
    },
    {
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      amount: "+$299.00",
      avatar: "IN"
    },
    {
      name: "William Kim",
      email: "will@email.com",
      amount: "+$99.00",
      avatar: "WK"
    },
    {
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
      amount: "+$39.00",
      avatar: "SD"
    }
  ]
};

const ShadcnStyleDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("January 20 - February 09");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Here's an overview of your metrics for this month.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Icon name="calendar" className="mr-2 h-4 w-4" />
            {selectedDate}
          </Button>
          <Button size="sm">Download</Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <Icon name="dollar-sign" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.revenue.total}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-600">{mockData.revenue.percentage}</span> {mockData.revenue.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscriptions
                </CardTitle>
                <Icon name="users" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.subscriptions.total}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-600">{mockData.subscriptions.percentage}</span> {mockData.subscriptions.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <Icon name="credit-card" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.sales.total}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-600">{mockData.sales.percentage}</span> {mockData.sales.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Icon name="activity" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.activeNow.total}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-600">{mockData.activeNow.percentage}</span> {mockData.activeNow.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Sales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Overview Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Chart placeholder - aquí iría un gráfico real */}
                <div className="h-[350px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <Icon name="bar-chart" className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart Area</p>
                    <p className="text-xs text-muted-foreground">Revenue overview chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  {mockData.recentSales.map((sale, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{sale.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {sale.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sale.email}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {sale.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124,592</div>
                <Progress value={65} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-emerald-600">+12.3%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32.4%</div>
                <Progress value={32} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-red-600">-2.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4m 32s</div>
                <Progress value={78} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-emerald-600">+8.2%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Rate</CardTitle>  
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <Progress value={42} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-emerald-600">+0.8%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Traffic and engagement metrics for the current period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center space-y-2">
                  <Icon name="trending-up" className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Analytics Chart</p>
                  <p className="text-xs text-muted-foreground">Detailed analytics visualization would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  Generate and download reports for your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-semibold">Monthly Sales Report</h4>
                      <p className="text-sm text-muted-foreground">Complete sales breakdown by month</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="download" className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-semibold">Customer Analytics</h4>
                      <p className="text-sm text-muted-foreground">User behavior and demographics</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="download" className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-semibold">Revenue Report</h4>
                      <p className="text-sm text-muted-foreground">Detailed revenue analysis</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="download" className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Reports Generated</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Downloads</span>
                    <Badge variant="secondary">156</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Scheduled</span>
                    <Badge variant="secondary">7</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Report Frequency</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Daily: 45%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Weekly: 35%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Monthly: 20%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important alerts via SMS
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShadcnStyleDashboard;
