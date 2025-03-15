import axios from 'axios';
import { from, EMPTY } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import sqlite3 from 'sqlite3';
import { SP500Data } from './sp500.interface';

// Create SQLite database connection
const db = new sqlite3.Database('./sp500_data.db');

// Ensure the table exists
db.run(`
    CREATE TABLE IF NOT EXISTS sp500 (
        timestamp INTEGER PRIMARY KEY,
        open REAL,
        high REAL,
        low REAL,
        close REAL,
        volume INTEGER
    )
`);

// Close database connection on process exit
process.on('exit', () => {
  db.close();
  console.log('Database connection closed');
});

// Yahoo Finance API URL
const symbol = '^GSPC'; // Fetching only S&P 500
const API_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;

// Fetch S&P 500 data and process it
export const fetchSp500Data$ = from(axios.get<SP500Data>(API_URL)).pipe(
  map(response => {
    const result = response.data.chart.result[0];

    if (!result || !result.timestamp || !result.indicators) {
      throw new Error('Invalid API response');
    }

    return result;
  }),
  tap(result => {
    const { timestamp } = result;
    const { open, high, low, close, volume } = result.indicators.quote[0];

    console.log(`Received data: ${new Date(timestamp[0] * 1000).toISOString()} - ${new Date(timestamp[timestamp.length - 1] * 1000).toISOString()}`);

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO sp500 (timestamp, open, high, low, close, volume) 
             VALUES (?, ?, ?, ?, ?, ?)`
    );

    timestamp.forEach((ts, i) => {
      stmt.run(ts, open[i], high[i], low[i], close[i], volume[i]);
    });

    stmt.finalize();
    console.log(`Successfully stored ${timestamp.length} records`);
  }),
  catchError(error => {
    console.error('API request failed:', error);
    return EMPTY; // Prevents stream from crashing
  })
);
