import axios from 'axios';
import { format, fromUnixTime } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { catchError, EMPTY, from, map, tap } from 'rxjs';
import { TIME_ZONE, YAHOO_FINANCE_API_URL } from '../constants';
import { YahooVIXResponse } from '../models';

export function fetchVIXData() {
  return from(axios.get<YahooVIXResponse>(YAHOO_FINANCE_API_URL.VIX)).pipe(
    map(response => {
      const result = response.data.chart.result[0];

      if (!result || !result.timestamp || !result.indicators) {
        throw new Error('Invalid VIX API response');
      }

      const timestamps = result.timestamp;
      const vixValues = result.indicators.quote[0].close;

      return timestamps.map((ts, i) => ({
        date: format(toZonedTime(fromUnixTime(ts), TIME_ZONE), 'MM-dd-yyyy'),
        vix: vixValues[i] !== null ? vixValues[i] : null,
      }));
    }),
    tap(() => console.log('VIX data retrieved')),

    catchError(error => {
      console.error('Failed to fetch VIX data:', error);
      return EMPTY;
    })
  );
}
