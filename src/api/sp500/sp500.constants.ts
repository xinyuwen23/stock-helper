enum yahoo_finance {
  symbol = '^GSPC',
  interval = '1d',
  range = '15y',
}

export const YAHOO_FINANCE_API_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${yahoo_finance.symbol}?interval=${yahoo_finance.interval}&range=${yahoo_finance.range}`;

export const SP500_DB_ROUTE = './sp500_data.db';

export enum SP500_DB_SCHEMA {
  CREATE_TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS sp500 (
        date TEXT PRIMARY KEY,
        open REAL,
        high REAL,
        low REAL,
        close REAL,
        volume INTEGER
    )
`,
  INSERT_DATA = `INSERT OR IGNORE INTO sp500 (date, open, high, low, close, volume) 
             VALUES (?, ?, ?, ?, ?, ?)`,
}

export const TIME_ZONE = 'America/New_York';
