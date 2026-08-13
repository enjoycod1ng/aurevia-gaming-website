import type { SiteContent } from "@/types/content";

const siteUrl = (process.env.SITE_URL ?? "https://aureviagaming.com").replace(
  /\/$/,
  "",
);

export const siteContent = {
  brand: {
    name: "Aurevia Gaming",
    shortName: "Aurevia",
    url: siteUrl,
    description:
      "A casino game development agency building web and mobile games, casino platforms and operator admin systems.",
  },
  contact: {
    phoneDisplay: "737-304-3074",
    whatsappHref: "https://wa.me/17373043074",
    telegramHandle: "@bettingssupporter",
    telegramUrl: "https://t.me/bettingssupporter",
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Games", href: "/games" },
    { label: "Casino Platforms", href: "/casino-platforms" },
    { label: "Contact", href: "/contact" },
  ],
  primaryCta: {
    label: "Request a Quote",
    href: "/contact",
  },
  secondaryCta: {
    label: "Message on Telegram",
    href: "https://t.me/bettingssupporter",
    external: true,
    ariaLabel: "Message Aurevia Gaming on Telegram",
  },
  seo: {
    home: {
      title: "Aurevia Gaming | Casino Game Development Agency",
      description:
        "Aurevia Gaming develops slot and betting games, casino websites, mobile experiences and operator admin platforms with source-code ownership and configurable RTP controls.",
      path: "/",
      keywords: [
        "casino game development",
        "slot game development",
        "betting software development",
        "casino website development",
        "casino admin panel",
      ],
    },
    services: {
      title: "Our Services",
      description:
        "Explore Aurevia Gaming services for slot games, betting products, casino websites, mobile gaming and operator admin panels.",
      path: "/services",
      keywords: [
        "casino development services",
        "web casino games",
        "mobile casino games",
        "RTP control",
        "casino backend development",
      ],
    },
    games: {
      title: "Games",
      description:
        "Explore Aurevia Gaming concepts for premium slots, crash games, instant-win formats and table-inspired casino experiences.",
      path: "/games",
      keywords: [
        "casino game development",
        "slot game portfolio",
        "casino game portfolio",
        "crash game development",
        "custom casino games",
      ],
    },
    platforms: {
      title: "Casino Platforms",
      description:
        "Build a tailored casino platform with player management, games, reporting, payments, promotions, RTP controls and operational dashboards.",
      path: "/casino-platforms",
      keywords: [
        "casino platform development",
        "casino admin panel",
        "operator dashboard",
        "casino back office",
        "casino management software",
      ],
    },
    contact: {
      title: "Contact",
      description:
        "Contact Aurevia Gaming to discuss a slot game, betting product, casino website, mobile experience or operator platform.",
      path: "/contact",
      keywords: [
        "casino development quote",
        "hire casino developers",
        "slot game development agency",
      ],
    },
  },
  home: {
    hero: {
      label: "Casino-tech studio",
      title: "Casino games",
      highlightedTitle: "built to win",
      description:
        "Aurevia Gaming designs and develops high-performance slot, betting and casino products for web and mobile — with precise RTP control and complete source-code ownership.",
      primaryAction: {
        label: "Request a Quote",
        href: "/contact",
      },
      secondaryAction: {
        label: "Explore Games",
        href: "/games",
      },
      detailsAriaLabel: "Aurevia delivery highlights",
      details: [
        { label: "RTP CONTROL", value: "Configurable RTP" },
        { label: "FULL OWNERSHIP", value: "Source code included" },
        { label: "API READY", value: "Casino integration" },
      ],
      mockup: {
        ariaLabel: "Golden Fortune game overview",
        title: "Golden Fortune",
        subtitle: "Mega win",
        reels: [
          { symbol: "7" },
          { symbol: "\u2605" },
          { symbol: "\u25A0" },
          { symbol: "\u265B" },
          { symbol: "BAR", active: true },
          { symbol: "7" },
          { symbol: "\u25A0" },
          { symbol: "\u2605" },
          { symbol: "\u265B" },
        ],
        jackpotLabel: "Jackpot",
        jackpotValue: "$128,450.00",
        metrics: [
          { label: "RTP profile", value: "96.20%", progress: 80 },
          { label: "Live players", value: "18,426", change: "+12.8%" },
        ],
      },
    },
    services: {
      heading: {
        label: "What we build",
        title: "End-to-end casino development",
        description:
          "From the game engine to the operator dashboard, every layer is engineered for performance, control and ownership.",
      },
      items: [
        {
          number: "01",
          icon: "spark",
          title: "Slot & Betting Games",
          description:
            "Original game mechanics, math models, bonus rounds, responsive interfaces and secure backend integration.",
          action: {
            label: "Explore Slot & Betting Games",
            href: "/services#slot-betting-games",
          },
        },
        {
          number: "02",
          icon: "devices",
          title: "Web & Mobile Casino",
          description:
            "Fast, device-optimized casino experiences built for browser, Android and iOS delivery.",
          action: {
            label: "Explore Web & Mobile Casino",
            href: "/services#web-mobile",
          },
        },
        {
          number: "03",
          icon: "diamond",
          title: "Casino Websites",
          description:
            "Conversion-focused operator websites with wallets, payments, promotions and player journeys.",
          action: {
            label: "Explore Casino Websites",
            href: "/services#casino-websites",
          },
        },
        {
          number: "04",
          icon: "controls",
          title: "Admin & RTP Control",
          description:
            "Powerful management panels for games, users, transactions, bonuses, analytics and RTP profiles.",
          action: {
            label: "Explore Admin & RTP Control",
            href: "/services#admin-platforms",
          },
        },
      ],
    },
    demos: {
      heading: {
        label: "Demo-ready games",
        title: "Showcase the experience",
        description:
          "Present playable concepts with polished visuals, responsive controls and operator-ready integration points.",
      },
      items: [
        {
          title: "Fortune Vault",
          description: "Classic slots \u00B7 96.2% RTP",
          symbol: "7",
          theme: "fortune",
          primaryAction: { label: "Play Demo", href: "/games#fortune-vault" },
          secondaryAction: {
            label: "View Details",
            href: "/games#fortune-vault",
          },
        },
        {
          title: "Neon Rush",
          description: "Crash game \u00B7 Real-time",
          symbol: "\u00D7",
          theme: "neon",
          primaryAction: { label: "Play Demo", href: "/games#neon-rush" },
          secondaryAction: { label: "View Details", href: "/games#neon-rush" },
        },
        {
          title: "Royal Reels",
          description: "Premium slots \u00B7 Bonus rounds",
          symbol: "\u265B",
          theme: "royal",
          primaryAction: { label: "Play Demo", href: "/games#royal-reels" },
          secondaryAction: {
            label: "View Details",
            href: "/games#royal-reels",
          },
        },
      ],
    },
    platform: {
      heading: {
        label: "Operator control",
        title: "One platform.",
        description:
          "Manage games, players, RTP profiles, payments, bonuses and performance analytics from one secure administrative workspace.",
      },
      highlightedTitle: "Total visibility.",
      action: { label: "Explore Casino Platforms", href: "/casino-platforms" },
      features: [
        "Real-time dashboards",
        "RTP profile management",
        "Player & wallet controls",
        "Campaign and bonus tools",
      ],
      dashboard: {
        ariaLabel: "Aurevia operator dashboard preview",
        navigationAriaLabel: "Dashboard preview navigation",
        brandMark: "A",
        brandName: "Aurevia",
        navigation: [
          "Overview",
          "Games",
          "Players",
          "RTP Profiles",
          "Transactions",
          "Bonuses",
          "Analytics",
          "Settings",
        ],
        title: "Operator Overview",
        description: "Live data across all connected products",
        stats: [
          {
            label: "GGR today",
            value: "$284,720",
            change: "+18.4%",
            tone: "positive",
          },
          {
            label: "Active players",
            value: "18,426",
            change: "+12.8%",
            tone: "positive",
          },
          {
            label: "Avg. RTP",
            value: "96.17%",
            change: "Stable",
            tone: "neutral",
          },
        ],
        chart: {
          title: "Gross gaming revenue",
          period: "Last 8 days",
          points: [
            [12, 132],
            [80, 166],
            [130, 94],
            [202, 153],
            [272, 75],
            [340, 49],
            [408, 92],
            [490, 22],
          ],
        },
        gamesTitle: "Top games",
        games: [
          { name: "Fortune Vault", players: "4,820", revenue: "$78.2k" },
          { name: "Neon Rush", players: "3,176", revenue: "$62.8k" },
          { name: "Royal Reels", players: "2,980", revenue: "$46.1k" },
        ],
      },
    },
    reasons: {
      heading: {
        label: "Why Aurevia",
        title: "Built for operators who want control",
        description:
          "A focused development partner for teams that need premium execution without losing ownership of the product.",
      },
      items: [
        {
          number: "01",
          title: "Quality without shortcuts",
          description:
            "Production-grade architecture, polished UI and rigorous QA across devices.",
          result: "Best quality result",
        },
        {
          number: "02",
          title: "Control the math",
          description:
            "Transparent probability models and configurable RTP profiles for your operating strategy.",
          result: "Flexible RTP control",
        },
        {
          number: "03",
          title: "Own what you build",
          description:
            "Complete source code and documentation shared at handover — no dependency lock-in.",
          result: "Full source code share",
        },
      ],
    },
    cta: {
      title: "Ready to build your next casino product?",
      description:
        "Tell us about your game, platform or operator workflow. We will shape a clear development plan and quote.",
      primaryAction: { label: "Request a Quote", href: "/contact" },
      telegramLabel: "Telegram",
      phoneLabel: "Call",
    },
  },
  servicesPage: {
    hero: {
      label: "Full-service development",
      title: "Engineering every layer of the casino experience",
      description:
        "From original game mathematics and responsive player interfaces to operator websites and secure control panels, Aurevia Gaming delivers complete products—not disconnected pieces.",
      primaryAction: { label: "Request a Quote", href: "/contact" },
      secondaryAction: { label: "View Games", href: "/games" },
      layersAriaLabel: "Casino product layers",
      layers: [
        {
          icon: "spark",
          tone: "gold",
          title: "Game engine",
          detail: "Math · Features · Bonuses",
          progress: 78,
        },
        {
          icon: "devices",
          tone: "blue",
          title: "Player UI",
          detail: "Web · Android · iOS",
          progress: 90,
        },
        {
          icon: "diamond",
          tone: "violet",
          title: "Casino site",
          detail: "Wallet · Promo · Payments",
          progress: 68,
        },
        {
          icon: "controls",
          tone: "green",
          title: "Admin control",
          detail: "RTP · Users · Analytics",
          progress: 92,
        },
      ],
    },
    offerings: {
      heading: {
        label: "Our core services",
        title: "One partner. Four critical product layers.",
        description:
          "Each service can be delivered independently or combined into one coordinated platform roadmap.",
      },
      items: [
        {
          id: "slot-betting-games",
          number: "01",
          tone: "gold",
          title: "Betting & slot game development",
          description:
            "Original mechanics, math models and memorable player experiences built for production environments.",
          capabilities: [
            "RNG and probability logic",
            "Bonus rounds and free spins",
            "Jackpot and tournament systems",
            "WebGL / HTML5 responsive UI",
          ],
          image: {
            src: "/media/services/slot-development.webp",
            alt: "Slot game development interface with reels and game controls",
            width: 1200,
            height: 800,
          },
        },
        {
          id: "web-mobile",
          number: "02",
          tone: "blue",
          title: "Web & mobile casino games",
          description:
            "Fast, device-aware products that keep interaction quality consistent from desktop browsers to mobile screens.",
          capabilities: [
            "Browser, Android and iOS",
            "Touch-first interaction design",
            "Low-bandwidth optimization",
            "Wallet and account integration",
          ],
          image: {
            src: "/media/services/web-mobile-casino.webp",
            alt: "Responsive casino product shown on mobile and desktop screens",
            width: 1200,
            height: 800,
          },
        },
        {
          id: "casino-websites",
          number: "03",
          tone: "violet",
          title: "Casino website development",
          description:
            "Conversion-focused operator experiences covering acquisition, account journeys and real-money workflows.",
          capabilities: [
            "Registration and KYC flows",
            "Wallet, deposits and withdrawals",
            "Promotions and loyalty tools",
            "Game lobby and search",
          ],
          image: {
            src: "/media/services/casino-website.webp",
            alt: "Premium dark casino website interface with featured games",
            width: 1200,
            height: 800,
          },
        },
        {
          id: "admin-platforms",
          number: "04",
          tone: "green",
          title: "Admin panel development",
          description:
            "A secure control layer for managing games, players, transactions, reporting and configurable RTP profiles.",
          capabilities: [
            "RTP profile management",
            "Player and wallet controls",
            "Campaign and bonus tools",
            "Real-time performance analytics",
          ],
          image: {
            src: "/media/services/admin-platform.webp",
            alt: "Casino operator admin panel with analytics and management tables",
            width: 1200,
            height: 800,
          },
        },
      ],
    },
    process: {
      heading: {
        label: "Delivery process",
        title: "A clear path from idea to launch.",
        description:
          "Transparent milestones keep product, design and engineering aligned from day one.",
      },
      steps: [
        {
          number: "01",
          title: "Discovery",
          description: "Product goals, markets and operating constraints",
        },
        {
          number: "02",
          title: "Game math & UX",
          description: "Mechanics, flows, wireframes and RTP planning",
        },
        {
          number: "03",
          title: "Build",
          description: "Frontend, backend, integrations and admin tools",
        },
        {
          number: "04",
          title: "QA & hardening",
          description: "Device testing, security checks and performance",
        },
        {
          number: "05",
          title: "Launch & handover",
          description: "Deployment, documentation and complete source code",
        },
      ],
    },
    principles: {
      heading: {
        label: "Built for production",
        title: "Quality, control and ownership by default.",
        description: "",
      },
      items: [
        {
          icon: "performance",
          tone: "gold",
          title: "Performance",
          description:
            "Responsive interfaces, optimized asset delivery and scalable services.",
        },
        {
          icon: "shield",
          tone: "blue",
          title: "Security",
          description:
            "Role-based access, protected integrations and audited transaction flows.",
        },
        {
          icon: "target",
          tone: "violet",
          title: "Transparency",
          description:
            "Clear game logic, configurable RTP profiles and readable documentation.",
        },
        {
          icon: "check",
          tone: "green",
          title: "Handover",
          description:
            "Full source code, deployment guidance and maintainable architecture.",
        },
      ],
    },
    cta: {
      title: "Let’s plan the right product architecture.",
      description:
        "Share your scope and receive a practical delivery plan and quote.",
      primaryAction: { label: "Request a Quote", href: "/contact" },
      telegramLabel: "Telegram",
    },
  },
  gamesPage: {
    hero: {
      label: "Playable concepts",
      titleLines: ["Games that look great,", "feel fast, and play fair"],
      description:
        "Original formats. Every title can be adapted to your brand, market and operator stack.",
      primaryAction: { label: "Browse All Games", href: "#game-library" },
      secondaryAction: {
        label: "Discuss a Custom Game",
        href: "/contact?project=Custom%20casino%20game",
      },
      featured: {
        label: "Featured demo",
        title: "Fortune Vault",
        description:
          "A premium five-reel slot concept with expanding symbols, free spins and configurable jackpot mechanics.",
        reels: [
          { symbol: "7" },
          { symbol: "★" },
          { symbol: "■" },
          { symbol: "♛" },
          { symbol: "BAR" },
          { symbol: "7", active: true },
          { symbol: "■" },
          { symbol: "★" },
          { symbol: "♛" },
          { symbol: "7" },
          { symbol: "★" },
          { symbol: "BAR" },
        ],
        primaryAction: {
          label: "Play Demo",
          href: "/contact?project=Fortune%20Vault%20demo",
        },
        secondaryAction: {
          label: "Game Details",
          href: "#fortune-vault",
        },
        metric: "RTP 96.20%",
        volatility: "High volatility",
      },
    },
    catalog: {
      ariaLabel: "Filter the Aurevia game library",
      filterLabel: "Game library",
      label: "Demo showcase",
      title: "A flexible game portfolio.",
      description:
        "Use these titles as a starting point or commission a completely original concept.",
      filters: [
        { label: "All Games", value: "all" },
        { label: "Slots", value: "slots" },
        { label: "Crash", value: "crash" },
        { label: "Instant Win", value: "instant-win" },
        { label: "Table Inspired", value: "table-inspired" },
      ],
      games: [
        {
          id: "fortune-vault",
          title: "Fortune Vault",
          category: "slots",
          categoryLabel: "Premium slots",
          description: "5 reels · Free spins",
          metric: "96.20%",
          symbol: "7",
          artworkTone: "fortune",
          primaryAction: {
            label: "Play Demo",
            href: "/contact?project=Fortune%20Vault%20demo",
          },
          secondaryAction: {
            label: "Details",
            href: "/contact?project=Fortune%20Vault",
          },
        },
        {
          id: "neon-rush",
          title: "Neon Rush",
          category: "crash",
          categoryLabel: "Crash game",
          description: "Real-time multiplier",
          metric: "Configurable",
          symbol: "×",
          artworkTone: "neon",
          primaryAction: {
            label: "Play Demo",
            href: "/contact?project=Neon%20Rush%20demo",
          },
          secondaryAction: {
            label: "Details",
            href: "/contact?project=Neon%20Rush",
          },
        },
        {
          id: "royal-reels",
          title: "Royal Reels",
          category: "slots",
          categoryLabel: "Premium slots",
          description: "Bonus wheel · Wilds",
          metric: "95.80%",
          symbol: "♛",
          artworkTone: "royal",
          primaryAction: {
            label: "Play Demo",
            href: "/contact?project=Royal%20Reels%20demo",
          },
          secondaryAction: {
            label: "Details",
            href: "/contact?project=Royal%20Reels",
          },
        },
        {
          id: "dragon-treasure",
          title: "Dragon Treasure",
          category: "slots",
          categoryLabel: "Adventure slots",
          description: "Cascades · Multipliers",
          metric: "96.00%",
          symbol: "◆",
          artworkTone: "treasure",
          primaryAction: {
            label: "Play Demo",
            href: "/contact?project=Dragon%20Treasure%20demo",
          },
          secondaryAction: {
            label: "Details",
            href: "/contact?project=Dragon%20Treasure",
          },
        },
        {
          id: "cosmic-drop",
          title: "Cosmic Drop",
          category: "instant-win",
          categoryLabel: "Instant win",
          description: "Risk ladder · Quick play",
          metric: "96.10%",
          symbol: "✦",
          artworkTone: "cosmic",
          primaryAction: {
            label: "Play Demo",
            href: "/contact?project=Cosmic%20Drop%20demo",
          },
          secondaryAction: {
            label: "Details",
            href: "/contact?project=Cosmic%20Drop",
          },
        },
        {
          id: "black-table",
          title: "Black Table",
          category: "table-inspired",
          categoryLabel: "Table inspired",
          description: "Classic cards · Live feel",
          metric: "99.00%",
          symbol: "A",
          artworkTone: "table",
          primaryAction: {
            label: "Play Demo",
            href: "/contact?project=Black%20Table%20demo",
          },
          secondaryAction: {
            label: "Details",
            href: "/contact?project=Black%20Table",
          },
        },
      ],
    },
    delivery: {
      label: "Behind the experience",
      title: "More than a beautiful game screen.",
      description:
        "Aurevia combines creative direction, game mathematics, production engineering and operator controls in one delivery team.",
      pillars: [
        {
          icon: "spark",
          tone: "gold",
          title: "Game concept & UX",
          description:
            "Theme, narrative, symbols, sound direction, player flows and responsive interaction design.",
          footer: "Included in delivery",
        },
        {
          icon: "target",
          tone: "green",
          title: "Math & RTP models",
          description:
            "Probability tables, volatility, payout distribution, bonus logic and configurable operating profiles.",
          footer: "Included in delivery",
        },
        {
          icon: "devices",
          tone: "blue",
          title: "Production engineering",
          description:
            "HTML5 and WebGL clients, secure services, wallet hooks, telemetry and deployment-ready packaging.",
          footer: "Included in delivery",
        },
        {
          icon: "controls",
          tone: "violet",
          title: "Operator tooling",
          description:
            "Analytics, game configuration, player controls, campaigns, reporting and performance monitoring.",
          footer: "Included in delivery",
        },
      ],
      processAriaLabel: "Aurevia game delivery process",
      processSteps: [
        "Concept",
        "Math",
        "Prototype",
        "Production",
        "QA",
        "Release",
      ],
    },
    deployment: {
      label: "Demo to deployment",
      title: "Ready for your brand, wallet and platform.",
      description:
        "From a single game to a catalog of games or a fully integrated casino experience with operator tooling.",
      capabilitiesAriaLabel: "Deployment capabilities",
      capabilities: [
        "Custom branding",
        "Wallet API",
        "Game aggregator",
        "Bonus engine",
        "RTP profiles",
        "Telemetry",
        "Multi-language",
      ],
    },
    cta: {
      title: "Have a game idea? Let's make it playable.",
      description:
        "Share your theme, mechanics or market goals and receive a development plan.",
      primaryAction: { label: "Request a Quote", href: "/contact" },
      telegramLabel: "Telegram",
    },
  },
  platformPage: {
    hero: {
      label: "Operator infrastructure",
      titleLines: ["Casino platforms", "built for", "control"],
      description:
        "Launch and operate a modern casino ecosystem with a responsive player experience, secure management tools, configurable RTP profiles and real-time business visibility.",
      primaryAction: {
        label: "Request a Platform Quote",
        href: "/contact?project=Admin%20panel%20%2F%20operator%20platform",
      },
      secondaryAction: {
        label: "Explore Admin Features",
        href: "#admin-features",
      },
      overview: {
        ariaLabel: "Operator overview dashboard preview",
        brandMark: "A",
        brandName: "Control",
        navigationAriaLabel: "Operator overview navigation",
        navigation: [
          "Overview",
          "Games",
          "Players",
          "Wallets",
          "RTP",
          "Bonuses",
          "Reports",
        ],
        title: "Operator Overview",
        description: "Live performance across connected products",
        metrics: [
          {
            label: "GGR today",
            value: "$284.7k",
            change: "+18.4%",
            changeTone: "positive",
          },
          {
            label: "Players",
            value: "18,426",
            change: "+12.8%",
            changeTone: "positive",
          },
          {
            label: "Avg RTP",
            value: "96.17%",
            change: "Stable",
            changeTone: "neutral",
          },
        ],
        chartTitle: "Revenue trend",
        chartBars: [36, 54, 43, 68, 58, 86, 72, 104, 94, 121, 106, 132],
        productsTitle: "Top products",
        products: [
          { name: "Fortune Vault", players: "4,820", revenue: "$74.2k" },
          { name: "Neon Rush", players: "3,714", revenue: "$58.9k" },
          { name: "Royal Reels", players: "2,980", revenue: "$46.1k" },
        ],
      },
    },
    modules: {
      heading: {
        label: "Platform modules",
        title: "Every core workflow, connected.",
        description:
          "Choose the modules you need today and expand the ecosystem as your operation grows.",
      },
      items: [
        {
          icon: "spark",
          tone: "gold",
          title: "Player app & lobby",
          description:
            "Responsive game discovery, search, categories, favorites and personalized promotions.",
          footer: "Included capabilities",
        },
        {
          icon: "diamond",
          tone: "blue",
          title: "Account & wallet",
          description:
            "Registration, KYC touchpoints, balances, deposits, withdrawals and transaction history.",
          footer: "Included capabilities",
        },
        {
          icon: "wallet",
          tone: "violet",
          title: "Bonus & loyalty",
          description:
            "Campaign rules, free spins, cashback, missions, tiers and segmented rewards.",
          footer: "Included capabilities",
        },
        {
          icon: "controls",
          tone: "green",
          title: "Game management",
          description:
            "Catalog control, providers, availability, market visibility and launch configuration.",
          footer: "Included capabilities",
        },
        {
          icon: "target",
          tone: "gold",
          title: "Payments & reporting",
          description:
            "Provider integrations, reconciliation, exports and financial monitoring.",
          footer: "Included capabilities",
        },
        {
          icon: "shield",
          tone: "red",
          title: "Security & access",
          description:
            "Role-based permissions, audit trails, alerts and protected operator workflows.",
          footer: "Included capabilities",
        },
      ],
    },
    admin: {
      heading: {
        label: "Admin panel",
        title: "A control room for the entire operation.",
        description:
          "Designed around fast decisions, clear accountability and operational safety.",
      },
      tabsAriaLabel: "Admin panel capabilities",
      tabs: [
        "Overview",
        "Players",
        "RTP Profiles",
        "Transactions",
        "Promotions",
      ],
      dashboard: {
        ariaLabel: "Casino operator live dashboard preview",
        brandName: "Aurevia",
        brandLabel: "Operator suite",
        navigationAriaLabel: "Operator dashboard navigation",
        navigation: [
          "Dashboard",
          "Players",
          "Games",
          "RTP Profiles",
          "Wallets",
          "Transactions",
          "Bonuses",
          "Analytics",
          "User Roles",
          "Settings",
        ],
        title: "Live Dashboard",
        description: "Updated moments ago",
        actionLabel: "Export Report",
        metrics: [
          {
            label: "Net revenue",
            value: "$1.84M",
            change: "+16.2%",
            changeTone: "positive",
          },
          {
            label: "Active users",
            value: "52,190",
            change: "+9.6%",
            changeTone: "positive",
          },
          {
            label: "Deposits",
            value: "$624k",
            change: "+12.1%",
            changeTone: "positive",
          },
          {
            label: "Withdrawals",
            value: "$318k",
            change: "-2.4%",
            changeTone: "negative",
          },
        ],
        chart: {
          title: "Revenue and player activity",
          period: "30 days",
          points: [
            [1, 74],
            [10, 84],
            [19, 66],
            [28, 70],
            [38, 50],
            [48, 62],
            [57, 42],
            [67, 55],
            [76, 31],
            [85, 39],
            [94, 20],
          ],
        },
        traffic: [
          { label: "Organic", value: 62, tone: "gold" },
          { label: "Campaigns", value: 24, tone: "blue" },
          { label: "Affiliates", value: 14, tone: "violet" },
        ],
        activityTitle: "Recent activity",
        activity: [
          {
            tone: "gold",
            label: "RTP profile updated",
            detail: "Fortune Vault · Profile EU-02",
            time: "2 min ago",
          },
          {
            tone: "green",
            label: "Large withdrawal reviewed",
            detail: "Player #A98241 · $4,800",
            time: "8 min ago",
          },
          {
            tone: "violet",
            label: "Bonus campaign launched",
            detail: "Weekend Cashback · Segment VIP",
            time: "16 min ago",
          },
        ],
      },
    },
    rtp: {
      heading: {
        label: "RTP control",
        title: "Configure, test and govern game profiles.",
        description:
          "A controlled workflow for managing payout profiles, simulations and approvals without exposing unsafe system-level access.",
      },
      panel: {
        ariaLabel: "RTP profile management preview",
        profilesTitle: "RTP Profiles",
        newProfileLabel: "+ New Profile",
        profiles: [
          {
            name: "EU Standard",
            value: "96.20%",
            status: "Active",
            statusTone: "active",
            selected: true,
          },
          {
            name: "LATAM Growth",
            value: "95.60%",
            status: "Active",
            statusTone: "active",
          },
          {
            name: "High Value VIP",
            value: "97.10%",
            status: "Draft",
            statusTone: "draft",
          },
          {
            name: "Test Environment",
            value: "94.00%",
            status: "Test",
            statusTone: "test",
          },
        ],
        title: "EU Standard",
        description: "Profile ID RTP-EU-02 · Last approved Jul 30",
        actionLabel: "Save Changes",
        metrics: [
          { label: "Target RTP", value: "96.20%" },
          { label: "Volatility", value: "High" },
          { label: "Max win", value: "10,000×" },
          { label: "Bonus frequency", value: "1 in 120" },
        ],
        payoutTitle: "Payout distribution",
        payouts: [
          { label: "Base game", value: 58, tone: "gold" },
          { label: "Free spins", value: 24, tone: "blue" },
          { label: "Jackpot", value: 10, tone: "violet" },
          { label: "Bonus feature", value: 8, tone: "green" },
        ],
        auditTitle: "Governance & audit trail",
        audit: [
          {
            tone: "gold",
            label: "Draft created",
            detail: "James O.",
            time: "Jul 28 · 10:24",
          },
          {
            tone: "green",
            label: "Simulation passed",
            detail: "System",
            time: "Jul 29 · 13:16",
          },
          {
            tone: "green",
            label: "Profile approved",
            detail: "Maria K.",
            time: "Jul 30 · 09:42",
          },
        ],
      },
    },
    integrations: {
      heading: {
        label: "Integrations & security",
        title: "Connect the ecosystem without losing control.",
        description:
          "Payments, KYC, games and messaging connect through clear interfaces backed by role-based access and auditable workflows.",
      },
      capabilitiesAriaLabel: "Supported platform integrations",
      capabilities: [
        "Wallet API",
        "Payment providers",
        "KYC services",
        "Game aggregators",
        "CRM & messaging",
        "Data warehouse",
      ],
      securityTitle: "Security by design",
      securityItems: [
        {
          tone: "gold",
          title: "Role-based access",
          description: "Granular permissions by team.",
        },
        {
          tone: "blue",
          title: "Audit trails",
          description: "Sensitive actions stay reviewable.",
        },
        {
          tone: "violet",
          title: "Protected changes",
          description: "Approvals for financial updates.",
        },
        {
          tone: "green",
          title: "Monitoring",
          description: "Operational alerts and health visibility.",
        },
      ],
    },
    cta: {
      title: "Build the platform your operation needs.",
      description:
        "Share your business model, modules and integration requirements.",
      primaryAction: { label: "Request a Quote", href: "/contact" },
      telegramLabel: "Telegram",
    },
  },
  faq: [
    {
      question: "Do you provide the full source code?",
      answer:
        "Yes. Source-code ownership and the exact handoff scope are written into the project agreement before development starts.",
    },
    {
      question: "Can RTP and game settings be configurable?",
      answer:
        "They can be designed as controlled configuration workflows with permissions, validation and audit history appropriate to the product.",
    },
    {
      question: "Can you build both the game and the admin platform?",
      answer:
        "Yes. The engagement can cover a single game, a player-facing website, operator tooling or the full product stack.",
    },
    {
      question: "Can the site link to live game demos?",
      answer:
        "Yes. Add each hosted demo URL in src/content/site-content.ts and the existing cards will automatically display the live-demo action.",
    },
  ],
  contactPage: {
    hero: {
      label: "Start a project",
      title: "Let’s build something players want to open",
      description:
        "Tell us what you want to launch — a game, casino website, admin package or complete operator platform. We will respond with a clear scope, timeline and quote path.",
      telegramDescription: "Fastest way to start",
      whatsappDescription: "Global project inquiries",
    },
    form: {
      title: "Request a quote",
      description:
        "Share the basics. We will follow up to clarify scope, schedule and technical requirements.",
      fields: {
        name: { label: "Your name", placeholder: "Full name" },
        contact: {
          label: "Email or Telegram",
          placeholder: "you@company.com or @handle",
        },
        company: {
          label: "Company / brand",
          placeholder: "Company or product name",
        },
        targetMarket: {
          label: "Target market",
          placeholder: "Countries or regions",
        },
        projectTypeLabel: "Project type",
        budget: {
          label: "Budget range",
          placeholder: "Select approximate budget",
        },
        timeline: {
          label: "Target timeline",
          placeholder: "When do you want to launch?",
        },
        details: {
          label: "Project details",
          placeholder:
            "Tell us about mechanics, features, integrations, platforms or references.",
        },
      },
      projectTypes: [
        "Slot / betting game",
        "Web / mobile casino",
        "Casino website",
        "Admin panel",
      ],
      budgetOptions: [
        "Under $25,000",
        "$25,000–$75,000",
        "$75,000–$150,000",
        "$150,000+",
        "Not decided yet",
      ],
      consentLabel:
        "I understand this is a project inquiry and Aurevia may ask follow-up questions before quoting.",
      submitLabel: "Send project request",
      statusMessages: {
        success: {
          tone: "success",
          message:
            "Thank you. Your project request was delivered successfully.",
        },
        invalid: {
          tone: "error",
          message:
            "Please check the required fields and submit the form again.",
        },
        verification: {
          tone: "error",
          message:
            "Please complete the human verification and submit the form again.",
        },
        unavailable: {
          tone: "warning",
          message:
            "Form delivery is not configured on the server yet. Please contact us directly on Telegram.",
        },
        error: {
          tone: "error",
          message:
            "The message could not be delivered. Please use Telegram or phone instead.",
        },
        "rate-limited": {
          tone: "warning",
          message:
            "Too many form attempts were received. Please wait a few minutes or use Telegram.",
        },
      },
    },
    scopes: {
      heading: {
        label: "What can we quote?",
        title: "From one game to a full operator stack.",
        description:
          "Use the project request to describe a focused deliverable or a staged roadmap.",
      },
      items: [
        {
          icon: "spark",
          tone: "gold",
          title: "Single game",
          description:
            "Original slot, crash, betting or instant-win product with polished web or mobile delivery.",
          action: {
            label: "Discuss scope",
            href: "#quote-form",
          },
        },
        {
          icon: "devices",
          tone: "blue",
          title: "Game catalog",
          description:
            "A coordinated portfolio with shared services, wallet hooks, telemetry and content operations.",
          action: {
            label: "Discuss scope",
            href: "#quote-form",
          },
        },
        {
          icon: "diamond",
          tone: "violet",
          title: "Casino website",
          description:
            "Player acquisition, lobby, account, wallet, promotions and payment journeys.",
          action: {
            label: "Discuss scope",
            href: "#quote-form",
          },
        },
        {
          icon: "controls",
          tone: "green",
          title: "Platform & admin",
          description:
            "Operator services, player controls, RTP profiles, analytics, bonuses and role-based access.",
          action: {
            label: "Discuss scope",
            href: "#quote-form",
          },
        },
      ],
    },
    process: {
      heading: {
        label: "What happens next",
        title: "A fast, transparent quote process.",
        description:
          "The first conversation is designed to reduce uncertainty — not create a vague sales cycle.",
      },
      steps: [
        {
          number: "01",
          title: "Review",
          description:
            "We review your scope, market, target devices and required integrations.",
        },
        {
          number: "02",
          title: "Clarify",
          description:
            "We ask focused questions about mechanics, workflows, ownership and launch priorities.",
        },
        {
          number: "03",
          title: "Plan",
          description:
            "You receive a proposed delivery structure with milestones and major assumptions.",
        },
        {
          number: "04",
          title: "Quote",
          description:
            "We provide a commercial estimate and confirm the next practical step.",
        },
      ],
    },
    brief: {
      heading: {
        label: "Before you send",
        title: "The details that help us quote well.",
        description:
          "A concise brief is enough. These details make the first reply more useful.",
      },
      checklistAriaLabel: "Helpful project brief details",
      checklist: [
        "Game type or platform scope",
        "Reference products or visual direction",
        "Target markets and languages",
        "Wallet, payment or provider integrations",
        "Expected launch window",
        "Compliance or certification requirements",
      ],
      questionsTitle: "Common questions",
      questions: [
        {
          question: "Do you share source code?",
          answer: "Yes — full source-code handover is a core differentiator.",
        },
        {
          question: "Can you control RTP?",
          answer: "RTP profile design and operator controls can be included.",
        },
        {
          question: "Do you work globally?",
          answer:
            "Yes. Projects are coordinated remotely without a public office address.",
        },
      ],
    },
    cta: {
      title: "Ready to talk about your project?",
      description:
        "Send the form, message us on Telegram or call to begin a focused technical conversation.",
      primaryAction: { label: "Request a quote", href: "#quote-form" },
      telegramLabel: "Telegram",
    },
  },
  footer: {
    description: "Casino game development for a global market.",
    legalLine:
      "All product names and demo visuals shown are illustrative unless otherwise stated.",
    telegramLabel: "Telegram",
  },
} satisfies SiteContent;
