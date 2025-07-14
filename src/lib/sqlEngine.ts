// Mock data cho bảng SalesOrderHeader
export interface SalesOrderRow {
  SalesOrderID: number;
  CustomerID: number;
  SalesPersonID: number | null;
  SubTotal: number;
  TaxAmt: number;
  OrderDate: string;
  DueDate: string;
  TerritoryID: number; // Thêm cột TerritoryID
}

export const mockSalesData: SalesOrderRow[] = [
  { SalesOrderID: 43659, CustomerID: 29825, SalesPersonID: 279, SubTotal: 20565.6206, TaxAmt: 1971.5149, OrderDate: '2011-05-31', DueDate: '2011-06-12', TerritoryID: 1 },
  { SalesOrderID: 43660, CustomerID: 29672, SalesPersonID: 279, SubTotal: 1294.2529, TaxAmt: 124.2483, OrderDate: '2011-05-31', DueDate: '2011-06-12', TerritoryID: 2 },
  { SalesOrderID: 43661, CustomerID: 29734, SalesPersonID: 282, SubTotal: 32726.4786, TaxAmt: 3153.7696, OrderDate: '2011-05-31', DueDate: '2011-06-12', TerritoryID: 1 },
  { SalesOrderID: 43662, CustomerID: 29994, SalesPersonID: null, SubTotal: 28832.5289, TaxAmt: 2775.1646, OrderDate: '2011-05-31', DueDate: '2011-06-02', TerritoryID: 3 },
  { SalesOrderID: 43663, CustomerID: 29565, SalesPersonID: 276, SubTotal: 419.4589, TaxAmt: 40.2681, OrderDate: '2011-05-31', DueDate: '2011-06-10', TerritoryID: 2 },
  { SalesOrderID: 43664, CustomerID: 29898, SalesPersonID: 280, SubTotal: 2443.3509, TaxAmt: 195.0313, OrderDate: '2011-05-31', DueDate: '2011-06-12', TerritoryID: 1 },
  { SalesOrderID: 43665, CustomerID: 29580, SalesPersonID: 283, SubTotal: 2137.231, TaxAmt: 191.8865, OrderDate: '2011-05-31', DueDate: '2011-06-21', TerritoryID: 3 },
  { SalesOrderID: 43666, CustomerID: 30052, SalesPersonID: 276, SubTotal: 973.20, TaxAmt: 78.0181, OrderDate: '2011-06-01', DueDate: '2011-06-13', TerritoryID: 2 },
  { SalesOrderID: 43667, CustomerID: 29974, SalesPersonID: 277, SubTotal: 846.09, TaxAmt: 67.6899, OrderDate: '2011-06-01', DueDate: '2011-06-13', TerritoryID: 1 },
  { SalesOrderID: 43668, CustomerID: 29614, SalesPersonID: 282, SubTotal: 1260.3408, TaxAmt: 101.0034, OrderDate: '2011-06-01', DueDate: '2011-06-13', TerritoryID: 3 },
  { SalesOrderID: 43669, CustomerID: 29747, SalesPersonID: 283, SubTotal: 14603.0375, TaxAmt: 1463.5175, OrderDate: '2011-06-01', DueDate: '2011-06-25', TerritoryID: 2 },
  { SalesOrderID: 43670, CustomerID: 29890, SalesPersonID: 275, SubTotal: 5555.2047, TaxAmt: 555.3821, OrderDate: '2011-06-01', DueDate: '2011-06-13', TerritoryID: 1 },
  { SalesOrderID: 43671, CustomerID: 29641, SalesPersonID: 278, SubTotal: 797.9921, TaxAmt: 63.8394, OrderDate: '2011-06-02', DueDate: '2011-06-26', TerritoryID: 2 },
  { SalesOrderID: 43672, CustomerID: 29736, SalesPersonID: 277, SubTotal: 38418.6865, TaxAmt: 3073.4949, OrderDate: '2011-06-02', DueDate: '2011-06-14', TerritoryID: 3 },
  { SalesOrderID: 43673, CustomerID: 29811, SalesPersonID: 282, SubTotal: 39785.33, TaxAmt: 3182.8264, OrderDate: '2011-06-02', DueDate: '2011-06-26', TerritoryID: 1 }
];

// SQL Engine đơn giản để xử lý SELECT với CASE WHEN
export class SimpleSQLEngine {
  private data: SalesOrderRow[];

  constructor(data: SalesOrderRow[]) {
    this.data = data;
  }

