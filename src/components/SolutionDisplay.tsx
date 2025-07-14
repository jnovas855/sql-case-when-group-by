import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { exerciseSolutions } from '@/lib/sqlEngine';
import { useToast } from '@/hooks/use-toast';

interface SolutionDisplayProps {
  exerciseNumber: number;
  visible: boolean;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ 
  exerciseNumber, 
  visible 
}) => {
  const { toast } = useToast();
  
  if (!visible) return null;

  const solutionKey = `exercise${exerciseNumber}` as keyof typeof exerciseSolutions;
  const solution = exerciseSolutions[solutionKey];

  const copySolution = async () => {
    try {
      await navigator.clipboard.writeText(solution);
      toast({
        title: "Đã sao chép!",
        description: "Câu lệnh SQL đã được sao chép vào clipboard.",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Lỗi sao chép",
        description: "Không thể sao chép vào clipboard.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <Card className="border-success/50 bg-success/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          <span>Đáp án mẫu - Bài tập {exerciseNumber}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <pre className="bg-code-bg text-code-foreground p-4 rounded-md text-sm overflow-x-auto">
              <code>{solution}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={copySolution}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>Lưu ý:</strong> Đây là một trong những cách giải có thể. Bạn có thể có cách viết khác nhưng vẫn đúng logic.</p>
            {exerciseNumber === 2 && (
              <p className="mt-2"><strong>Ghi chú:</strong> Trong SQLite, phép trừ <code>julianday(DueDate) - julianday(OrderDate)</code> tương đương với <code>DATEDIFF(DAY, OrderDate, DueDate)</code> trong SQL Server.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};