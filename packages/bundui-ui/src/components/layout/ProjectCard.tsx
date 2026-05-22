"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Progress } from './components/ui/progress';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from './components/ui/dropdown-menu';
import { MoreHorizontal, Users, Calendar, Target, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'archived';
  progress: number;
  members: Array<{
    name: string;
    avatar: string;
    role: string;
  }>;
  dueDate: string;
  budget: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const statusColors = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  pending: 'bg-yellow-500',
  archived: 'bg-gray-500'
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function ProjectCard({
  title,
  description,
  status,
  progress,
  members,
  dueDate,
  budget,
  category,
  priority
}: ProjectCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Archive Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          <span className="text-xs text-muted-foreground capitalize">{status}</span>
          <Badge variant="outline" className={`text-xs ${priorityColors[priority]}`}>
            {priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due</span>
            <span className="font-medium">{dueDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{budget}</span>
          </div>
        </div>
        
        {/* Team Members */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team</span>
            </div>
            <span className="text-xs text-muted-foreground">{members.length} members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {members.length > 4 && (
              <span className="text-xs text-muted-foreground">+{members.length - 4} more</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
