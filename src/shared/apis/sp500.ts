// export function getSP500Data() {
//   const db = new sqlite3.Database(SP500_DB_ROUTE);
//   const cutoffDate = new Date(2010, 0, 1);

//   return from(axios.get<SP500Data>(YAHOO_FINANCE_API_URL.SP500)).pipe(
//     map(response => {
//       const result = response.data.chart.result[0];

//       if (!result || !result.timestamp || !result.indicators) {
//         throw new Error('Invalid S&P 500 API response');
//       }

//       const { timestamp } = result;
//       const { open, high, low, close, volume } = result.indicators.quote[0];

//       return timestamp
//         .map((ts, i) => {
//           const estDate = toZonedTime(fromUnixTime(ts), TIME_ZONE);
//           return {
//             date: format(estDate, 'MM-dd-yyyy'),
//             timestamp: estDate.getTime(),
//             open: open[i] !== null ? open[i] : null,
//             high: high[i] !== null ? high[i] : null,
//             low: low[i] !== null ? low[i] : null,
//             close: close[i] !== null ? close[i] : null,
//             volume: volume[i] !== null ? volume[i] : null,
//           };
//         })
//         .filter(entry => entry.timestamp >= cutoffDate.getTime());
//     }),
//     tap(data => {
//       const stmt = db.prepare(SP500_DB_SCHEMA.INSERT_SP500_DATA);

//       data.forEach(entry => {
//         stmt.run(entry.date, entry.open, entry.high, entry.low, entry.close, entry.volume);
//         console.log(`Storing ${entry.date}, ${entry.open}, ${entry.high}, ${entry.low}, ${entry.close}, ${entry.volume} to DB`);
//       });

//       stmt.finalize();
//       db.close();
//       console.log(`Stored ${data.length} S&P 500 records.`);
//     }),
//     catchError(error => {
//       console.error('Failed to fetch S&P 500 data:', error);
//       db.close();
//       return EMPTY;
//     })
//   );
// }