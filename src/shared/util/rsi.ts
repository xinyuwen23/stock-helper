import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { SP500_DB_ROUTE } from '../constants/sp500.constants';

// 获取 S&P 500 收盘价数据
export async function getSP500ClosePricesFromDB(dbPath: string): Promise<number[]> {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  const rows = await db.all('SELECT close FROM sp500_data ORDER BY date ASC');
  await db.close();

  return rows.map((row: { close: any }) => row.close);
}

// 计算 RSI（14 天默认周期）
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) {
    throw new Error('价格数据不足以计算 RSI');
  }

  const gains: number[] = [];
  const losses: number[] = [];

  // 计算第一个平均涨幅和平均跌幅
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains.push(change), (avgGain += change);
    else losses.push(Math.abs(change)), (avgLoss += Math.abs(change));
  }
  avgGain /= period;
  avgLoss /= period;

  const rsiValues: number[] = [];

  // 计算 RSI
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);
  }

  console.log(rsiValues);

  return rsiValues;
}

export async function calculateRsiValues() {
  const prices = await getSP500ClosePricesFromDB(SP500_DB_ROUTE);
  const rsiValues = calculateRSI(prices);
}
