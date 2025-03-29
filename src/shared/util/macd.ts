import { createOrReadJSON, patchDataToJSON } from '.';
import { FILE_PATH } from '../constants';

const shortPeriod = 12;
const longPeriod = 26;
const signalPeriod = 9;

export function saveMACDToJSON(filePath: FILE_PATH): void {
  try {
    const existingData = createOrReadJSON(filePath);
    const macdData = calculateMACD(existingData);

    patchDataToJSON(filePath, macdData, 'date');

    console.log('MACD data saved successfully.');
  } catch (err) {
    console.error('Error saving MACD data:', err);
  }
}

export function calculateMACD(data: any[]): any[] {
  const closePrices = data.map(d => d.sp500.close);
  const shortEMA = calculateEMA(shortPeriod, closePrices);
  const longEMA = calculateEMA(longPeriod, closePrices);
  const macdLine = shortEMA.map((ema, i) => (isNaN(ema) || isNaN(longEMA[i]) ? NaN : ema - longEMA[i]));
  const signalLine = calculateEMA(
    signalPeriod,
    macdLine.filter(v => !isNaN(v))
  );
  const histogram = macdLine.map((macd, i) => (isNaN(macd) || isNaN(signalLine[i]) ? NaN : macd - signalLine[i]));

  return data.map((entry, index) => ({
    ...entry,
    sp500: {
      ...entry.sp500,
      indicators: {
        ...(entry.sp500.indicators || {}),
        macd: {
          macd: isNaN(macdLine[index]) ? null : macdLine[index],
          signal: isNaN(signalLine[index]) ? null : signalLine[index],
          histogram: isNaN(histogram[index]) ? null : histogram[index],
        },
      },
    },
  }));
}

function calculateEMA(period: number, prices: number[]): number[] {
  const multiplier = 2 / (period + 1);
  let emaArray: number[] = [];

  let previousEMA = prices.find(price => !isNaN(price));
  if (previousEMA === undefined) return Array(prices.length).fill(NaN);

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      emaArray.push(previousEMA);
    } else {
      previousEMA = (prices[i] - previousEMA) * multiplier + previousEMA;
      emaArray.push(previousEMA);
    }
  }

  return emaArray;
}
