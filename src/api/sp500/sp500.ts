import axios from 'axios';
import { from, EMPTY } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import sqlite3 from 'sqlite3';
import { SP500Data } from './sp500.model';
import { SP500_DB_ROUTE, SP500_DB_SCHEMA, TIME_ZONE, YAHOO_FINANCE_API_URL } from './sp500.constants';
import { format, fromUnixTime } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { VIXData } from './vix.model';

function initializeDatabase() {
  const db = new sqlite3.Database(SP500_DB_ROUTE);
  db.run(SP500_DB_SCHEMA.CREATE_TABLE);
  db.close();
}

function fetchAndStoreSP500Data() {
  const db = new sqlite3.Database(SP500_DB_ROUTE);
  const cutoffDate = new Date(2010, 0, 1); // 2010-01-01

  return from(axios.get<SP500Data>(YAHOO_FINANCE_API_URL.SP500)).pipe(
    map(response => {
      const result = response.data.chart.result[0];

      if (!result || !result.timestamp || !result.indicators) {
        throw new Error('Invalid S&P 500 API response');
      }

      const { timestamp } = result;
      const { open, high, low, close, volume } = result.indicators.quote[0];

      return timestamp
        .map((ts, i) => {
          const estDate = toZonedTime(fromUnixTime(ts), TIME_ZONE);
          return {
            date: format(estDate, 'MM-dd-yyyy'),
            timestamp: estDate.getTime(), // 用于过滤
            open: open[i] !== null ? open[i] : null,
            high: high[i] !== null ? high[i] : null,
            low: low[i] !== null ? low[i] : null,
            close: close[i] !== null ? close[i] : null,
            volume: volume[i] !== null ? volume[i] : null,
          };
        })
        .filter(entry => entry.timestamp >= cutoffDate.getTime()); // 只保留 2010-01-01 之后的数据
    }),
    tap(data => {
      const stmt = db.prepare(SP500_DB_SCHEMA.INSERT_SP500_DATA);

      data.forEach(entry => {
        stmt.run(entry.date, entry.open, entry.high, entry.low, entry.close, entry.volume);
        console.log(`Storing ${entry.date}, ${entry.open}, ${entry.high}, ${entry.low}, ${entry.close}, ${entry.volume} to DB`);
      });

      stmt.finalize();
      db.close();
      console.log(`Stored ${data.length} S&P 500 records.`);
    }),
    catchError(error => {
      console.error('Failed to fetch S&P 500 data:', error);
      db.close();
      return EMPTY;
    })
  );
}

function fetchAndStoreVIXData() {
  const db = new sqlite3.Database(SP500_DB_ROUTE);

  return from(axios.get<VIXData>(YAHOO_FINANCE_API_URL.VIX)).pipe(
    map(response => {
      const result = response.data.chart.result[0];

      if (!result || !result.timestamp || !result.indicators) {
        throw new Error('Invalid VIX API response');
      }

      const timestamps = result.timestamp;
      const vixValues = result.indicators.quote[0].close;

      return timestamps.map((ts: number, i: number) => ({
        date: format(toZonedTime(fromUnixTime(ts), TIME_ZONE), 'MM-dd-yyyy'),
        vix: vixValues[i] !== null ? vixValues[i] : null,
      }));
    }),
    tap(async data => {
      const stmt = db.prepare(SP500_DB_SCHEMA.INSERT_VIX_DATA);

      let updatedCount = 0;

      for (const entry of data) {
        await new Promise<void>((resolve, reject) => {
          stmt.run(entry.vix, entry.date, (err: any) => {
            if (err) {
              reject(err);
            } else {
              console.log(`Storing ${(entry.date, entry.vix)} to DB`);
              resolve();
            }
          });
        });
      }

      stmt.finalize();
      db.close();
      console.log(`Updated ${updatedCount} records with VIX data.`);
    }),
    catchError(error => {
      console.error('Failed to fetch VIX data:', error);
      db.close();
      return EMPTY;
    })
  );
}

export function getStockData() {
  initializeDatabase();
  fetchAndStoreSP500Data().subscribe(() => {
    fetchAndStoreVIXData().subscribe();
  });
}
