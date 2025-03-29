enum YAHOO_FINANCE_SYMBOL {
  SP500 = '^GSPC',
  VIX = '^VIX',
  UAT10Y = '^TNX',
}

enum YAHOO_FINANCE_URL_PARAM {
  INTERVAL = '1d',
  RANGE = '16y',
}

export enum YAHOO_FINANCE_API_URL {
  SP500 = `https://query1.finance.yahoo.com/v8/finance/chart/${YAHOO_FINANCE_SYMBOL.SP500}?interval=${YAHOO_FINANCE_URL_PARAM.INTERVAL}&range=${YAHOO_FINANCE_URL_PARAM.RANGE}`,
  VIX = `https://query1.finance.yahoo.com/v8/finance/chart/${YAHOO_FINANCE_SYMBOL.VIX}?interval=${YAHOO_FINANCE_URL_PARAM.INTERVAL}&range=${YAHOO_FINANCE_URL_PARAM.RANGE}`,
  UST10Y = `https://query1.finance.yahoo.com/v8/finance/chart/${YAHOO_FINANCE_SYMBOL.UAT10Y}?interval=${YAHOO_FINANCE_URL_PARAM.INTERVAL}&range=${YAHOO_FINANCE_URL_PARAM.RANGE}`,
}
