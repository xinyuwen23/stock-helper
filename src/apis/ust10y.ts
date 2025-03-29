import axios from 'axios';
import { format, fromUnixTime } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { catchError, EMPTY, from, map, tap } from 'rxjs';
import { DATE_FORMAT, TIME_ZONE, YAHOO_FINANCE_API_URL } from '../constants';
import { YahooUST10YResponse } from '../models';

export function fetchUST10YData() {
  return from(axios.get<YahooUST10YResponse>(YAHOO_FINANCE_API_URL.UST10Y)).pipe(
    map(response => {
      const result = response.data.chart.result[0];

      if (!result || !result.timestamp || !result.indicators) {
        throw new Error('Invalid UST10Y API response');
      }

      const timestamps = result.timestamp;
      const yields = result.indicators.quote[0].close;

      return timestamps.map((ts, i) => ({
        date: format(toZonedTime(fromUnixTime(ts), TIME_ZONE), DATE_FORMAT),
        ust10y: yields[i] !== null ? yields[i] : null,
      }));
    }),
    tap(() => console.log('UST10Y data retrieved successfully')),

    catchError(error => {
      console.error('Failed to fetch UST10Y data:', error);
      return EMPTY;
    })
  );
}
