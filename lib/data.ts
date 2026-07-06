// ---------------------------------------------------------------------------
// Mock data layer.
// Every function here mirrors the shape of a future API call
// (stock-nse-india / Twelve Data / FMP / Alpha Vantage / Finnhub),
// so swapping in real data later means changing implementations, not pages.
// ---------------------------------------------------------------------------

export type Market = "NSE" | "NASDAQ" | "NYSE";

export interface CompanyProfile {
  /** Plain-language one-para summary shown at the top */
  summary: string;
  /** How the business actually makes its money */
  howItEarns: string;
  /** Founding story, key milestones, major pivots */
  history: string;
  /** What analysts and investors focus on */
  whyInvestorsWatch: string;
  /** Honest risks a beginner should know before investing */
  risks: string;
  /** Quick-glance facts */
  founded: string;
  hq: string;
  employees: string;
}

export interface Company {
  symbol: string;
  name: string;
  market: Market;
  sector: "Tech" | "Banking" | "Auto" | "Healthcare" | "Energy";
  currency: "₹" | "$";
  price: number;
  changePct: number;
  cap: "Large Cap" | "Mid Cap" | "Small Cap";
  blurb: string;
  about: CompanyProfile;
  fundamentals: {
    pe: number;
    sectorPe: number;
    pb: number;
    roe: number;
    debtToEquity: number;
    revenueGrowth: number;
    dividendYield: number;
  };
  technicals: {
    rsi: number;
    trend: "above" | "below";
    volumeTrend: "rising" | "falling" | "flat";
  };
  score: number;
}

export interface Fund {
  id: string;
  name: string;
  type: "Index Fund" | "Hybrid Fund" | "Debt Fund" | "Equity Fund";
  risk: "low" | "medium" | "high";
  fiveYearReturn: number;
  minInvest: number;
  blurb: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  daysAgo: number;
  relatedSymbol?: string;
}

// --- Companies ---------------------------------------------------------------

