import axios from 'axios';
import { from, EMPTY } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import sqlite3 from 'sqlite3';
import { SP500Data } from './sp500.model';
import { SP500_DB_ROUTE, SP500_DB_SCHEMA, TIME_ZONE, YAHOO_FINANCE_API_URL } from './sp500.constants';
import { format, fromUnixTime } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function fetchSP500Data() {
  const db = new sqlite3.Database(SP500_DB_ROUTE);

  db.run(SP500_DB_SCHEMA.CREATE_TABLE_SCHEMA);

  return from(axios.get<SP500Data>(YAHOO_FINANCE_API_URL)).pipe(
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

      console.log(`Received data: ${timestamp.length} records`);

      const stmt = db.prepare(SP500_DB_SCHEMA.INSERT_DATA);

      timestamp.forEach((ts, i) => {
        const date = toZonedTime(fromUnixTime(ts), TIME_ZONE);
        const formattedDate = format(date, 'MM-dd-yyyy');

        stmt.run(formattedDate, open[i], high[i], low[i], close[i], volume[i]);
      });

      stmt.finalize();
      console.log(`Successfully stored ${timestamp.length} records`);
    }),
    catchError(error => {
      console.error('API request failed:', error);
      db.close(() => console.log('Database connection closed due to error'));
      return EMPTY;
    })
  );
}
