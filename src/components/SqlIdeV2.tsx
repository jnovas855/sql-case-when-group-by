import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { CodeMirrorEditor, CodeMirrorEditorRef } from '@/components/CodeMirrorEditor';
import { getSQLiteEngine } from '@/lib/sqliteEngine';

interface SqlIdeProps {
  onQueryResult?: (isCorrect: boolean, result: any) => void;
  expectedResult?: { columns: string[] };
  exerciseNumber?: number;
}

export const SqlIdeV2: React.FC<SqlIdeProps> = ({ 
  onQueryResult, 
  expectedResult,
  exerciseNumber 
}) => {
  // Key lưu code cho từng bài tập
  const storageKey = `sql_code_exercise_${exerciseNumber}`;
  const [sql, setSql] = useState(() => localStorage.getItem(storageKey) || '');
  const [result, setResult] = useState<{ columns: string[], rows: any[][], error?: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const editorRef = useRef<CodeMirrorEditorRef>(null);

  // Lưu vào localStorage mỗi khi code thay đổi
  useEffect(() => {
    localStorage.setItem(storageKey, sql);
  }, [sql, storageKey]);

  const sqlEngine = getSQLiteEngine();

  const executeQuery = async () => {
    if (!sql.trim()) return;
    
    setIsExecuting(true);
    
    try {
      // Execute query using SQLite
      const queryResult = await sqlEngine.execute(sql);
      setResult(queryResult);
      
      // Check answer if expected result is provided
      if (expectedResult && onQueryResult) {
        const isCorrect = checkAnswer(queryResult, expectedResult);
        onQueryResult(isCorrect, queryResult);
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      setResult({
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const checkAnswer = (actual: any, expected: any): boolean => {
    console.log('Checking answer. Actual:', actual, 'Expected:', expected);
    
    if (actual.error) {
      console.log('Query has error, returning false');
      return false;
    }
    
    // Safely check if expected result has columns
    if (!expected || !expected.columns || !Array.isArray(expected.columns)) {
      console.log('Expected result is invalid, returning true (no validation)');
      return true; // If no valid expected result, consider it correct
    }
    
    // Check if actual result has columns
    if (!actual.columns || !Array.isArray(actual.columns)) {
      console.log('Actual result has no columns, returning false');
      return false;
    }
    
    // Check number of columns
    if (actual.columns.length !== expected.columns.length) {
      console.log('Column count mismatch:', actual.columns.length, 'vs', expected.columns.length);
      return false;
    }
    
    // Check column names (case insensitive)
    const actualCols = actual.columns.map((c: string) => c.toUpperCase());
    const expectedCols = expected.columns.map((c: string) => c.toUpperCase());
    
    for (let i = 0; i < expectedCols.length; i++) {
      if (!actualCols.includes(expectedCols[i])) {
        console.log('Missing column:', expectedCols[i]);
        return false;
      }
    }
    
    console.log('Answer is correct!');
    return true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      executeQuery();
    }
  };

  return (
    <div 
      className="space-y-4"
      style={{ maxWidth: 1000, margin: '0 auto' }} // tăng max width tổng thể
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          executeQuery();
        }
      }}
    >
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
            <CodeMirrorEditor
              ref={editorRef}
              value={sql}
              onChange={setSql}
              onKeyDown={handleKeyDown}
              placeholder="-- Ví dụ: SELECT * FROM SalesOrderHeader LIMIT 5;"
              className="min-h-[200px] w-full text-base max-w-4xl mx-auto" // tăng width, font-size, căn giữa
            />
            <Button 
              onClick={executeQuery} 
              disabled={isExecuting || !sql.trim()}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
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
                <p className="text-sm mt-1 font-mono">{result.error}</p>
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