export const COMPANIES: Company[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    market: "NSE",
    sector: "Energy",
    currency: "₹",
    price: 2954.2,
    changePct: 1.24,
    cap: "Large Cap",
    blurb: "High market cap stability.",
    about: {
      summary:
        "Reliance Industries is India's largest company by market value — a giant conglomerate that touches almost every part of daily life in India. It runs the country's biggest oil refinery, operates the largest telecom network (Jio), and owns India's fastest-growing retail chain. Think of it as three Fortune-500-sized companies bundled under one stock.",

      howItEarns:
        "Reliance makes money from three very different engines. Its Oil-to-Chemicals (O2C) segment refines crude oil and sells petrol, diesel, and petrochemicals globally — this is still the biggest revenue contributor. Its digital arm, Jio Platforms, earns through mobile data plans, fiber broadband, and digital services like JioTV and JioMart; with over 470 million subscribers, it is one of the world's largest telecom operators by user count. Reliance Retail, the third pillar, runs thousands of supermarkets, fashion stores (Trends), and electronics outlets (Digital), and has been expanding rapidly into quick commerce and B2B grocery supply.",

      history:
        "Reliance was founded in 1966 by Dhirubhai Ambani, who began as a yarn trader in Mumbai before building a textile empire. The company went public in 1977, famously attracting millions of small retail investors — a rarity in India at the time. After Dhirubhai's death in 2002, the business split between his two sons; Mukesh Ambani retained Reliance Industries while Anil received other entities. Under Mukesh, Reliance made its boldest move yet: launching Jio in 2016 with effectively free data and calls, collapsing the cost of mobile internet and connecting hundreds of millions of first-time internet users almost overnight. This move disrupted three incumbent telecom giants and redefined Reliance as a technology and consumer company, not just an energy firm.",

      whyInvestorsWatch:
        "Investors track Reliance for two main reasons. First, the pace at which Jio and Reliance Retail grow their revenue — these newer businesses now account for more than half the company's EBITDA and trade at much higher valuations than oil refining. Second, Reliance's large capital allocation decisions: the company has historically made bold, long-horizon bets (launching Jio, acquiring Future Retail assets, backing new energy), and the market closely watches whether those bets pay off. Mukesh Ambani has also publicly committed to a clean-energy buildout — solar panels, green hydrogen, batteries — which could be the next major growth vector.",

      risks:
        "Reliance's oil-refining business is exposed to global crude price swings and regulatory risk from India's energy transition. Jio faces intensifying price competition from Airtel and Vi. The retail business is capital-intensive and margins are thin. At a market cap near ₹20 lakh crore, even strong earnings growth needs to be exceptional to move the stock meaningfully. Succession and governance concentration around the Ambani family is also a risk some institutional investors flag.",

      founded: "1966",
      hq: "Mumbai, India",
      employees: "~2,36,000",
    },
    fundamentals: {
      pe: 27.4, sectorPe: 22.1, pb: 2.3,
      roe: 9.8, debtToEquity: 0.44, revenueGrowth: 11.2, dividendYield: 0.34,
    },
    technicals: { rsi: 58, trend: "above", volumeTrend: "rising" },
    score: 7.6,
  },

  {
    symbol: "AAPL",
    name: "Apple Inc.",
    market: "NASDAQ",
    sector: "Tech",
    currency: "$",
    price: 174.5,
    changePct: 0.85,
    cap: "Large Cap",
    blurb: "Solid dividend consistency.",
    about: {
      summary:
        "Apple is the world's most valuable company by market cap — a consumer electronics and software giant whose products are used by over two billion people worldwide. While it is best known for the iPhone, Apple has quietly built one of the most profitable services businesses in history, making it far more than a phone maker.",

      howItEarns:
        "Apple earns from two main categories. Products — iPhone, Mac, iPad, Apple Watch, AirPods — account for roughly 75% of revenue, with iPhone alone contributing about half the total. Services — the App Store (Apple takes a 15–30% commission on every sale), iCloud storage, Apple Music, Apple TV+, Apple Pay, and Apple Arcade — now generate over $85 billion a year and are growing faster than hardware. Services matter disproportionately because the profit margin on them (around 70%) dwarfs hardware margins (around 36%). This is why analysts watch services growth so closely — it quietly drives most of the profit improvement.",

      history:
        "Apple was founded in 1976 in a Cupertino garage by Steve Jobs, Steve Wozniak, and Ronald Wayne. The Apple II (1977) made personal computing mainstream; the Macintosh (1984) introduced the graphical user interface to mass audiences. By the mid-1990s, Apple was near bankruptcy after a series of failed products. Steve Jobs returned in 1997 following Apple's acquisition of NeXT, streamlined the product line, and launched the iMac. The iPod (2001) and iTunes (2003) reshaped the music industry. The iPhone in 2007 was arguably the most consequential product launch in tech history — it created the smartphone era and an entire app economy. After Jobs's death in 2011, Tim Cook took over and expanded Apple's services, supply chain discipline, and share buybacks, turning Apple into the first company to cross $1 trillion, then $2 trillion, then $3 trillion in market cap.",

      whyInvestorsWatch:
        "Three metrics dominate Apple coverage: iPhone upgrade cycles and unit sales (still the revenue heartbeat), Services revenue growth (the profit quality story), and share buybacks. Apple has returned over $600 billion to shareholders through buybacks in the past decade — one of the largest capital return programmes ever. Investors also watch gross margin trends carefully; when Services becomes a bigger share of revenue, overall margins improve. Apple's entry into spatial computing (Vision Pro) and rumoured work on AI features and an Apple Car are watched as potential next S-curves.",

      risks:
        "Apple is deeply dependent on iPhone, which means slowing upgrade cycles or a recession in key markets like China directly dents earnings. China is both Apple's biggest manufacturing hub and its third-largest revenue market — US-China trade tensions and regulatory pressure from Beijing are persistent risks. The EU and US regulators are targeting Apple's App Store monopoly, which could force it to allow competing payment systems and reduce the commission it charges developers. Services growth, while strong, faces competitive pressure from Spotify, Netflix, and Google in their respective categories.",

      founded: "1976",
      hq: "Cupertino, California, USA",
      employees: "~161,000",
    },
    fundamentals: {
      pe: 28.9, sectorPe: 31.5, pb: 44.1,
      roe: 147.0, debtToEquity: 1.45, revenueGrowth: 6.1, dividendYield: 0.55,
    },
    technicals: { rsi: 54, trend: "above", volumeTrend: "flat" },
    score: 7.9,
  },

  {
    symbol: "TATAMOTORS",
    name: "Tata Motors",
    market: "NSE",
    sector: "Auto",
    currency: "₹",
    price: 987.65,
    changePct: 4.2,
    cap: "Large Cap",
    blurb: "Strong EV momentum this quarter.",
    about: {
      summary:
        "Tata Motors is India's largest automobile company by revenue, making everything from small hatchbacks and SUVs to buses, trucks, and military vehicles. It also owns Jaguar Land Rover (JLR), the iconic British luxury car brand — a pairing that makes Tata Motors a uniquely global story among Indian automakers.",

      howItEarns:
        "Tata Motors earns from two clearly distinct businesses. Jaguar Land Rover, bought in 2008 for $2.3 billion, now contributes over 70% of consolidated revenue and the bulk of profits; JLR sells premium SUVs (Range Rover, Defender, Discovery) to wealthy buyers globally, with the UK, US, China, and Europe as its biggest markets. The India business sells passenger vehicles — led by the Nexon, Punch, Harrier SUVs and Tiago/Altroz hatchbacks — and commercial vehicles (trucks and buses under the Tata brand). In the Indian EV market, Tata is the clear leader, selling the Nexon EV, Tiago EV, and Punch EV, with nearly 70% market share in electric passenger vehicles.",

      history:
        "Tata Motors was founded in 1945 as a locomotive manufacturer, part of the Tata Group conglomerate started by Jamsetji Tata in 1868. It entered automobile manufacturing in 1954 through a technical agreement with Daimler-Benz, later developing entirely indigenous vehicles. The ₹1 lakh Tata Nano (2009) became globally famous as the world's cheapest car — a bold bet that ultimately struggled commercially but showed the company's engineering ambition. The 2008 acquisition of Jaguar Land Rover from Ford for just $2.3 billion (a fraction of Ford's investment) is now considered one of India Inc.'s greatest corporate deals — JLR's turnaround under Tata has been remarkable. Tata Motors has been investing heavily in electric vehicles since 2019 and became profitable at the India level in FY2023 after years of losses.",

      whyInvestorsWatch:
        "Two things dominate Tata Motors coverage: JLR's order book and profitability, and Tata's EV market share in India. JLR's margins have recovered strongly after supply-chain disruptions, and a full order book for Range Rover and Defender gives multi-quarter revenue visibility. In India, EV volume growth is the key metric — Tata's EV leadership is a strategic moat, but competition from MG, Hyundai, and new entrants is intensifying. Investors also watch net debt reduction — Tata Motors carried significant debt for years, and deleveraging is a key part of the investment case.",

      risks:
        "JLR is heavily exposed to China and the UK — geopolitical or macroeconomic deterioration in either market hurts meaningfully. JLR is also in an expensive transition to electric vehicles, which requires large capital spending with uncertain consumer adoption timelines. In India, competition in the SUV segment is intensifying; Tata's lead in EVs could narrow as Hyundai, Kia, and Mahindra launch competitive models. Tata Motors still carries meaningful debt, and a cyclical downturn in global auto demand could squeeze cash flows.",

      founded: "1945",
      hq: "Mumbai, India",
      employees: "~86,000 (India) + ~35,000 (JLR)",
    },
    fundamentals: {
      pe: 17.8, sectorPe: 24.6, pb: 3.1,
      roe: 18.4, debtToEquity: 0.98, revenueGrowth: 14.7, dividendYield: 0.61,
    },
    technicals: { rsi: 66, trend: "above", volumeTrend: "rising" },
    score: 8.1,
  },

  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    market: "NSE",
    sector: "Banking",
    currency: "₹",
    price: 1687.3,
    changePct: 2.1,
    cap: "Large Cap",
    blurb: "Steady loan-book growth.",
    about: {
      summary:
        "HDFC Bank is India's largest private-sector bank and one of the most consistently profitable banks in the world. Over nearly three decades it has built a reputation for disciplined lending and low bad loans — an unusual combination in the Indian banking system, where public-sector banks have historically struggled with high non-performing assets.",

      howItEarns:
        "HDFC Bank earns primarily through net interest income (NII) — the difference between the interest it earns on loans and the interest it pays on deposits. It lends to home buyers, businesses, vehicle purchasers, credit card holders, and corporate borrowers. Fee income from credit cards, insurance distribution, third-party product sales, and transaction banking adds a meaningful non-interest revenue stream. After its merger with parent HDFC Ltd. (India's largest housing finance company) in July 2023, the bank's balance sheet expanded significantly, making it one of the world's top 10 banks by market cap. The merger added a massive home-loan portfolio and gave HDFC Bank direct access to mortgage lending at scale.",

      history:
        "HDFC Bank was incorporated in 1994 as one of the first private-sector banks to receive an RBI licence after India's landmark 1991 liberalisation reforms. It was promoted by HDFC Ltd., the housing finance company founded by Hasmukh Parekh in 1977. Under CEO Aditya Puri (1994–2020), HDFC Bank built a culture of risk discipline and technology investment that became a template for Indian banking. For 26 consecutive years under Puri, the bank never reported a quarterly loss — an extraordinary streak. Sashidhar Jagdishan took over in October 2020 and has continued the bank's expansion while managing the complex HDFC Ltd. merger integration. As of 2024, HDFC Bank has over 8,700 branches and 20,000 ATMs across India.",

      whyInvestorsWatch:
        "Three metrics dominate HDFC Bank coverage: loan growth (the pace at which the book expands), net interest margin (NIM, the spread between lending and deposit rates — a proxy for profitability per rupee lent), and asset quality (GNPA ratio — what percentage of loans have gone bad). HDFC Bank's GNPA has historically been below 1.5%, versus the industry average of over 3%, which is its core competitive moat. Post-merger, investors are also watching the pace of HDFC Bank absorbing HDFC Ltd.'s older mortgage book and whether margins recover to pre-merger levels as the integration is completed.",

      risks:
        "Banking is inherently exposed to economic cycles — a recession or slowdown increases loan defaults, which directly hits profits. HDFC Bank's merger with HDFC Ltd. has temporarily pressured margins and return ratios, and full integration may take several more quarters. The RBI has imposed restrictions on some HDFC Bank products in the past (including a temporary ban on new digital credit card issuances in 2021) — regulatory intervention is a non-trivial risk for any Indian bank. Rising interest rates hurt borrowers' ability to repay, increasing credit risk. Foreign institutional investor (FII) ownership is high, making the stock sensitive to global risk-off moves.",

      founded: "1994",
      hq: "Mumbai, India",
      employees: "~2,13,000",
    },
    fundamentals: {
      pe: 18.9, sectorPe: 16.4, pb: 2.6,
      roe: 16.9, debtToEquity: 0.0, revenueGrowth: 9.4, dividendYield: 1.15,
    },
    technicals: { rsi: 61, trend: "above", volumeTrend: "rising" },
    score: 7.8,
  },

  {
    symbol: "MU",
    name: "Micron Technology",
    market: "NASDAQ",
    sector: "Tech",
    currency: "$",
    price: 142.8,
    changePct: 6.8,
    cap: "Large Cap",
    blurb: "Riding the memory-chip upcycle.",
    about: {
      summary:
        "Micron Technology is one of only three companies in the world (alongside Samsung and SK Hynix) that manufactures DRAM and NAND flash memory chips at scale. These chips are the 'short-term memory' and 'storage' inside virtually every smartphone, laptop, data-centre server, and AI accelerator on the planet. Without Micron's chips, modern computing effectively stops.",

      howItEarns:
        "Micron sells two main product families. DRAM (Dynamic Random Access Memory) is the fast, volatile working memory used in computers and servers — it is Micron's largest revenue contributor and has the highest margins. NAND Flash is non-volatile storage that retains data without power — used in SSDs, smartphones, and USB drives. A fast-growing third category is High Bandwidth Memory (HBM), a specialised type of DRAM stacked directly on AI accelerator chips (like Nvidia's H100 and H200 GPUs). HBM has become the hottest product in the memory industry because every AI training cluster needs it in large quantities. Micron also sells storage solutions through its Crucial consumer brand.",

      history:
        "Micron was founded in 1978 in a Boise, Idaho dental office by a small group of engineers. It went public in 1984 and grew through a series of industry consolidations, acquiring Lexar, SpecTek, and eventually Elpida Memory (a major Japanese DRAM maker) in 2013 for $2.5 billion — a deal that significantly boosted its DRAM capacity and technology. The memory chip industry is brutally cyclical: when demand is high and supply is tight, prices soar and profits are enormous; when demand slows or too much supply comes on-line, prices collapse and losses follow. Micron lost billions during the 2019 downturn and earned record profits in 2022. The current upcycle, driven by AI server buildouts, has pushed revenues to record highs.",

      whyInvestorsWatch:
        "Memory chip pricing is the single most important variable for Micron — a 10% move in DRAM spot prices flows almost entirely to the bottom line because manufacturing costs are largely fixed. Analysts obsessively track industry supply discipline (whether Samsung and SK Hynix are cutting or adding capacity), data-centre capex from hyperscalers (Amazon, Google, Microsoft, Meta), and Micron's HBM market share. HBM is particularly important because Micron was a late entrant but has been gaining share, and HBM pricing is significantly higher than conventional DRAM. Micron also benefits from US CHIPS Act subsidies for domestic fab expansion.",

      risks:
        "The memory chip industry is notoriously cyclical — a demand slowdown or aggressive capacity additions by competitors can quickly turn profits to losses. Micron has no meaningful operations in China following restrictions on its chips by Chinese regulators, which closed a significant end market. US-China export controls on advanced chips and fab equipment add ongoing uncertainty. Capital expenditure for new fabs is enormous — building a leading-edge memory fab costs $10–20 billion — creating long-term dilution risk if funded by equity. Samsung's investment decisions (it tends to keep adding supply even through downturns) are the biggest unpredictable variable for the whole industry.",

      founded: "1978",
      hq: "Boise, Idaho, USA",
      employees: "~43,000",
    },
    fundamentals: {
      pe: 24.2, sectorPe: 31.5, pb: 3.4,
      roe: 14.2, debtToEquity: 0.31, revenueGrowth: 38.9, dividendYield: 0.32,
    },
    technicals: { rsi: 72, trend: "above", volumeTrend: "rising" },
    score: 7.2,
  },

  {
    symbol: "INFY",
    name: "Infosys",
    market: "NSE",
    sector: "Tech",
    currency: "₹",
    price: 1512.4,
    changePct: -0.6,
    cap: "Large Cap",
    blurb: "Waiting on IT-spending recovery.",
    about: {
      summary:
        "Infosys is India's second-largest IT services company and one of the most globally recognised Indian corporate names. It provides software development, digital transformation, cloud migration, data analytics, and business-process outsourcing to large corporations across 50+ countries. In simple terms: when a bank, retailer, or manufacturer wants to upgrade its technology infrastructure, it often hires Infosys to design and execute that upgrade.",

      howItEarns:
        "Infosys earns almost entirely through long-term service contracts with large enterprises. It sells custom software development (building or maintaining bespoke applications), managed services (running and monitoring IT systems on the client's behalf), consulting (advising on technology strategy), and business-process outsourcing (taking over back-office functions like accounting or HR). Its largest markets are the US (about 60% of revenue), Europe (~25%), and the rest of the world. Financial services (banking, insurance) is the biggest vertical, followed by retail and consumer goods, manufacturing, and healthcare. Infosys also earns incremental revenue from its proprietary platforms — Finacle (core banking software) and Infosys BPM.",

      history:
        "Infosys was founded in 1981 by Narayana Murthy and six co-founders with $250 borrowed from Murthy's wife. It started as a software services firm in Pune before moving to Bangalore. Its 1993 IPO was a landmark moment, and a 1999 NASDAQ listing made it one of the first Indian companies traded in the US. Infosys grew rapidly through the Y2K boom, the outsourcing wave of the 2000s, and the subsequent digital transformation era. A governance crisis in 2017 led to co-founder Murthy publicly questioning management practices and the eventual resignation of CEO Vishal Sikka — a period that shook investor confidence but ultimately led to a leadership reset under Salil Parekh (appointed 2018). Parekh has refocused the company on large deal wins and digital services, steering away from commoditised IT work.",

      whyInvestorsWatch:
        "Revenue growth guidance is the most-watched metric for Infosys — it provides forward guidance every quarter, and any revision (up or down) moves the stock sharply. Large deal total contract value (TCV) — the size of new contracts signed — is the leading indicator of future revenue. Attrition and wage inflation matter because Infosys's model is built on human labour; high employee turnover raises costs and disrupts delivery. EBIT margin is the profitability barometer: Infosys targets a specific band (20–22%) and investors watch whether it can maintain this while investing in AI capabilities and competing for talent. Currency movements also matter — Infosys earns mostly in USD and GBP but pays employees mostly in INR, so rupee appreciation hurts reported margins.",

      risks:
        "Infosys's growth is directly tied to IT spending by global enterprises — when companies cut budgets in a downturn (as happened in 2023–24 with banking and retail clients), deal signings slow and growth decelerates. Generative AI is a structural risk and opportunity simultaneously: AI-assisted coding and automation could reduce the number of engineers needed for certain tasks, putting pressure on headcount-based billing models. Visa restrictions in the US (H-1B caps) increase the cost of deploying Indian engineers to client sites. Competition from Accenture, TCS, Wipro, and global system integrators on large deals is intense. The company's heavy dependence on the US market makes it sensitive to the US economic cycle.",

      founded: "1981",
      hq: "Bengaluru, India",
      employees: "~3,17,000",
    },
    fundamentals: {
      pe: 23.6, sectorPe: 26.8, pb: 7.1,
      roe: 31.8, debtToEquity: 0.09, revenueGrowth: 4.2, dividendYield: 2.44,
    },
    technicals: { rsi: 44, trend: "below", volumeTrend: "falling" },
    score: 6.4,
  },

  {
    symbol: "SUNPHARMA",
    name: "Sun Pharma",
    market: "NSE",
    sector: "Healthcare",
    currency: "₹",
    price: 1745.9,
    changePct: 0.9,
    cap: "Large Cap",
    blurb: "Defensive pick with steady demand.",
    about: {
      summary:
        "Sun Pharmaceutical Industries is India's largest drug maker and the fourth-largest specialty generic pharmaceutical company in the world. It manufactures and sells both generic drugs (off-patent medicines that are chemically identical to branded ones but sold cheaper) and specialty medicines (complex formulations, branded drugs, and dermatology products) across over 100 countries.",

      howItEarns:
        "Sun Pharma's revenue comes from three main geographies. The US is its largest market (~30% of revenue), where it sells generic drugs approved through the FDA's ANDA process — these compete with branded drugs that have lost patent protection, and Sun Pharma prices them significantly below the original brand. India (~30%) is its second-largest market, where it sells branded generics through a massive field force to doctors, hospitals, and pharmacies. Emerging markets (Rest of World) contribute the remainder. Its specialty portfolio — particularly in dermatology (skin diseases), ophthalmology (eye diseases), and oncology — is the fastest-growing segment and commands premium pricing because these formulations are harder to replicate.",

      history:
        "Sun Pharma was founded in 1983 by Dilip Shanghvi with just five products and borrowed capital. Shanghvi started by selling psychiatric drugs — a niche other Indian pharma companies had ignored — and built deep doctor relationships in that specialty. Over the following decades, Sun Pharma pursued an aggressive acquisition strategy: it bought Knoll Pharmaceuticals India (2001), Caraco Pharma in the US (2007), Israel's Taro Pharmaceutical (2010, giving it a strong US dermatology franchise), and most significantly, Ranbaxy Laboratories (2014) in a $3.2 billion deal that made it the largest Indian pharma company. The Ranbaxy integration was challenging — Ranbaxy had significant FDA compliance issues including import alerts on multiple plants — but Sun Pharma has since resolved most of them and grown through the combined entity.",

      whyInvestorsWatch:
        "Sun Pharma's US business is closely watched because US generic drug pricing has been deflationary for years — prices erode as more generics compete. Investors track the pipeline of new US drug filings (ANDAs) and specialty drug approvals as the path to better margins. The specialty business — particularly Ilumya (psoriasis), Cequa (dry eye), and Winlevi (acne) — is the premium-margin growth story. Analysts also watch FDA inspection outcomes for Sun Pharma's manufacturing plants; any 'Form 483' observations or warning letters can disrupt US supply and revenue. India formulations growth is tracked because the domestic market offers stable, growing demand without the pricing pressure of generic markets.",

      risks:
        "Generic drug pricing in the US continues to erode due to consolidation among pharmacy benefit managers and intensifying competition from Chinese and other generic manufacturers. Regulatory risk from the US FDA is ever-present — manufacturing violations can trigger supply disruptions and significant revenue loss. Currency risk is real: a stronger rupee reduces the INR value of US earnings. R&D investment in specialty drugs is expensive and uncertain — drug development can fail at late stages. The Ranbaxy legacy means Sun Pharma still navigates FDA scrutiny more carefully than peers. Dilip Shanghvi controls a large stake, and key-person dependence on his strategic direction is a governance consideration.",

      founded: "1983",
      hq: "Mumbai, India",
      employees: "~35,000",
    },
    fundamentals: {
      pe: 34.1, sectorPe: 36.2, pb: 5.4,
      roe: 17.1, debtToEquity: 0.05, revenueGrowth: 10.8, dividendYield: 0.77,
    },
    technicals: { rsi: 57, trend: "above", volumeTrend: "flat" },
    score: 7.4,
  },
];

