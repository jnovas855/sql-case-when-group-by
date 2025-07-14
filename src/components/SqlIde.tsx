import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import { SimpleSQLEngine, mockSalesData } from '@/lib/sqlEngine';

interface SqlIdeProps {
  onQueryResult?: (isCorrect: boolean, result: any) => void;
  expectedResult?: any[];
  exerciseNumber?: number;
}

export const SqlIde: React.FC<SqlIdeProps> = ({ 
  onQueryResult, 
  expectedResult,
  exerciseNumber 
}) => {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<{ columns: string[], rows: any[][], error?: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const sqlEngine = new SimpleSQLEngine(mockSalesData);

  const executeQuery = async () => {
    if (!sql.trim()) return;
    
    setIsExecuting(true);
    
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const queryResult = sqlEngine.execute(sql);
    setResult(queryResult);
    
    // Kiểm tra đáp án nếu có expectedResult
    if (expectedResult && onQueryResult) {
      const isCorrect = checkAnswer(queryResult, expectedResult);
      onQueryResult(isCorrect, queryResult);
    }
    
    setIsExecuting(false);
  };

  const checkAnswer = (actual: any, expected: any): boolean => {
    if (actual.error) return false;
    
    // Kiểm tra số cột
    if (actual.columns.length !== expected.columns.length) return false;
    
    // Kiểm tra tên cột (case insensitive)
    const actualCols = actual.columns.map((c: string) => c.toUpperCase());
    const expectedCols = expected.columns.map((c: string) => c.toUpperCase());
    
    for (let i = 0; i < expectedCols.length; i++) {
      if (!actualCols.includes(expectedCols[i])) return false;
    }
    
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  };

  return (
    <div className="space-y-4">
      {/* SQL Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>SQL Editor</span>
            <Badge variant="secondary">Ctrl+Enter để chạy</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu lệnh SQL của bạn ở đây..."
              className="w-full h-32 p-3 font-mono text-sm bg-code-bg text-code-foreground border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ 
                background: 'hsl(var(--code-bg))',
                color: 'hsl(var(--code-foreground))'
              }}
            />
            <Button 
              onClick={executeQuery} 
              disabled={isExecuting || !sql.trim()}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Đang thực thi...' : 'Chạy Query'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.error ? (
                <>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span>Lỗi SQL</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Kết quả ({result.rows.length} dòng)</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                <p className="font-medium">Lỗi:</p>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      {result.columns.map((col, index) => (
                        <th 
                          key={index} 
                          className="border border-border px-3 py-2 text-left font-medium"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/50">
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex} 
                            className="border border-border px-3 py-2 text-sm"
                          >
                            {cell !== null && cell !== undefined ? String(cell) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};