  execute(sql: string): { columns: string[], rows: any[][], error?: string } {
    try {
      // Làm sạch và chuẩn hóa SQL
      const cleanSQL = sql.trim().replace(/\s+/g, ' ').toUpperCase();
      
      if (!cleanSQL.startsWith('SELECT')) {
        return { columns: [], rows: [], error: 'Chỉ hỗ trợ câu lệnh SELECT' };
      }

      // Parse cơ bản cho SELECT với CASE WHEN
      const result = this.parseSelect(cleanSQL);
      return result;
    } catch (error) {
      return { columns: [], rows: [], error: (error as Error).message };
    }
  }

  private parseSelect(sql: string): { columns: string[], rows: any[][] } {
    // Tìm phần SELECT và FROM
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)/);
    if (!selectMatch) {
      throw new Error('Cú pháp SQL không hợp lệ');
    }

    const selectClause = selectMatch[1];
    const tableName = selectMatch[2];

    if (tableName !== 'SALESORDERHEADER') {
      throw new Error('Chỉ hỗ trợ bảng SalesOrderHeader');
    }

    // Parse các cột được chọn
    const columns = this.parseColumns(selectClause);
    const columnNames = columns.map(col => col.alias || col.name);

    // Thực hiện query
    const rows = this.data.map(row => {
      return columns.map(col => this.evaluateColumn(col, row));
    });

    return { columns: columnNames, rows };
  }

  private parseColumns(selectClause: string): Array<{ name: string, expression: string, alias?: string }> {
    const columns: Array<{ name: string, expression: string, alias?: string }> = [];
    
    // Tách các cột bằng dấu phẩy (nhưng không phải trong CASE WHEN)
    let currentColumn = '';
    let parenthesesCount = 0;
    let inCase = false;
    
    for (let i = 0; i < selectClause.length; i++) {
      const char = selectClause[i];
      
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      
      if (selectClause.substr(i, 4) === 'CASE') inCase = true;
      if (selectClause.substr(i, 3) === 'END') inCase = false;
      
      if (char === ',' && parenthesesCount === 0 && !inCase) {
        columns.push(this.parseColumnExpression(currentColumn.trim()));
        currentColumn = '';
      } else {
        currentColumn += char;
      }
    }
    
    if (currentColumn.trim()) {
      columns.push(this.parseColumnExpression(currentColumn.trim()));
    }

    return columns;
  }

  private parseColumnExpression(expr: string): { name: string, expression: string, alias?: string } {
    // Kiểm tra có AS không
    const asMatch = expr.match(/^(.*?)\s+AS\s+(.+)$/i);
    if (asMatch) {
      return {
        name: asMatch[2],
        expression: asMatch[1],
        alias: asMatch[2]
      };
    }

    // Nếu là tên cột đơn giản
    if (/^[A-Z_]+$/.test(expr)) {
      return { name: expr, expression: expr };
    }

    // Nếu là expression phức tạp, tạo alias mặc định
    return {
      name: 'EXPR',
      expression: expr,
      alias: 'EXPR'
    };
  }

  private evaluateColumn(column: { name: string, expression: string, alias?: string }, row: SalesOrderRow): any {
    const expr = column.expression;

    // Nếu là tên cột đơn giản
    if (expr in row) {
      return (row as any)[expr];
    }

    // Xử lý CASE WHEN
    if (expr.includes('CASE')) {
      return this.evaluateCaseWhen(expr, row);
    }

    // Xử lý DATEDIFF
    if (expr.includes('DATEDIFF')) {
      return this.evaluateDateDiff(expr, row);
    }

    return null;
  }

  private evaluateCaseWhen(expr: string, row: SalesOrderRow): any {
    // Parse CASE WHEN expression
    const caseMatch = expr.match(/CASE\s+(.*?)\s+END/s);
    if (!caseMatch) return null;

    const caseBody = caseMatch[1];
    const whenClauses = [];
    let elseValue = null;

    // Tách các WHEN và ELSE
    const parts = caseBody.split(/\s+(?=WHEN|ELSE)/);
    
    for (const part of parts) {
      if (part.startsWith('WHEN')) {
        const whenMatch = part.match(/WHEN\s+(.*?)\s+THEN\s+(.*)/);
        if (whenMatch) {
          whenClauses.push({
            condition: whenMatch[1],
            value: whenMatch[2].replace(/'/g, '')
          });
        }
      } else if (part.startsWith('ELSE')) {
        elseValue = part.replace('ELSE', '').trim().replace(/'/g, '');
      }
    }

    // Đánh giá các điều kiện
    for (const whenClause of whenClauses) {
      if (this.evaluateCondition(whenClause.condition, row)) {
        return whenClause.value;
      }
    }

    return elseValue;
  }

  private evaluateCondition(condition: string, row: SalesOrderRow): boolean {
    // Xử lý các điều kiện đơn giản
    if (condition.includes('TAXAMT')) {
      const taxAmt = row.TaxAmt;
      
      if (condition.includes('<') && condition.includes('500')) {
        return taxAmt < 500;
      }
      if (condition.includes('>=') && condition.includes('2000')) {
        return taxAmt >= 2000;
      }
      if (condition.includes('>=') && condition.includes('500') && condition.includes('<') && condition.includes('2000')) {
        return taxAmt >= 500 && taxAmt < 2000;
      }
    }

    // Xử lý điều kiện cho wait_time
    if (condition.includes('DATEDIFF') || condition.match(/\d+/)) {
      const waitTime = this.calculateDateDiff(row.OrderDate, row.DueDate);
      
      if (condition.includes('<=') && condition.includes('7')) {
        return waitTime <= 7;
      }
      if (condition.includes('>') && condition.includes('7') && condition.includes('<=') && condition.includes('14')) {
        return waitTime > 7 && waitTime <= 14;
      }
      if (condition.includes('>') && condition.includes('14')) {
        return waitTime > 14;
      }
    }

    return false;
  }

  private evaluateDateDiff(expr: string, row: SalesOrderRow): number {
    return this.calculateDateDiff(row.OrderDate, row.DueDate);
  }

  private calculateDateDiff(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Đáp án mẫu cho các bài tập
export const exerciseSolutions = {
  exercise1: `SELECT 
  SalesOrderID,
  TaxAmt,
  CASE 
    WHEN TaxAmt < 500 THEN 'Thấp'
    WHEN TaxAmt >= 500 AND TaxAmt < 2000 THEN 'Trung bình'
    WHEN TaxAmt >= 2000 THEN 'Cao'
  END AS Order_Type
FROM SalesOrderHeader`,

  exercise2: `-- Lưu ý: Hàm julianday(DueDate) - julianday(OrderDate) trong SQLite tương đương với DATEDIFF(DAY, OrderDate, DueDate) trong SQL Server
SELECT 
  SalesOrderID,
  OrderDate,
  DueDate,
  CAST(julianday(DueDate) - julianday(OrderDate) AS INTEGER) AS so_thoi_gian_cho, -- số ngày chờ
  CASE 
    WHEN (julianday(DueDate) - julianday(OrderDate)) <= 7 THEN 'Nhanh'
    WHEN (julianday(DueDate) - julianday(OrderDate)) > 7 AND (julianday(DueDate) - julianday(OrderDate)) <= 14 THEN 'Bình thường'
    WHEN (julianday(DueDate) - julianday(OrderDate)) > 14 THEN 'Chậm'
  END AS wait_type
FROM SalesOrderHeader`,

  exercise3: `-- Phân loại khách hàng dựa vào số lần mua hàng
SELECT
  CustomerID,
  COUNT(SalesOrderID) AS SoLanMua, -- Giả sử SalesOrderID là khóa chính hoặc cột định danh đơn hàng
  CASE
    WHEN COUNT(SalesOrderID) > 8 THEN 'Khách hàng thân thiết'
    WHEN COUNT(SalesOrderID) >= 3 AND COUNT(SalesOrderID) <= 8 THEN 'Khách hàng tiềm năng'
    ELSE 'Khách hàng mới'
  END AS XepHangKhachHang
FROM
  SalesOrderHeader
GROUP BY
  CustomerID;`,

  exercise4: `-- Tìm các khu vực đạt KPI doanh thu
SELECT
  TerritoryID,
  SUM(SubTotal) AS TotalSales
FROM
  SalesOrderHeader
GROUP BY
  TerritoryID
HAVING
  SUM(SubTotal) >= 200000;`,

  exercise5: `-- Thống kê đơn hàng theo loại thời gian chờ (không cần bảng WAIT_TIME)
SELECT
  CASE 
    WHEN (julianday(DueDate) - julianday(OrderDate)) <= 7 THEN 'Nhanh'
    WHEN (julianday(DueDate) - julianday(OrderDate)) > 7 AND (julianday(DueDate) - julianday(OrderDate)) <= 14 THEN 'Bình thường'
    WHEN (julianday(DueDate) - julianday(OrderDate)) > 14 THEN 'Chậm'
  END AS wait_type,
  COUNT(SalesOrderID) AS TotalOrders,
  SUM(SubTotal) AS TotalRevenue,
  AVG(julianday(DueDate) - julianday(OrderDate)) AS AvgWaitTime
FROM SalesOrderHeader
GROUP BY wait_type;`
};