// --- Mutual funds --------------------------------------------------------

export const FUNDS: Fund[] = [
  {
    id: "nifty-index",
    name: "Nifty 50 Index Fund",
    type: "Index Fund",
    risk: "medium",
    fiveYearReturn: 13.8,
    minInvest: 500,
    blurb: "Owns a small slice of India's 50 biggest companies in one purchase.",
  },
  {
    id: "balanced-hybrid",
    name: "Balanced Hybrid Fund",
    type: "Hybrid Fund",
    risk: "low",
    fiveYearReturn: 10.2,
    minInvest: 1000,
    blurb: "Mixes stocks with safer bonds, so swings are smaller.",
  },
  {
    id: "liquid-debt",
    name: "Liquid Debt Fund",
    type: "Debt Fund",
    risk: "low",
    fiveYearReturn: 6.4,
    minInvest: 500,
    blurb: "Lends to stable institutions. Low return, very low drama.",
  },
  {
    id: "flexi-equity",
    name: "Flexi-Cap Equity Fund",
    type: "Equity Fund",
    risk: "high",
    fiveYearReturn: 17.5,
    minInvest: 1000,
    blurb: "A managed basket of growth stocks across company sizes.",
  },
];

// --- News ----------------------------------------------------------------

export const NEWS: NewsItem[] = [
  { id: "n1", headline: "Fed signals steady rates as AI-driven earnings lift US markets", source: "Reuters", daysAgo: 2 },
  { id: "n2", headline: "RBI keeps repo rate unchanged; banking stocks rally", source: "Economic Times", daysAgo: 3, relatedSymbol: "HDFCBANK" },
  { id: "n3", headline: "Memory chipmakers extend rally on strong quarterly earnings", source: "Bloomberg", daysAgo: 5, relatedSymbol: "MU" },
  { id: "n4", headline: "Auto sector gains on strong festive-season demand outlook", source: "Mint", daysAgo: 6, relatedSymbol: "TATAMOTORS" },
];

