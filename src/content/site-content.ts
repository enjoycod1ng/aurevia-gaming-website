import { mediaPath } from "@/lib/media";
import { gameShowcase, preparedGames } from "@/content/prepared-games";
import { analyticsPreviewImage } from "@/content/platform-preview";
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
    { label: "Developers", href: "/docs" },
    { label: "Contact", href: "/contact" },
  ],
  primaryCta: {
    label: "Request a Quote",
    href: "/contact",
  },
  seo: {
    home: {
      title: "Casino Game Development Agency",
      description:
        "Aurevia Gaming builds casino websites, game API integrations and admin analytics platforms. Explore nine prepared Play’n GO titles in our integration sandbox.",
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
        "Explore nine prepared Play’n GO games in Aurevia’s API integration sandbox, with real game artwork and simulated client wallets.",
      path: "/games",
      keywords: [
        "Play’n GO API integration",
        "casino game integration",
        "game integration sandbox",
        "casino game catalog"
      ],
    },
    platforms: {
      title: "Casino Platforms",
      description:
        "Plan a multi-client game API analytics platform with wallet balances, bets, payouts, client results and Aurevia revenue reporting.",
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
      highlightedTitle: "connected.",
      description:
        "Game integrations, casino websites and admin analytics — built around your clients, their wallets and your business. Explore our prepared Play’n GO game catalog.",
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
        {
          "label": "9 PREPARED GAMES",
          "value": "Play’n GO catalog"
        },
        {
          "label": "WALLET API",
          "value": "Client-owned balances"
        },
        {
          "label": "ADMIN ANALYTICS",
          "value": "Clear business results"
        }
      ],
      showcase: gameShowcase,
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
          title: "Admin & API Analytics",
          description:
            "Clear reporting for API clients, wallet balances, game results, transactions and revenue share.",
          action: {
            label: "Explore Admin & API Analytics",
            href: "/services#admin-platforms",
          },
        },
      ],
    },
    demos: {
      heading: {
        label: "Prepared game catalog",
        title: "Real games. Connected through our API.",
        description: "Explore Play’n GO titles from our integration sandbox. Open the lobby, select a game and try it with a simulated wallet. Aurevia provides the integration layer; game titles and artwork belong to their respective owners.",
      },
      items: preparedGames.slice(0, 3),
    },
    platform: {
      heading: {
        "label": "Admin analytics",
        "title": "Every client.",
        "description": "A clear view of client wallet balances, betting results and your revenue share across API-integrated games. Explore our analytics platform design."
      },
      highlightedTitle: "One clear picture.",
      action: { label: "Explore Casino Platforms", href: "/casino-platforms" },
      features: [
        "Balances by client and currency",
        "Bets, payouts and gaming results",
        "Aurevia revenue share by client",
        "Settlement and callback visibility"
      ],
      dashboard: analyticsPreviewImage,
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
          detail: "Clients · Balances · Results",
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
            "Custom game development and provider API integration, illustrated with a real capture from our prepared Play’n GO sandbox.",
          capabilities: [
            "RNG and probability logic",
            "Bonus rounds and free spins",
            "Jackpot and tournament systems",
            "WebGL / HTML5 responsive UI",
          ],
          image: gameShowcase.image,
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
          image: { src: mediaPath("/media/games/moonprincess-gameplay.webp"), alt: "Moon Princess gameplay capture from the prepared integration", width: 1366, height: 768 },
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
          image: { src: mediaPath("/media/games/catalog-preview.webp"), alt: "Aurevia game catalog with real Play’n GO game artwork", width: 1429, height: 1111 },
        },
        {
          id: "admin-platforms",
          number: "04",
          tone: "green",
          title: "Admin panel development",
          description:
            "A reporting workspace for API-integrated games, multiple clients, balances, gaming results and company revenue.",
          capabilities: [
            "Client balance reporting",
            "Bets, payouts and gaming results",
            "Revenue share by client",
            "Transaction and settlement visibility"
          ],
          image: analyticsPreviewImage,
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
    },
  },
  gamesPage: {
    hero: {
      label: "Play’n GO integration",
      titleLines: ["Real games.", "Ready to explore."],
      description: "Nine prepared titles, one integration sandbox. Explore the game catalog and discuss how to connect your own client wallet and website.",
      primaryAction: { label: "Browse All Games", href: "#game-library" },
      secondaryAction: { label: "Discuss Integration", href: "/contact?project=Game%20API%20integration" },
      featured: gameShowcase,
    },
    catalog: {
      ariaLabel: "Filter the prepared Play’n GO catalog",
      filterLabel: "Game format",
      countLabel: "Games shown: {count}",
      label: "Prepared catalog",
      title: "Nine titles. Real game artwork.",
      description: "These Play’n GO titles are available in Aurevia’s integration sandbox. Open the lobby and choose a title to explore it with a simulated wallet. Game titles and artwork belong to their respective owners; Aurevia provides the integration layer.",
      filters: [ { label: "All Games", value: "all" }, { label: "Grid Slots", value: "grid-slots" }, { label: "Video Slots", value: "video-slots" } ],
      games: preparedGames,
    },
    cta: {
      title: "Connect the games to your platform.",
      description: "Talk through your game catalog, wallet callbacks, client requirements and reporting needs.",
      primaryAction: { label: "Discuss Integration", href: "/contact?project=Game%20API%20integration" },
    },
  },
  platformPage: {
    hero: {
      label: "Game API & admin analytics",
      titleLines: [
        "Your clients.",
        "Your games.",
        "Your results."
      ],
      description:
        "An analytics platform designed for game API businesses: understand each client’s balances, betting performance and contribution to your revenue. Preview the reporting experience below.",
      primaryAction: {
        label: "Request a Platform Quote",
        href: "/contact?project=Admin%20panel%20%2F%20operator%20platform",
      },
      secondaryAction: {
        label: "Explore Admin Features",
        href: "#admin-features",
      },
      overview: analyticsPreviewImage,
    },
    modules: {
      heading: {
        label: "Platform modules",
        title: "Every core workflow, connected.",
        description:
          "Plan the modules around your game integration, client operations and reporting needs.",
      },
      items: [
        {
          "icon": "spark",
          "tone": "gold",
          "title": "Game catalog",
          "description": "Browse assigned games, provider artwork and launch availability.",
          "footer": "Platform scope"
        },
        {
          "icon": "diamond",
          "tone": "blue",
          "title": "Client wallets",
          "description": "Inspect client balances and signed debit, credit and rollback callbacks.",
          "footer": "Platform scope"
        },
        {
          "icon": "wallet",
          "tone": "violet",
          "title": "Client results",
          "description": "Compare settled bets, payouts and gaming results by reporting period.",
          "footer": "Platform scope"
        },
        {
          "icon": "controls",
          "tone": "green",
          "title": "Game performance",
          "description": "Break down game activity by client, title and currency.",
          "footer": "Platform scope"
        },
        {
          "icon": "target",
          "tone": "gold",
          "title": "Revenue reporting",
          "description": "Separate your revenue share from the client’s remaining gaming result.",
          "footer": "Platform scope"
        },
        {
          "icon": "shield",
          "tone": "red",
          "title": "Access & settlement",
          "description": "Plan operator access, audit history and pending settlement workflows.",
          "footer": "Platform scope"
        }
      ],
    },
    admin: {
      heading: {
        label: "Admin dashboard design",
        title: "From client balances to company revenue.",
        description: "A sample reporting workspace for multiple API clients, with bets, payouts, client gaming results and Aurevia’s revenue share shown separately. The preview uses illustrative data.",
      },
      dashboard: analyticsPreviewImage,
    },
    reporting: {
      heading: {
        label: "Financial visibility",
        title: "Know what every number means.",
        description: "Separate player wallet balances, client gaming results and your own revenue so each report answers a clear business question.",
      },
      items: [
        { title: "Client wallet balances", description: "View balances by client and currency. The client wallet remains authoritative; a displayed balance is not revenue." },
        { title: "Client gaming results", description: "Compare settled bets and payouts for the same reporting period. Gross gaming revenue is bets minus payouts, with refunds and pending settlement tracked separately." },
        { title: "Aurevia revenue share", description: "Apply each client’s agreed share to the eligible result. Report Aurevia’s revenue separately from the client’s remaining result and from profit after operating costs." },
      ],
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
    },
  },
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
      sendingLabel: "Sending…",
      verificationLabel: "Protected by Cloudflare Turnstile.",
      verificationUnavailable: "Human verification is temporarily unavailable.",
      locale: "en",
      projectValues: ["Slot / betting game", "Web / mobile casino", "Casino website", "Admin panel"],
      budgetValues: ["Under $25,000", "$25,000–$75,000", "$75,000–$150,000", "$150,000+", "Not decided yet"],
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
    },
  },
  footer: {
    description: "Casino game development for a global market.",
    telegramLabel: "Telegram",
  },
} satisfies SiteContent;
