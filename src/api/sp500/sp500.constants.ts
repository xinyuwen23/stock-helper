enum yahoo_finance {
  symbol = '^GSPC',
  interval = '1d',
  range = '15d',
}

export enum YAHOO_FINANCE_API_URL {
  SP500 = `https://query1.finance.yahoo.com/v8/finance/chart/${yahoo_finance.symbol}?interval=${yahoo_finance.interval}&range=${yahoo_finance.range}`,
  VIX = `https://query1.finance.yahoo.com/v8/finance/chart/^VIX?interval=${yahoo_finance.interval}&range=${yahoo_finance.range}`,
}

export const SP500_DB_ROUTE = './sp500_data.db';

export enum SP500_DB_SCHEMA {
  CREATE_TABLE = `
    CREATE TABLE IF NOT EXISTS sp500_data (
      date TEXT PRIMARY KEY,
      open REAL,
      high REAL,
      low REAL,
      close REAL,
      volume INTEGER,
      vix REAL
    )
  `,
  INSERT_SP500_DATA = `
    INSERT INTO sp500_data (date, open, high, low, close, volume)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      open=excluded.open,
      high=excluded.high,
      low=excluded.low,
      close=excluded.close,
      volume=excluded.volume
  `,
  INSERT_VIX_DATA = `
    UPDATE sp500_data
    SET vix = ?
    WHERE date = ?
  `,
}

export const TIME_ZONE = 'America/New_York';
