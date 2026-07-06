export interface GlossaryEntry {
  term: string;
  definition: string;
  example: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  "market cap": {
    term: "Market cap",
    definition:
      "The total value of all a company's shares put together. It tells you how big the company is in the market's eyes.",
    example:
      "If a company has 100 shares and each costs ₹10, its market cap is ₹1,000.",
  },
  "p/e ratio": {
    term: "P/E ratio",
    definition:
      "Price-to-Earnings ratio — how much investors pay for every ₹1 the company earns. A lower P/E than similar companies can mean the stock is cheaper relative to its profits.",
    example:
      "A P/E of 20 means you pay ₹20 for every ₹1 of yearly profit.",
  },
  "p/b ratio": {
    term: "P/B ratio",
    definition:
      "Price-to-Book ratio — compares the stock price to the company's net assets (what it owns minus what it owes).",
    example:
      "A P/B of 2 means the market values the company at twice its on-paper worth.",
  },
  roe: {
    term: "ROE",
    definition:
      "Return on Equity — how much profit a company generates from the money shareholders have put in. Higher usually means the business uses money efficiently.",
    example: "An ROE of 15% means ₹15 profit per year for every ₹100 of shareholder money.",
  },
  "debt-to-equity": {
    term: "Debt-to-Equity",
    definition:
      "How much a company borrows compared to what its owners have invested. High debt can be risky if profits dip.",
    example: "A ratio of 0.5 means ₹50 of debt for every ₹100 of owner money.",
  },
  rsi: {
    term: "RSI",
    definition:
      "Relative Strength Index — a 0–100 gauge of recent price momentum. Above ~70 often means a stock has risen fast and may pause; below ~30 means it has fallen hard.",
    example: "An RSI of 72 suggests the recent rally may be running hot.",
  },
  "moving average": {
    term: "Moving average",
    definition:
      "The average price over a recent period (like 200 days). Trading above it is often read as a healthy long-term trend.",
    example:
      "If today's price is above the 200-day average, the long-term trend is up.",
  },
  "dividend yield": {
    term: "Dividend yield",
    definition:
      "The yearly cash a company pays shareholders, as a percentage of its stock price. Like interest, but not guaranteed.",
    example: "A 2% yield pays about ₹2 per year for every ₹100 invested.",
  },
  dividend: {
    term: "Dividend",
    definition:
      "A portion of a company's profits paid out to shareholders, usually in cash a few times a year.",
    example: "Own 10 shares, and a ₹5-per-share dividend puts ₹50 in your account.",
  },
  "index fund": {
    term: "Index fund",
    definition:
      "A fund that simply buys every stock in a market index (like the Nifty 50), so you own a small slice of many companies at once.",
    example: "One ₹500 purchase of a Nifty 50 index fund spreads across all 50 companies.",
  },
  "mutual fund": {
    term: "Mutual fund",
    definition:
      "A pool of money from many investors, managed by professionals who buy a basket of stocks or bonds on everyone's behalf.",
    example: "₹1,000 in a mutual fund buys you units of a portfolio holding dozens of stocks.",
  },
  diversification: {
    term: "Diversification",
    definition:
      "Spreading money across different investments so one bad performer doesn't sink everything.",
    example: "Owning tech + banking + healthcare beats betting it all on one stock.",
  },
  "risk tolerance": {
    term: "Risk tolerance",
    definition:
      "How much ups and downs you can handle without panic-selling. One of the most important things to know about yourself as an investor.",
    example: "If a 20% temporary drop would make you sell, your risk tolerance is low.",
  },
  "revenue growth": {
    term: "Revenue growth",
    definition:
      "How fast a company's total sales are increasing year over year. Growing sales usually come before growing profits.",
    example: "10% revenue growth means the company sold 10% more than last year.",
  },
  volatility: {
    term: "Volatility",
    definition:
      "How much and how quickly a price swings up and down. Higher volatility means bigger short-term gains and losses.",
    example: "A stock that moves ±5% daily is far more volatile than one moving ±0.5%.",
  },
  "repo rate": {
    term: "Repo rate",
    definition:
      "The interest rate at which India's central bank (RBI) lends to banks. It influences loan rates, savings rates, and often the stock market.",
    example: "When the repo rate falls, loans get cheaper and markets often cheer.",
  },
};

export function lookupTerm(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key.toLowerCase()];
}
