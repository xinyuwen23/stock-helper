import axios from 'axios';
import { format, fromUnixTime, isBefore, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { catchError, EMPTY, from, map, tap } from 'rxjs';
import { DATE_FORMAT, MIN_DATE, TIME_ZONE, YAHOO_FINANCE_API_URL } from '../constants';
import { YahooSP500Response } from '../models';

export function fetchSP500Data() {
  return from(axios.get<YahooSP500Response>(YAHOO_FINANCE_API_URL.SP500)).pipe(
    map(response => {
      const minDate = parse(MIN_DATE, DATE_FORMAT, new Date());

      const result = response.data.chart.result[0];

      if (!result || !result.timestamp || !result.indicators) {
        throw new Error('Invalid S&P 500 API response');
      }

      const { timestamp } = result;
      const { open, high, low, close, volume } = result.indicators.quote[0];

      return timestamp
        .map((ts, i) => {
          const date = format(toZonedTime(fromUnixTime(ts), TIME_ZONE), DATE_FORMAT);

          return {
            date,
            sp500: {
              open: open[i] !== null ? open[i] : null,
              high: high[i] !== null ? high[i] : null,
              low: low[i] !== null ? low[i] : null,
              close: close[i] !== null ? close[i] : null,
              volume: volume[i] !== null ? volume[i] : null,
            },
          };
        })
        .filter(entry => entry.sp500.open !== null)
        .filter(entry => !isBefore(parse(entry.date, DATE_FORMAT, new Date()), minDate));
    }),
    tap(() => console.log('SP500 data retrieved successfully')),

    catchError(error => {
      console.error('Failed to fetch S&P 500 data:', error);
      return EMPTY;
    })
  );
}
