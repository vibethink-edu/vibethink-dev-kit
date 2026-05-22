"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";

const payments = [
  {
    id: "1",
    customer: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    avatar: "OM",
    status: "completed"
  },
  {
    id: "2",
    customer: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    avatar: "JL",
    status: "completed"
  },
  {
    id: "3",
    customer: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    avatar: "IN",
    status: "completed"
  },
  {
    id: "4",
    customer: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    avatar: "WK",
    status: "pending"
  },
  {
    id: "5",
    customer: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    avatar: "SD",
    status: "completed"
  }
];

export function LatestPayments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://bundui-images.netlify.app/avatars/${payment.avatar}.png`} />
                <AvatarFallback>{payment.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{payment.customer}</p>
                <p className="text-xs text-muted-foreground">{payment.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                  {payment.status}
                </Badge>
                <span className="text-sm font-medium">{payment.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


