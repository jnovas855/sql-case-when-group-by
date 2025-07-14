import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, CheckCircle } from 'lucide-react';

interface ProgressTrackerProps {
  completedExercises: number[];
  currentExercise: number;
  totalExercises: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completedExercises,
  currentExercise,
  totalExercises
}) => {
  const completionPercentage = (completedExercises.length / totalExercises) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          <span>Tiến độ học tập</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Hoàn thành</span>
            <span>{completedExercises.length}/{totalExercises} bài tập</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="text-center text-xs text-muted-foreground">
            {completionPercentage.toFixed(0)}% hoàn thành
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Bài tập hiện tại:</span>
            <Badge variant="default">Bài {currentExercise}</Badge>
          </div>

          {completedExercises.length > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Đã hoàn thành:</span>
              <div className="flex gap-1">
                {completedExercises.map(exercise => (
                  <Badge 
                    key={exercise} 
                    variant="secondary" 
                    className="bg-success/10 text-success border-success/20"
                  >
                    Bài {exercise}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {completedExercises.length === totalExercises && (
            <div className="p-3 bg-success/10 text-success border border-success/20 rounded-md text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1" />
              <p className="text-sm font-medium">🎉 Chúc mừng! Bạn đã hoàn thành tất cả bài tập!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};