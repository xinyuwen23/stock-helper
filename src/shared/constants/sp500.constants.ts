enum yahoo_finance {
  symbol = '^GSPC',
  interval = '1d',
  range = '16y',
}

export enum YAHOO_FINANCE_API_URL {
  SP500 = `https://query1.finance.yahoo.com/v8/finance/chart/${yahoo_finance.symbol}?interval=${yahoo_finance.interval}&range=${yahoo_finance.range}`,
  VIX = `https://query1.finance.yahoo.com/v8/finance/chart/^VIX?interval=${yahoo_finance.interval}&range=${yahoo_finance.range}`,
  UST10Y = `https://query1.finance.yahoo.com/v8/finance/chart/^TNX?interval=${yahoo_finance.interval}&range=${yahoo_finance.range}`,
}

export const TIME_ZONE = 'America/New_York';

export const MIN_DATE = '01-01-2010';

export const DATE_FORMAT = 'MM-dd-yyyy';
