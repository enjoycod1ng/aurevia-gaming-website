export type SitePath =
  | "/"
  | "/services"
  | "/games"
  | "/casino-platforms"
  | "/contact";

export interface NavigationItem {
  label: string;
  href: SitePath;
}

export interface ActionLink {
  label: string;
  href: string;
  external?: boolean;
  ariaLabel?: string;
}

export interface MediaAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface SeoEntry {
  title: string;
  description: string;
  path: SitePath;
  keywords: readonly string[];
}

export interface SectionCopy {
  label: string;
  title: string;
  description: string;
}

export interface HomeProofPoint {
  number: string;
  label: string;
}

export type ServiceIconName =
  | "spark"
  | "devices"
  | "diamond"
  | "controls"
  | "shield"
  | "target"
  | "check";

export type ServiceTone = "gold" | "blue" | "violet" | "green";

export interface HomeService {
  number: string;
  icon: ServiceIconName;
  title: string;
  description: string;
  action: ActionLink;
}

export interface HomeDemo {
  title: string;
  description: string;
  symbol: string;
  theme: "fortune" | "neon" | "royal";
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
}

export interface HomeReason {
  number: string;
  title: string;
  description: string;
  result: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  tone?: "positive" | "neutral";
}

export interface DashboardGame {
  name: string;
  players: string;
  revenue: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  tone: ServiceTone;
  title: string;
  description: string;
  capabilities: readonly string[];
  image: MediaAsset;
}

export interface ServiceLayer {
  icon: ServiceIconName;
  tone: ServiceTone;
  title: string;
  detail: string;
  progress: number;
}

export interface ServicePrinciple {
  icon: ServiceIconName;
  tone: ServiceTone;
  title: string;
  description: string;
}

export interface ProjectCta {
  title: string;
  description: string;
  primaryAction: ActionLink;
  telegramLabel: string;
  phoneLabel?: string;
}

export type GameCategory =
  | "slots"
  | "crash"
  | "instant-win"
  | "table-inspired";

export type GameArtworkTone =
  | "fortune"
  | "neon"
  | "royal"
  | "treasure"
  | "cosmic"
  | "table";

export interface GameCatalogItem {
  id: string;
  title: string;
  category: GameCategory;
  categoryLabel: string;
  description: string;
  metric: string;
  symbol: string;
  artworkTone: GameArtworkTone;
  image?: MediaAsset;
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
}

export interface GameFilter {
  label: string;
  value: "all" | GameCategory;
}

export interface DeliveryPillar {
  icon: ServiceIconName;
  tone: ServiceTone;
  title: string;
  description: string;
  footer: string;
}

export interface PlatformModule {
  title: string;
  description: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteContent {
  brand: {
    name: string;
    shortName: string;
    url: string;
    description: string;
  };
  contact: {
    phoneDisplay: string;
    phoneHref: string;
    telegramHandle: string;
    telegramUrl: string;
  };
  navigation: readonly NavigationItem[];
  primaryCta: ActionLink;
  secondaryCta: ActionLink;
  seo: {
    home: SeoEntry;
    services: SeoEntry;
    games: SeoEntry;
    platforms: SeoEntry;
    contact: SeoEntry;
  };
  home: {
    hero: {
      label: string;
      title: string;
      highlightedTitle: string;
      description: string;
      primaryAction: ActionLink;
      secondaryAction: ActionLink;
      detailsAriaLabel: string;
      details: readonly {
        label: string;
        value: string;
      }[];
      mockup: {
        ariaLabel: string;
        title: string;
        subtitle: string;
        reels: readonly {
          symbol: string;
          active?: boolean;
        }[];
        jackpotLabel: string;
        jackpotValue: string;
        metrics: readonly {
          label: string;
          value: string;
          change?: string;
          progress?: number;
        }[];
      };
    };
    proofAriaLabel: string;
    proofPoints: readonly HomeProofPoint[];
    services: {
      heading: SectionCopy;
      items: readonly HomeService[];
    };
    demos: {
      heading: SectionCopy;
      items: readonly HomeDemo[];
    };
    platform: {
      heading: SectionCopy;
      highlightedTitle: string;
      action: ActionLink;
      features: readonly string[];
      dashboard: {
        ariaLabel: string;
        navigationAriaLabel: string;
        brandMark: string;
        brandName: string;
        navigation: readonly string[];
        title: string;
        description: string;
        stats: readonly DashboardStat[];
        chart: {
          title: string;
          period: string;
          points: readonly (readonly [number, number])[];
        };
        gamesTitle: string;
        games: readonly DashboardGame[];
      };
    };
    reasons: {
      heading: SectionCopy;
      items: readonly HomeReason[];
    };
    cta: ProjectCta & { phoneLabel: string };
  };
  servicesPage: {
    hero: {
      label: string;
      title: string;
      description: string;
      primaryAction: ActionLink;
      secondaryAction: ActionLink;
      layersAriaLabel: string;
      layers: readonly ServiceLayer[];
      proofAriaLabel: string;
      proofPoints: readonly HomeProofPoint[];
    };
    offerings: {
      heading: SectionCopy;
      items: readonly ServiceItem[];
    };
    process: {
      heading: SectionCopy;
      steps: readonly ProcessStep[];
    };
    principles: {
      heading: SectionCopy;
      items: readonly ServicePrinciple[];
    };
    cta: ProjectCta;
  };
  gamesPage: {
    hero: {
      label: string;
      titleLines: readonly string[];
      description: string;
      primaryAction: ActionLink;
      secondaryAction: ActionLink;
      featured: {
        label: string;
        title: string;
        description: string;
        reels: readonly { symbol: string; active?: boolean }[];
        primaryAction: ActionLink;
        secondaryAction: ActionLink;
        metric: string;
        volatility: string;
      };
    };
    catalog: {
      ariaLabel: string;
      filterLabel: string;
      label: string;
      title: string;
      description: string;
      filters: readonly GameFilter[];
      games: readonly GameCatalogItem[];
    };
    delivery: {
      label: string;
      title: string;
      description: string;
      pillars: readonly DeliveryPillar[];
      processAriaLabel: string;
      processSteps: readonly string[];
    };
    deployment: {
      label: string;
      title: string;
      description: string;
      capabilitiesAriaLabel: string;
      capabilities: readonly string[];
    };
    cta: ProjectCta;
  };
  platformPage: {
    label: string;
    title: string;
    description: string;
    image: MediaAsset;
    modulesHeading: string;
    modules: readonly PlatformModule[];
    differentiators: readonly string[];
  };
  faq: readonly FaqItem[];
  contactPage: {
    label: string;
    title: string;
    description: string;
    directContactTitle: string;
    directContactDescription: string;
    formTitle: string;
    formDescription: string;
    serviceOptions: readonly string[];
  };
  footer: {
    description: string;
    legalLine: string;
    telegramLabel: string;
  };
}
