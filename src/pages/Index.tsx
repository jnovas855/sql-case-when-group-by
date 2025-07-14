import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Code, 
  Database, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  Target
} from 'lucide-react';

import { SqlIdeV2 } from '@/components/SqlIdeV2';
import { HintSystem } from '@/components/HintSystem';
import { DataTable } from '@/components/DataTable';
import { ExerciseCard } from '@/components/ExerciseCard';
import { SolutionDisplay } from '@/components/SolutionDisplay';
import { ProgressTracker } from '@/components/ProgressTracker';
import { useToast } from '@/hooks/use-toast';

const exercises = [
  {
    id: 1,
    title: "Phân loại đơn hàng theo TaxAmt",
    description: "Sử dụng CASE WHEN để phân loại đơn hàng dựa trên giá trị TaxAmt: 'Thấp' (<500), 'Trung bình' (500-2000), 'Cao' (>=2000).",
    expectedColumns: ['SalesOrderID', 'TaxAmt', 'Order_Type']
  },
  {
    id: 2,
    title: "Tạo bảng WAIT_TIME",
    description: "Tính toán thời gian chờ giữa OrderDate và DueDate, sau đó phân loại thành 'Nhanh' (≤7 ngày), 'Bình thường' (8-14 ngày), 'Chậm' (>14 ngày).",
    expectedColumns: ['SalesOrderID', 'OrderDate', 'DueDate', 'so_thoi_gian_cho', 'wait_type']
  },
  {
    id: 3,
    title: "Phân loại khách hàng dựa vào số lần mua hàng",
    description: "Từ bảng SalesOrderHeader, hãy tạo truy vấn CUSTOMER_GROUP gồm CustomerID và xep_hang_khach_hang dựa vào tổng số lần mua hàng: >8 là 'Khách hàng thân thiết', 3-8 là 'Khách hàng tiềm năng', <3 là 'Khách hàng mới'. Kết hợp GROUP BY và CASE WHEN để phân loại.",
    expectedColumns: ['CustomerID', 'SoLanMua', 'XepHangKhachHang']
  },
  {
    id: 4,
    title: "Tìm các khu vực đạt KPI doanh thu",
    description: "Tính tổng doanh thu theo các TerritoryID từ bảng SalesOrderHeader. Kiểm tra các Territory nào đạt KPI (>= 200000). Áp dụng GROUP BY và HAVING đúng chuẩn.",
    expectedColumns: ['TerritoryID', 'TotalSales']
  },
  {
    id: 5,
    title: "Thống kê đơn hàng theo loại thời gian chờ",
    description: "Với bảng WAIT_TIME đã tạo ở bài trước (có cột wait_type), hãy đếm tổng số đơn hàng, tính tổng số tiền (SubTotal), và thời gian chờ trung bình (so_thoi_gian_cho trung bình) của các đơn hàng theo từng wait_type. Luyện tập GROUP BY với cột phân loại và nhiều hàm tổng hợp.",
    expectedColumns: ['wait_type', 'TotalOrders', 'TotalRevenue', 'AvgWaitTime']
  }
];

