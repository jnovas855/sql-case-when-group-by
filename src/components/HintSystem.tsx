import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface Hint {
  id: number;
  title: string;
  content: string;
  level: 'basic' | 'intermediate' | 'advanced';
}

interface HintSystemProps {
  exerciseNumber: number;
  onShowSolution?: () => void;
  showSolution?: boolean;
}

const hintsData: Record<number, Hint[]> = {
  1: [
    {
      id: 1,
      title: "Cú pháp cơ bản CASE WHEN",
      content: "CASE WHEN điều_kiện THEN giá_trị ELSE giá_trị_khác END",
      level: "basic"
    },
    {
      id: 2,
      title: "Chọn cột TaxAmt",
      content: "Bắt đầu với SELECT SalesOrderID, TaxAmt, CASE WHEN TaxAmt < 500 THEN...",
      level: "basic"
    },
    {
      id: 3,
      title: "Thêm điều kiện cho TaxAmt >= 500",
      content: "Sử dụng WHEN TaxAmt >= 500 AND TaxAmt < 2000 THEN 'Trung bình'",
      level: "intermediate"
    },
    {
      id: 4,
      title: "Đặt tên cho cột kết quả",
      content: "Sử dụng AS Order_Type để đặt tên cho cột được tạo bởi CASE WHEN",
      level: "intermediate"
    },
    {
      id: 5,
      title: "Xử lý lỗi cú pháp",
      content: "Đảm bảo có END sau CASE WHEN và không thiếu dấu phẩy giữa các cột",
      level: "advanced"
    }
  ],
  2: [
    {
      id: 1,
      title: "Tính số ngày giữa hai ngày trong SQLite",
      content: "SQLite không có hàm DATEDIFF như SQL Server. Thay vào đó, bạn có thể dùng phép trừ giữa hai hàm julianday: julianday(DueDate) - julianday(OrderDate).",
      level: "basic"
    },
    {
      id: 2,
      title: "Chuyển kết quả sang số nguyên",
      content: "Kết quả phép trừ julianday là số thực. Nếu muốn lấy số ngày nguyên, hãy dùng CAST(... AS INTEGER) hoặc ROUND(...).",
      level: "basic"
    },
    {
      id: 3,
      title: "Phân loại thời gian chờ",
      content: "Sử dụng CASE WHEN để phân loại: <=7 ngày là 'Nhanh', 8-14 ngày là 'Bình thường', >14 ngày là 'Chậm'.",
      level: "intermediate"
    },
    {
      id: 4,
      title: "Đặt tên cho cột kết quả",
      content: "Sử dụng AS so_thoi_gian_cho và AS wait_type để đặt tên cho các cột kết quả.",
      level: "intermediate"
    },
    {
      id: 5,
      title: "Ví dụ truy vấn hoàn chỉnh",
      content: "SELECT SalesOrderID, OrderDate, DueDate, CAST(julianday(DueDate) - julianday(OrderDate) AS INTEGER) AS so_thoi_gian_cho, CASE WHEN ... END AS wait_type FROM SalesOrderHeader",
      level: "advanced"
    }
  ],
  3: [
    {
      id: 1,
      title: "Tính số lần mua hàng của mỗi khách hàng",
      content: "Sử dụng GROUP BY CustomerID và COUNT(SalesOrderID) AS SoLanMua để đếm số lần mua hàng cho từng khách hàng.",
      level: "basic"
    },
    {
      id: 2,
      title: "Phân loại khách hàng bằng CASE WHEN",
      content: "Dùng CASE WHEN để phân loại: >8 là 'Khách hàng thân thiết', từ 3 đến 8 là 'Khách hàng tiềm năng', <3 là 'Khách hàng mới'. Điều kiện: WHEN COUNT(SalesOrderID) > 8 ... WHEN COUNT(SalesOrderID) >= 3 AND COUNT(SalesOrderID) <= 8 ... ELSE ...",
      level: "intermediate"
    },
    {
      id: 3,
      title: "Đặt tên cho cột kết quả",
      content: "Sử dụng AS SoLanMua cho số lần mua và AS XepHangKhachHang cho cột phân loại.",
      level: "intermediate"
    },
    {
      id: 4,
      title: "Ví dụ truy vấn hoàn chỉnh",
      content: "SELECT CustomerID, COUNT(SalesOrderID) AS SoLanMua, CASE WHEN COUNT(SalesOrderID) > 8 THEN 'Khách hàng thân thiết' WHEN COUNT(SalesOrderID) >= 3 AND COUNT(SalesOrderID) <= 8 THEN 'Khách hàng tiềm năng' ELSE 'Khách hàng mới' END AS XepHangKhachHang FROM SalesOrderHeader GROUP BY CustomerID;",
      level: "advanced"
    }
  ],
  4: [
    {
      id: 1,
      title: "Tính tổng doanh thu từng khu vực",
      content: "Sử dụng GROUP BY TerritoryID và SUM(SubTotal) để tính tổng doanh thu cho từng khu vực.",
      level: "basic"
    },
    {
      id: 2,
      title: "Lọc các khu vực đạt KPI bằng HAVING",
      content: "Dùng HAVING SUM(SubTotal) >= 200000 để chỉ lấy các khu vực có tổng doanh thu đạt KPI.",
      level: "intermediate"
    },
    {
      id: 3,
      title: "Đặt tên cho cột kết quả",
      content: "Sử dụng AS TotalSales để đặt tên cho cột tổng doanh thu.",
      level: "intermediate"
    },
    {
      id: 4,
      title: "Ví dụ truy vấn hoàn chỉnh",
      content: "SELECT TerritoryID, SUM(SubTotal) AS TotalSales FROM SalesOrderHeader GROUP BY TerritoryID HAVING SUM(SubTotal) >= 200000;",
      level: "advanced"
    }
  ],
  5: [
    {
      id: 1,
      title: "GROUP BY với cột phân loại",
      content: "Bạn cần GROUP BY theo cột wait_type để thống kê từng loại thời gian chờ.",
      level: "basic"
    },
    {
      id: 2,
      title: "Đếm tổng số đơn hàng",
      content: "Sử dụng COUNT(SalesOrderID) hoặc COUNT(*) để đếm số đơn hàng trong mỗi nhóm.",
      level: "basic"
    },
    {
      id: 3,
      title: "Tính tổng doanh thu",
      content: "Dùng SUM(SubTotal) để tính tổng số tiền của các đơn hàng trong mỗi nhóm.",
      level: "intermediate"
    },
    {
      id: 4,
      title: "Tính thời gian chờ trung bình",
      content: "Dùng AVG(so_thoi_gian_cho) để tính thời gian chờ trung bình trong mỗi nhóm.",
      level: "intermediate"
    },
    {
      id: 5,
      title: "GROUP BY với alias",
      content: "Bạn chỉ cần GROUP BY wait_type (alias), không cần copy lại toàn bộ biểu thức CASE WHEN.",
      level: "advanced"
    },
    {
      id: 6,
      title: "Ví dụ truy vấn hoàn chỉnh",
      content: "SELECT wait_type, COUNT(SalesOrderID) AS TotalOrders, SUM(SubTotal) AS TotalRevenue, AVG(so_thoi_gian_cho) AS AvgWaitTime FROM WAIT_TIME GROUP BY wait_type;",
      level: "advanced"
    }
  ]
};

