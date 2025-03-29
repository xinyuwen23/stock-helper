import { FILE_PATH } from '../constants';
import { createOrReadJSON, patchDataToJSON } from '../json';

const PERIOD = 14;

export function calculateRSI(data: any[]): any[] {
  if (data.length < PERIOD) return data.map(entry => ({ ...entry, sp500: { ...entry.sp500, indicators: { ...entry.sp500?.indicators, rsi: null } } }));

  const closePrices = data.map(d => d.sp500.close);
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 1; i < closePrices.length; i++) {
    const diff = closePrices[i] - closePrices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  let avgGain = gains.slice(0, PERIOD).reduce((a, b) => a + b, 0) / PERIOD;
  let avgLoss = losses.slice(0, PERIOD).reduce((a, b) => a + b, 0) / PERIOD;

  let rsiValues: (number | null)[] = new Array(PERIOD).fill(null);

  for (let i = PERIOD; i < closePrices.length; i++) {
    avgGain = (avgGain * (PERIOD - 1) + gains[i - 1]) / PERIOD;
    avgLoss = (avgLoss * (PERIOD - 1) + losses[i - 1]) / PERIOD;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);
  }

  return data.map((entry, index) => ({
    ...entry,
    sp500: {
      ...entry.sp500,
      indicators: {
        ...entry.sp500?.indicators,
        rsi: rsiValues[index],
      },
    },
  }));
}

export function saveRSIToJSON(filePath: FILE_PATH): void {
  const existingData = createOrReadJSON(filePath);
  const updatedData = calculateRSI(existingData);
  patchDataToJSON(filePath, updatedData, 'date');
}