// --- Lookups -------------------------------------------------------------

export function getCompany(symbol: string): Company | undefined {
  return COMPANIES.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase());
}

export function topPerformers(n = 4): Company[] {
  return [...COMPANIES].sort((a, b) => b.changePct - a.changePct).slice(0, n);
}

export function searchCompanies(q: string): Company[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(s) || c.symbol.toLowerCase().includes(s)
  );
}

function genPoints(symbol: string, days: number, volatility = 0.028): number[] {
  const c = getCompany(symbol);
  if (!c) return [];
  let seed = 0;
  for (const ch of symbol) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  // mix seed with day count so each period has its own shape
  seed = (seed * days + 7919) % 100000;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const drift = c.changePct >= 0 ? 0.0012 : -0.0008;
  const points: number[] = [];
  let p = c.price / Math.pow(1 + drift + volatility * 0.01, days);
  for (let i = 0; i < days; i++) {
    p = p * (1 + drift + (rand() - 0.5) * volatility);
    points.push(Math.round(p * 100) / 100);
  }
  points[points.length - 1] = c.price;
  return points;
}

export type ChartPeriod = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";

/** Generate all six time periods for a symbol in one call.
 *  1D uses minute-level points (375 trading minutes).
 *  All others use one point per trading day. */
export function allPriceHistories(symbol: string): Record<ChartPeriod, number[]> {
  const c = getCompany(symbol);
  if (!c) return { "1D": [], "5D": [], "1M": [], "6M": [], "1Y": [], "5Y": [] };

  // 1D: 375 points (9:15am–3:30pm, 1 per minute) — tighter volatility
  let seed1d = 0;
  for (const ch of symbol) seed1d = (seed1d * 31 + ch.charCodeAt(0)) % 100000;
  seed1d = (seed1d * 17 + 3313) % 100000;
  const rand1d = () => { seed1d = (seed1d * 9301 + 49297) % 233280; return seed1d / 233280; };
  const intradayDrift = c.changePct / 375 / 100;
  const pts1d: number[] = [];
  let p1 = c.price * (1 - c.changePct / 100);
  for (let i = 0; i < 375; i++) {
    p1 = p1 * (1 + intradayDrift + (rand1d() - 0.5) * 0.003);
    pts1d.push(Math.round(p1 * 100) / 100);
  }
  pts1d[pts1d.length - 1] = c.price;

  return {
    "1D": pts1d,
    "5D":   genPoints(symbol, 5,    0.018),
    "1M":   genPoints(symbol, 30,   0.022),
    "6M":   genPoints(symbol, 180,  0.028),
    "1Y":   genPoints(symbol, 365,  0.030),
    "5Y":   genPoints(symbol, 1825, 0.034),
  };
}

