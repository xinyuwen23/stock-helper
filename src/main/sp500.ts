import { parse } from 'date-fns';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { fetchSP500Data, fetchUST10YData, fetchVIXData } from '../shared/apis';
import { DATE_FORMAT, FILE_PATH, JSON_PRIMARY_KEY } from '../shared/constants';
import { createOrReadJSON, patchDataToJSON } from '../shared/util';

function fetchAndStoreSP500IntegratedData() {
  return forkJoin([fetchSP500Data(), fetchVIXData(), fetchUST10YData()]).pipe(
    map(([sp500Data, vixData, ust10yData]) => {
      const existingData = createOrReadJSON(FILE_PATH.SP500);

      const newDataMap = new Map(
        sp500Data.map(sp500Entry => [
          sp500Entry.date,
          {
            date: sp500Entry.date,
            sp500: sp500Entry.sp500,
            vix: null as number | null,
            ust10y: null as number | null,
          },
        ])
      );

      vixData.forEach(vixEntry => {
        if (newDataMap.has(vixEntry.date)) {
          newDataMap.get(vixEntry.date)!.vix = vixEntry.vix;
        }
      });

      ust10yData.forEach(ust10yEntry => {
        if (newDataMap.has(ust10yEntry.date)) {
          newDataMap.get(ust10yEntry.date)!.ust10y = ust10yEntry.ust10y;
        }
      });

      const existingDataMap = new Map(existingData.map(entry => [entry.date, entry]));

      newDataMap.forEach((value, date) => {
        existingDataMap.set(date, value);
      });

      return Array.from(existingDataMap.values()).sort(
        (a, b) => parse(a.date, DATE_FORMAT, new Date()).getTime() - parse(b.date, DATE_FORMAT, new Date()).getTime()
      );
    }),
    tap(mergedData => {
      patchDataToJSON(FILE_PATH.SP500, mergedData, JSON_PRIMARY_KEY.SP500);
      console.log('All data has been merged and saved to data.json');
    }),
    catchError(error => {
      console.error('Error while fetching and storing all data:', error);
      return EMPTY;
    })
  );
}

export function retrieveSP500Data() {
  fetchAndStoreSP500IntegratedData().subscribe();
}
