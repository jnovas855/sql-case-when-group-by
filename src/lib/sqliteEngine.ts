import initSqlJs from 'sql.js';

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

// Mock data - same as before
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

export class SQLiteEngine {
  private sql: any;
  private db: any;
  private initialized = false;
  private initializing: Promise<void> | null = null;

  constructor() {
    // Không gọi initializeDatabase ở đây nữa!
  }

  private async initializeDatabase() {
    if (this.initialized) return;
    if (this.initializing) return this.initializing;

    this.initializing = (async () => {
      this.sql = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });
      this.db = new this.sql.Database();

      // Create table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS SalesOrderHeader (
          SalesOrderID INTEGER PRIMARY KEY,
          CustomerID INTEGER,
          SalesPersonID INTEGER,
          SubTotal REAL,
          TaxAmt REAL,
          OrderDate TEXT,
          DueDate TEXT,
          TerritoryID INTEGER
        )
      `);

      // Insert mock data
      const insertStmt = this.db.prepare(`
        INSERT INTO SalesOrderHeader 
        (SalesOrderID, CustomerID, SalesPersonID, SubTotal, TaxAmt, OrderDate, DueDate, TerritoryID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of mockSalesData) {
        insertStmt.run([
          row.SalesOrderID,
          row.CustomerID,
          row.SalesPersonID,
          row.SubTotal,
          row.TaxAmt,
          row.OrderDate,
          row.DueDate,
          row.TerritoryID
        ]);
      }
      insertStmt.free();

      // Đăng ký hàm DATEDIFF cho SQLite (chỉ hỗ trợ DAY, dùng phép trừ julianday)
      this.db.create_function('DATEDIFF', function(unit, from, to) {
        if (typeof unit !== 'string' || unit.toUpperCase() !== 'DAY') throw new Error('Only DAY is supported');
        // Sử dụng phép trừ julianday trong JavaScript
        // Chuyển ngày sang số ngày kiểu SQLite
        function toJulianDay(dateStr) {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return NaN;
          // Công thức chuyển đổi sang Julian Day Number (theo SQLite docs)
          return (date.getTime() / 86400000.0) + 2440587.5;
        }
        const fromJD = toJulianDay(from);
        const toJD = toJulianDay(to);
        if (isNaN(fromJD) || isNaN(toJD)) return null;
        return Math.floor(toJD - fromJD);
      });

      this.initialized = true;
    })();

    return this.initializing;
  }

  async execute(sql: string): Promise<{ columns: string[], rows: any[][], error?: string }> {
    try {
      await this.initializeDatabase();
      // Execute the query
      const stmt = this.db.prepare(sql);
      const columns = stmt.getColumnNames();
      const rows: any[][] = [];
      stmt.bind();
      while (stmt.step()) {
        const row = stmt.get();
        rows.push(row);
      }
      stmt.free();
      return {
        columns,
        rows
      };
    } catch (error) {
      return {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Create singleton instance
let sqliteEngine: SQLiteEngine | null = null;

export const getSQLiteEngine = (): SQLiteEngine => {
  if (!sqliteEngine) {
    sqliteEngine = new SQLiteEngine();
  }
  return sqliteEngine;
};

// Exercise solutions remain the same
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

  // Đáp án bài 2: Thêm chú thích về julianday
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
  SUM(SubTotal) >= 200000;`
};