// kept for backwards compat
export function priceHistory(symbol: string, days = 180): number[] {
  return genPoints(symbol, days);
}

export type Verdict = "Favorable" | "Neutral" | "Cautious";

export function verdictFor(score: number): Verdict {
  if (score >= 7.5) return "Favorable";
  if (score >= 6) return "Neutral";
  return "Cautious";
}

export function verdictReason(c: Company): string {
  const parts: string[] = [];
  if (c.fundamentals.pe < c.fundamentals.sectorPe) parts.push("priced below its sector average");
  else parts.push("priced above its sector average");
  if (c.fundamentals.revenueGrowth > 10) parts.push("revenue growing fast");
  if (c.technicals.trend === "above") parts.push("trading above its long-term trend");
  else parts.push("trading below its long-term trend");
  return parts.join(", ") + ".";
}

export type Horizon = "short" | "medium" | "long" | "unsure";
export type Goal = "learning" | "wealth" | "goal";
export type SectorPick = "Tech" | "Banking" | "Auto" | "Healthcare" | "any";
export type AssetPick = "stocks" | "funds" | "both" | "unsure";

export interface Answers {
  budget: number;
  horizon: Horizon;
  goal: Goal;
  sector: SectorPick;
  asset: AssetPick;
}

export interface Suggestion {
  kind: "stock" | "fund";
  title: string;
  subtitle: string;
  href?: string;
  /** total money going into this pick */
  amount: number;
  /** stocks: whole shares to buy */
  qty?: number;
  /** stocks: price per share */
  unitPrice?: number;
  currency?: string;
  score?: number;
  reason: string;
}

