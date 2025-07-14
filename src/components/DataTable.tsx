import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockSalesData } from '@/lib/sqlEngine';
import { Database } from 'lucide-react';

export const DataTable: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <span>Bảng SalesOrderHeader</span>
          <Badge variant="secondary">{mockSalesData.length} dòng</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          <p>Dữ liệu mẫu từ cơ sở dữ liệu AdventureWorks. Bạn có thể sử dụng bảng này để thực hành các câu lệnh SQL.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-2 py-2 text-left font-medium">SalesOrderID</th>
                <th className="border border-border px-2 py-2 text-left font-medium">CustomerID</th>
                <th className="border border-border px-2 py-2 text-left font-medium">SalesPersonID</th>
                <th className="border border-border px-2 py-2 text-left font-medium">SubTotal</th>
                <th className="border border-border px-2 py-2 text-left font-medium">TaxAmt</th>
                <th className="border border-border px-2 py-2 text-left font-medium">OrderDate</th>
                <th className="border border-border px-2 py-2 text-left font-medium">DueDate</th>
                <th className="border border-border px-2 py-2 text-left font-medium">TerritoryID</th>
              </tr>
            </thead>
            <tbody>
              {mockSalesData.slice(0, 10).map((row, index) => (
                <tr key={row.SalesOrderID} className="hover:bg-muted/50">
                  <td className="border border-border px-2 py-1">{row.SalesOrderID}</td>
                  <td className="border border-border px-2 py-1">{row.CustomerID}</td>
                  <td className="border border-border px-2 py-1">{row.SalesPersonID || 'NULL'}</td>
                  <td className="border border-border px-2 py-1">{row.SubTotal.toFixed(2)}</td>
                  <td className="border border-border px-2 py-1">{row.TaxAmt.toFixed(2)}</td>
                  <td className="border border-border px-2 py-1">{row.OrderDate}</td>
                  <td className="border border-border px-2 py-1">{row.DueDate}</td>
                  <td className="border border-border px-2 py-1">{row.TerritoryID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {mockSalesData.length > 10 && (
          <div className="mt-3 text-center text-sm text-muted-foreground">
            Hiển thị 10/{mockSalesData.length} dòng đầu tiên. Sử dụng SQL để xem toàn bộ dữ liệu.
          </div>
        )}
      </CardContent>
    </Card>
  );
};