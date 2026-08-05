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
    phoneDisplay: "716-217-0171",
    phoneHref: "tel:+17162170171",
    telegramHandle: "@withtechs",
    telegramUrl: "https://t.me/withtechs",
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
    href: "https://t.me/withtechs",
    external: true,
    ariaLabel: "Message Aurevia Gaming on Telegram",
  },
  seo: {
    home: {
      title: "Casino Game & Platform Development",
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
      title: "Casino Development Services",
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
    demos: {
      title: "Demo Casino Games & Interfaces",
      description:
        "Preview representative slot, betting and operator interface concepts, then request access to live demo builds.",
      path: "/demo-games",
      keywords: [
        "slot game demos",
        "casino game portfolio",
        "betting UI demo",
        "casino admin demo",
      ],
    },
    platforms: {
      title: "Casino Platform & Admin Panel Development",
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
      title: "Request a Casino Development Quote",
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
      highlightedTitle: "built to win.",
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
        { label: "RTP", value: "Configurable control" },
        { label: "Source", value: "Full code handover" },
        { label: "Global", value: "Worldwide delivery" },
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
    proofAriaLabel: "Aurevia delivery standards",
    proofPoints: [
      { number: "01", label: "Quality-first delivery" },
      { number: "02", label: "Configurable RTP logic" },
      { number: "03", label: "Full source code shared" },
      { number: "04", label: "Web + mobile optimized" },
    ],
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
          action: { label: "Learn more", href: "/services#slot-betting-games" },
        },
        {
          number: "02",
          icon: "devices",
          title: "Web & Mobile Casino",
          description:
            "Fast, device-optimized casino experiences built for browser, Android and iOS delivery.",
          action: { label: "Learn more", href: "/services#web-mobile" },
        },
        {
          number: "03",
          icon: "diamond",
          title: "Casino Websites",
          description:
            "Conversion-focused operator websites with wallets, payments, promotions and player journeys.",
          action: { label: "Learn more", href: "/services#casino-websites" },
        },
        {
          number: "04",
          icon: "controls",
          title: "Admin & RTP Control",
          description:
            "Powerful management panels for games, users, transactions, bonuses, analytics and RTP profiles.",
          action: { label: "Learn more", href: "/services#admin-platforms" },
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
          primaryAction: { label: "Play Demo", href: "/demo-games" },
          secondaryAction: { label: "View Details", href: "/demo-games" },
        },
        {
          title: "Neon Rush",
          description: "Crash game \u00B7 Real-time",
          symbol: "\u00D7",
          theme: "neon",
          primaryAction: { label: "Play Demo", href: "/demo-games" },
          secondaryAction: { label: "View Details", href: "/demo-games" },
        },
        {
          title: "Royal Reels",
          description: "Premium slots \u00B7 Bonus rounds",
          symbol: "\u265B",
          theme: "royal",
          primaryAction: { label: "Play Demo", href: "/demo-games" },
          secondaryAction: { label: "View Details", href: "/demo-games" },
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
      title: "Engineering every layer of the casino experience.",
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
      proofAriaLabel: "Aurevia service delivery standards",
      proofPoints: [
        { number: "01", label: "Original game IP" },
        { number: "02", label: "Secure integrations" },
        { number: "03", label: "Responsive delivery" },
        { number: "04", label: "Operator ownership" },
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
          icon: "spark",
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
  demosPage: {
    label: "Games",
    title: "A configurable showcase for game and platform builds.",
    description:
      "Each card is driven by TypeScript content configuration. Replace the included WebP samples and add a live demo URL without changing the component markup.",
    note: "The bundled images are lightweight sample assets because the Figma file could not be exported through its current MCP plan limit.",
  },
  demos: [
    {
      id: "neon-forge",
      title: "Neon Forge",
      category: "Slot game concept",
      description:
        "A high-contrast reel experience demonstrating scalable game framing, controls and responsive asset treatment.",
      image: {
        src: "/media/demos/neon-forge.webp",
        alt: "Neon Forge slot game demo interface",
        width: 1200,
        height: 760,
      },
      tags: ["Web", "Mobile", "Configurable RTP"],
    },
    {
      id: "royal-vault",
      title: "Royal Vault",
      category: "Premium slot concept",
      description:
        "A luxury visual direction for bonus-led mechanics, branded symbols and event-based game states.",
      image: {
        src: "/media/demos/royal-vault.webp",
        alt: "Royal Vault premium slot game demo interface",
        width: 1200,
        height: 760,
      },
      tags: ["Slots", "Bonus States", "Responsive"],
    },
    {
      id: "velocity-bet",
      title: "Velocity Bet",
      category: "Sports betting concept",
      description:
        "A compact betting interface focused on clear market hierarchy, fast selection and readable live states.",
      image: {
        src: "/media/demos/velocity-bet.webp",
        alt: "Velocity Bet sportsbook demo interface",
        width: 1200,
        height: 760,
      },
      tags: ["Sportsbook", "Live Markets", "Mobile First"],
    },
    {
      id: "control-center",
      title: "Aurevia Control Center",
      category: "Operator admin concept",
      description:
        "A role-aware operational view for player activity, game controls, revenue reporting and platform health.",
      image: {
        src: "/media/demos/control-center.webp",
        alt: "Aurevia casino operator control center dashboard",
        width: 1200,
        height: 760,
      },
      tags: ["Admin", "Reporting", "RTP Controls"],
    },
  ],
  platformPage: {
    label: "Casino platforms",
    title:
      "One configurable back office for the systems that run your product.",
    description:
      "The platform architecture can be tailored to your games, providers, payment flows and operating model while keeping permissions, auditability and performance visible.",
    image: {
      src: "/media/platforms/operator-dashboard.webp",
      alt: "Casino operator dashboard showing revenue, players and system modules",
      width: 1600,
      height: 1000,
    },
    modulesHeading: "Core platform modules",
    modules: [
      {
        title: "Player management",
        description:
          "Profiles, verification status, account controls, limits, activity and support context in one view.",
      },
      {
        title: "Game & RTP controls",
        description:
          "Manage catalog availability, configurations and approved operational controls with audit history.",
      },
      {
        title: "Payments & transactions",
        description:
          "Monitor wallet activity, deposits, withdrawals, adjustments and provider-level transaction states.",
      },
      {
        title: "Promotions & retention",
        description:
          "Configure campaigns, bonuses, eligibility rules and lifecycle messaging around measurable outcomes.",
      },
      {
        title: "Reporting & analytics",
        description:
          "Track product, game and player performance through focused dashboards and exportable reports.",
      },
      {
        title: "Roles, audit & security",
        description:
          "Apply least-privilege access, trace material actions and integrate platform security controls.",
      },
    ],
    differentiators: [
      "Architecture matched to your operating model",
      "Source-code handoff and documented ownership",
      "Responsive interfaces for operational teams",
      "API-first integrations with providers and internal systems",
    ],
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
    label: "Start a project",
    title: "Tell us what you want to launch.",
    description:
      "Share the product type, required platforms, integrations and target timeline. We will use those details to shape the first technical conversation.",
    directContactTitle: "Prefer a direct conversation?",
    directContactDescription:
      "Telegram is the fastest contact route. Phone details are also available for scheduled discussions.",
    formTitle: "Project brief",
    formDescription:
      "The form submits server-side with no client JavaScript. Configure Telegram Bot or webhook credentials on the VPS to receive messages.",
    serviceOptions: [
      "Slot or betting game",
      "Web or mobile casino game",
      "Casino website",
      "Admin panel / operator platform",
      "Full product stack",
      "Other",
    ],
  },
  footer: {
    description: "Casino game development for a global market.",
    legalLine:
      "All product names and demo visuals shown are illustrative unless otherwise stated.",
    telegramLabel: "Telegram",
  },
} satisfies SiteContent;