export interface SuggestionResult {
  riskLabel: string;
  highRiskPct: number;
  items: Suggestion[];
  headline: string;
  budget: number;
  invested: number;
  leftover: number;
  note?: string;
}

/**
 * Whole-share stock allocation.
 * 1. Weight the stock budget across picks by composite score.
 * 2. Buy floor(allocation / price) shares of each.
 * 3. Greedy pass: keep buying the highest-scoring stock that still
 *    fits in the leftover until nothing fits.
 */
function allocateStocks(
  pool: Company[],
  budget: number,
  maxPicks: number
): { c: Company; qty: number }[] {
  const affordable = pool.filter((c) => c.price <= budget);
  if (affordable.length === 0) return [];
  const picks = affordable.slice(0, maxPicks);
  const totalScore = picks.reduce((s, c) => s + c.score, 0);

  const result = picks.map((c) => ({ c, qty: 0 }));
  let leftover = budget;

  // Pass 1 — breadth first: one share of each pick (by score order)
  // so the user gets a spread of 2-3 stocks, not everything in one name.
  for (const r of result) {
    if (r.c.price <= leftover) {
      r.qty = 1;
      leftover -= r.c.price;
    }
  }

  // Pass 2 — score-weighted fill of what remains
  const held = result.filter((r) => r.qty > 0);
  const heldScore = held.reduce((s, r) => s + r.c.score, 0) || totalScore;
  for (const r of held) {
    const alloc = leftover * (r.c.score / heldScore);
    const extra = Math.floor(alloc / r.c.price);
    r.qty += extra;
  }
  leftover = budget - result.reduce((s, r) => s + r.qty * r.c.price, 0);

  // Pass 3 — greedy: keep buying whatever still fits, cheapest first
  // (cheapest first squeezes the most shares out of the tail money)
  const byPrice = [...held].sort((a, b) => a.c.price - b.c.price);
  let progress = true;
  while (progress) {
    progress = false;
    for (const r of byPrice) {
      if (r.c.price <= leftover) {
        r.qty += 1;
        leftover -= r.c.price;
        progress = true;
      }
    }
  }

  return result.filter((r) => r.qty > 0);
}