export const HintSystem: React.FC<HintSystemProps> = ({ 
  exerciseNumber, 
  onShowSolution,
  showSolution = false 
}) => {
  const [expandedHints, setExpandedHints] = useState<number[]>([]);
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);

  const hints = hintsData[exerciseNumber] || [];

  const toggleHint = (hintId: number) => {
    if (!unlockedHints.includes(hintId)) {
      setUnlockedHints([...unlockedHints, hintId]);
    }
    
    setExpandedHints(prev => 
      prev.includes(hintId) 
        ? prev.filter(id => id !== hintId)
        : [...prev, hintId]
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-warning text-warning-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'basic': return 'Cơ bản';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Nâng cao';
      default: return 'Khác';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-warning" />
          <span>Hệ thống gợi ý</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hints.map((hint) => (
          <div key={hint.id} className="border border-border rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
              onClick={() => toggleHint(hint.id)}
            >
              <div className="flex items-center gap-3 w-full">
                {expandedHints.includes(hint.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Gợi ý {hint.id}</span>
                    <Badge 
                      className={`text-xs ${getLevelColor(hint.level)}`}
                      variant="secondary"
                    >
                      {getLevelText(hint.level)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hint.title}
                  </p>
                </div>
              </div>
            </Button>
            
            {expandedHints.includes(hint.id) && (
              <div className="px-3 pb-3 pt-0">
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-mono">{hint.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onShowSolution}
            className="w-full flex items-center gap-2"
          >
            {showSolution ? (
              <>
                <EyeOff className="w-4 h-4" />
                Ẩn đáp án
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Xem đáp án
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};