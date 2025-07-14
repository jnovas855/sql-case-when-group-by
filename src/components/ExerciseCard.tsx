import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Target } from 'lucide-react';

interface ExerciseCardProps {
  exerciseNumber: number;
  title: string;
  description: string;
  isCompleted?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseNumber,
  title,
  description,
  isCompleted = false,
  isActive = false,
  onClick
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <span>Bài tập {exerciseNumber}</span>
          </div>
          <div className="flex gap-2">
            {isActive && (
              <Badge variant="default" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                Đang làm
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                Hoàn thành
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium mb-2">{title}</h3>
        {/* <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p> */}
      </CardContent>
    </Card>
  );
};