const Index = () => {
  const [currentExercise, setCurrentExercise] = useState(1);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  
  const { toast } = useToast();

  const handleQueryResult = useCallback((isCorrect: boolean, result: any) => {
    if (isCorrect) {
      setFeedback('🎉 Chúc mừng! Bạn đã hoàn thành bài tập thành công!');
      setFeedbackType('success');
      
      if (!completedExercises.includes(currentExercise)) {
        setCompletedExercises(prev => [...prev, currentExercise]);
      }
      
      toast({
        title: "Bài tập hoàn thành!",
        description: `Bạn đã giải đúng bài tập ${currentExercise}`,
        duration: 3000,
      });
    } else {
      setFeedback('❌ Kết quả chưa đúng. Hãy kiểm tra lại logic hoặc sử dụng gợi ý.');
      setFeedbackType('error');
    }
  }, [currentExercise, completedExercises, toast]);

  const toggleSolution = (exerciseId: number) => {
    setShowSolution(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const selectExercise = (exerciseId: number) => {
    setCurrentExercise(exerciseId);
    setFeedback(null);
    setFeedbackType(null);
  };

  const currentExerciseData = exercises.find(ex => ex.id === currentExercise);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Luyện tập SQL với CASE WHEN | AGG function | Group by | Having</h1>
              <p className="text-muted-foreground">Bài tập thực hành tương tác với cơ sở dữ liệu AdventureWorks</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span>AdventureWorks Database</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span>CASE WHEN Statements</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-warning" />
              <span>Interactive Learning</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Exercises and Progress */}
          <div className="space-y-6">
            <ProgressTracker
              completedExercises={completedExercises}
              currentExercise={currentExercise}
              totalExercises={exercises.length}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>Danh sách bài tập</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exerciseNumber={exercise.id}
                    title={exercise.title}
                    description={exercise.description}
                    isCompleted={completedExercises.includes(exercise.id)}
                    isActive={currentExercise === exercise.id}
                    onClick={() => selectExercise(exercise.id)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Exercise */}
            {currentExerciseData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Bài tập {currentExercise}: {currentExerciseData.title}</span>
                    {completedExercises.includes(currentExercise) && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Hoàn thành
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Đề bài đẹp cho từng bài tập */}
                    {currentExercise === 1 && (
                      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                          <BookOpen className="w-5 h-5" />
                          <span>Đề bài:</span>
                        </div>
                        <div>
                          Sử dụng <span className="font-mono bg-muted px-1 rounded">CASE WHEN</span> để phân loại đơn hàng dựa trên giá trị <b>TaxAmt</b>:
                          <ul className="list-disc pl-6 mt-1 space-y-1">
                            <li><b>Thấp</b>: <span className="font-mono">TaxAmt &lt; 500</span></li>
                            <li><b>Trung bình</b>: <span className="font-mono">500 ≤ TaxAmt &lt; 2000</span></li>
                            <li><b>Cao</b>: <span className="font-mono">TaxAmt ≥ 2000</span></li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {currentExercise === 2 && (
                      <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-accent">
                          <BookOpen className="w-5 h-5" />
                          <span>Đề bài:</span>
                        </div>
                        <div>
                          Tính toán thời gian chờ giữa <b>OrderDate</b> và <b>DueDate</b>, sau đó phân loại thành:
                          <ul className="list-disc pl-6 mt-1 space-y-1">
                            <li><b>Nhanh</b>: ≤ 7 ngày</li>
                            <li><b>Bình thường</b>: 8-14 ngày</li>
                            <li><b>Chậm</b>: &gt; 14 ngày</li>
                          </ul>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Gợi ý: Dùng <span className="font-mono bg-muted px-1 rounded">julianday(DueDate) - julianday(OrderDate)</span> để tính số ngày chờ trong SQLite.
                          </div>
                        </div>
                      </div>
                    )}
                    {currentExercise === 3 && (
                      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-warning">
                          <BookOpen className="w-5 h-5" />
                          <span>Đề bài:</span>
                        </div>
                        <div>
                          Từ bảng <b>SalesOrderHeader</b>, hãy tạo truy vấn <b>CUSTOMER_GROUP</b> gồm <b>CustomerID</b> và <b>xep_hang_khach_hang</b> dựa vào tổng số lần mua hàng:
                          <ul className="list-disc pl-6 mt-1 space-y-1">
                            <li>&gt; 8: <b>Khách hàng thân thiết</b></li>
                            <li>3-8: <b>Khách hàng tiềm năng</b></li>
                            <li>&lt; 3: <b>Khách hàng mới</b></li>
                          </ul>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Kết hợp <span className="font-mono bg-muted px-1 rounded">GROUP BY</span> và <span className="font-mono bg-muted px-1 rounded">CASE WHEN</span> để phân loại.
                          </div>
                        </div>
                      </div>
                    )}
                    {currentExercise === 4 && (
                      <div className="bg-success/10 border-l-4 border-success p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-success">
                          <BookOpen className="w-5 h-5" />
                          <span>Đề bài:</span>
                        </div>
                        <div>
                          Tính tổng doanh thu theo các <b>TerritoryID</b> từ bảng <b>SalesOrderHeader</b>.<br/>
                          Kiểm tra các <b>Territory</b> nào đạt KPI (<span className="font-mono">&gt;= 200000</span>).
                          <div className="mt-2 text-sm text-muted-foreground">
                            Áp dụng <span className="font-mono bg-muted px-1 rounded">GROUP BY</span> và <span className="font-mono bg-muted px-1 rounded">HAVING</span> đúng chuẩn.
                          </div>
                        </div>
                      </div>
                    )}
                    {currentExercise === 5 && (
                      <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-destructive">
                          <BookOpen className="w-5 h-5" />
                          <span>Đề bài:</span>
                        </div>
                        <div>
                          Thống kê đơn hàng theo loại <b>thời gian chờ</b> (wait_type):
                          <ul className="list-disc pl-6 mt-1 space-y-1">
                            <li>Đếm tổng số đơn hàng (<b>TotalOrders</b>)</li>
                            <li>Tính tổng số tiền (<b>TotalRevenue</b>)</li>
                            <li>Tính thời gian chờ trung bình (<b>AvgWaitTime</b>)</li>
                          </ul>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Sử dụng <span className="font-mono bg-muted px-1 rounded">CASE WHEN</span>, <span className="font-mono bg-muted px-1 rounded">GROUP BY</span> và các hàm tổng hợp (<span className="font-mono">COUNT</span>, <span className="font-mono">SUM</span>, <span className="font-mono">AVG</span>).
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Yêu cầu output:</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentExerciseData.expectedColumns.map((col, index) => (
                          <Badge key={index} variant="outline" className="font-mono text-xs">
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {feedback && (
                      <div className={`p-4 rounded-lg border ${
                        feedbackType === 'success' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        <div className="flex items-center gap-2">
                          {feedbackType === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          <p className="font-medium">{feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs for different views */}
            <Tabs defaultValue="practice" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="practice" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Thực hành
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Dữ liệu
                </TabsTrigger>
                <TabsTrigger value="hints" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Gợi ý
                </TabsTrigger>
              </TabsList>

              <TabsContent value="practice" className="space-y-4">
                <SqlIdeV2 
                  onQueryResult={handleQueryResult}
                  expectedResult={{ columns: currentExerciseData?.expectedColumns || [] }}
                  exerciseNumber={currentExercise}
                />
                
                <SolutionDisplay 
                  exerciseNumber={currentExercise}
                  visible={showSolution[currentExercise] || false}
                />
              </TabsContent>

              <TabsContent value="data">
                <DataTable />
              </TabsContent>

              <TabsContent value="hints">
                <HintSystem 
                  exerciseNumber={currentExercise}
                  onShowSolution={() => toggleSolution(currentExercise)}
                  showSolution={showSolution[currentExercise] || false}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
