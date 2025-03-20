export type YahooSP500Response = {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        exchangeName: string;
        fullExchangeName: string;
        instrumentType: string;
        firstTradeDate: number;
        regularMarketTime: number;
        hasPrePostMarketData: boolean;
        gmtoffset: number;
        timezone: string;
        exchangeTimezoneName: string;
        regularMarketPrice: number;
        fiftyTwoWeekHigh: number;
        fiftyTwoWeekLow: number;
        regularMarketDayHigh: number;
        regularMarketDayLow: number;
        regularMarketVolume: number;
        longName: string;
        shortName: string;
        chartPreviousClose: number;
        priceHint: number;
        currentTradingPeriod: {
          pre: {
            timezone: string;
            start: number;
            end: number;
            gmtoffset: number;
          };
          regular: {
            timezone: string;
            start: number;
            end: number;
            gmtoffset: number;
          };
          post: {
            timezone: string;
            start: number;
            end: number;
            gmtoffset: number;
          };
        };
        dataGranularity: string;
        range: string;
        validRanges: Array<string>;
      };
      timestamp: Array<number>;
      indicators: {
        quote: Array<{
          volume: Array<number>;
          high: Array<number>;
          close: Array<number>;
          open: Array<number>;
          low: Array<number>;
        }>;
        adjclose: Array<{
          adjclose: Array<number>;
        }>;
      };
    }>;
    error: any;
  };
};
