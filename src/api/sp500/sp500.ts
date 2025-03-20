import axios from 'axios';
import { from, EMPTY, forkJoin } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { format, fromUnixTime, isBefore, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { SP500Data } from '../../shared/models/sp500.model';
import { VIXData } from '../../shared/models/vix.model';
import { UST10YData } from '../../shared/models/ust10y.model';
import { YAHOO_FINANCE_API_URL, TIME_ZONE, MIN_DATE, DATE_FORMAT } from '../../shared/constants/sp500.constants';
import { FilePath, saveDataToJSON } from '../../shared/util';

function fetchSP500Data() {
  return from(axios.get<SP500Data>(YAHOO_FINANCE_API_URL.SP500)).pipe(
    map(response => {
      console.log('SP500 data retrieved');

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
    catchError(error => {
      console.error('Failed to fetch S&P 500 data:', error);
      return EMPTY;
    })
  );
}

function fetchVIXData() {
  return from(axios.get<VIXData>(YAHOO_FINANCE_API_URL.VIX)).pipe(
    map(response => {
      console.log('VIX data retrieved');

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
    catchError(error => {
      console.error('Failed to fetch VIX data:', error);
      return EMPTY;
    })
  );
}

function fetchUST10YData() {
  return from(axios.get<UST10YData>(YAHOO_FINANCE_API_URL.UST10Y)).pipe(
    map(response => {
      console.log('UST10Y data retrieved');

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
    catchError(error => {
      console.error('Failed to fetch UST10Y data:', error);
      return EMPTY;
    })
  );
}

function fetchAndStoreAllData() {
  return forkJoin([fetchSP500Data(), fetchVIXData(), fetchUST10YData()]).pipe(
    map(([sp500Data, vixData, ust10yData]) => {
      return sp500Data.map(sp500Entry => {
        const vixEntry = vixData.find(vix => vix.date === sp500Entry.date);
        const ust10yEntry = ust10yData.find(ust10y => ust10y.date === sp500Entry.date);

        return {
          date: sp500Entry.date,
          sp500: sp500Entry.sp500,
          vix: vixEntry ? vixEntry.vix : null,
          ust10y: ust10yEntry ? ust10yEntry.ust10y : null,
        };
      });
    }),
    tap(allData => {
      saveDataToJSON(FilePath.SP500, allData);
      console.log('All data has been saved to data.json');
    }),
    catchError(error => {
      console.error('Error while fetching and storing all data:', error);
      return EMPTY;
    })
  );
}

export function getStockData() {
  fetchAndStoreAllData().subscribe();
}