export function suggest(a: Answers): SuggestionResult {
  // Step 1 — base risk allocation from horizon
  let highRiskPct = a.horizon === "long" ? 55 : a.horizon === "medium" ? 35 : 12;
  // Step 2 — adjust by goal
  if (a.goal === "goal") highRiskPct = Math.max(10, highRiskPct - 15);

  // Step 3 — asset filter
  const asset: AssetPick = a.asset === "unsure" ? "both" : a.asset;
  const riskLabel =
    highRiskPct >= 50 ? "Growth-leaning" : highRiskPct >= 30 ? "Balanced" : "Safety-first";

  const items: Suggestion[] = [];
  const wantStocks = asset === "stocks" || asset === "both";
  const wantFunds = asset === "funds" || asset === "both";
  const learning = a.goal === "learning";
  let note: string | undefined;

  // Step 4 — sector filter + ranking
  // Budget is in ₹, so only suggest ₹-denominated (NSE) stocks —
  // mixing USD-priced stocks into a rupee budget without FX conversion
  // would produce wrong share counts.
  const inrPool = [...COMPANIES]
    .filter((c) => c.currency === "₹")
    .sort((x, y) => y.score - x.score);
  let stockPool = inrPool;
  const sectorPicks = new Set<string>();
  if (a.sector !== "any") {
    const sectorOnly = inrPool.filter((c) => c.sector === a.sector);
    sectorOnly.forEach((c) => sectorPicks.add(c.symbol));
    // Top up with best stocks from other sectors so the user still
    // gets a 3-4 option spread even in a thin sector.
    const topUp = inrPool.filter((c) => c.sector !== a.sector);
    stockPool = [...sectorOnly, ...topUp];
  }
  if (a.horizon === "short" || a.horizon === "unsure")
    stockPool = stockPool.filter((c) => c.technicals.rsi < 70);

  // Step 5 — budget split (stocks get whole-share treatment,
  // fund absorbs the exact remainder because fund units are fractional)
  let stockBudget = wantStocks && wantFunds
    ? Math.round(a.budget * (Math.max(highRiskPct, 40) / 100))
    : wantStocks
    ? a.budget
    : 0;

  // aim for 2-3 stocks + 1-2 funds = 3-4 total picks
  const maxStockPicks = learning ? 2 : 3;
  const maxFundPicks = wantStocks ? 1 : learning ? 2 : 3;

  let investedInStocks = 0;

  if (wantStocks && stockBudget > 0) {
    const allocated = allocateStocks(stockPool, stockBudget, maxStockPicks);

    if (allocated.length === 0 && !wantFunds) {
      // budget can't afford a single share of anything in the pool
      const cheapest = stockPool.reduce(
        (m, c) => (c.price < m.price ? c : m),
        stockPool[0]
      );
      note = `Your budget is below the cheapest single share in this pool (${cheapest.name} at ${cheapest.currency}${cheapest.price.toLocaleString("en-IN")}). Consider mutual funds — they accept small amounts.`;
    }

    for (const { c, qty } of allocated) {
      const amount = Math.round(qty * c.price * 100) / 100;
      investedInStocks += amount;
      items.push({
        kind: "stock",
        title: c.name,
        subtitle: `${c.market}: ${c.symbol}`,
        href: `/company/${c.symbol}`,
        amount,
        qty,
        unitPrice: c.price,
        currency: c.currency,
        score: c.score,
        reason:
          a.sector !== "any"
            ? sectorPicks.has(c.symbol)
              ? `Top-scoring ${a.sector.toLowerCase()} pick for your ${horizonLabel(a.horizon)} horizon.`
              : `Added from outside ${a.sector.toLowerCase()} for diversification — spreading across sectors lowers your risk.`
            : `High composite score that fits your ${horizonLabel(a.horizon)} horizon.`,
      });
    }
  }

  // Whatever stocks couldn't absorb flows into funds
  let fundBudget = a.budget - investedInStocks;

  if (wantFunds && fundBudget > 0) {
    let fundPool: Fund[];
    if (highRiskPct >= 50) fundPool = FUNDS.filter((f) => f.risk !== "low");
    else if (highRiskPct >= 30) fundPool = FUNDS.filter((f) => f.risk !== "high");
    else fundPool = FUNDS.filter((f) => f.risk === "low");

    const eligible = fundPool.filter((f) => f.minInvest <= fundBudget);
    const picks = eligible.slice(0, maxFundPicks);

    if (picks.length > 0) {
      const per = Math.floor(fundBudget / picks.length);
      let remainder = fundBudget - per * picks.length;
      for (const f of picks) {
        const amount = per + remainder; // give rounding remainder to first fund
        remainder = 0;
        items.push({
          kind: "fund",
          title: f.name,
          subtitle: `${f.type} · 5-yr return ~${f.fiveYearReturn}%`,
          amount,
          reason: learning
            ? "One simple, diversified holding — ideal while you learn. Fund units are fractional, so every rupee here gets invested."
            : `Matches your ${riskLabel.toLowerCase()} allocation. ${f.blurb}`,
        });
      }
      fundBudget = 0;
    }
  }

  const invested = items.reduce((s, i) => s + i.amount, 0);
  const leftover = Math.round((a.budget - invested) * 100) / 100;

  if (leftover > 0 && !note) {
    note =
      asset === "stocks"
        ? `${"₹"}${leftover.toLocaleString("en-IN")} is left uninvested because shares only come in whole units. Adding a mutual fund to the mix would put every rupee to work.`
        : undefined;
  }

  const headline = learning
    ? "Keeping it simple while you learn"
    : `A ${riskLabel.toLowerCase()} mix for your ₹${a.budget.toLocaleString("en-IN")}`;

  return { riskLabel, highRiskPct, items, headline, budget: a.budget, invested: Math.round(invested * 100) / 100, leftover, note };
}

export function horizonLabel(h: Horizon): string {
  return h === "short" ? "short-term" : h === "medium" ? "medium-term" : h === "long" ? "long-term" : "cautious";
}
