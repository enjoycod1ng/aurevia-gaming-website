export type SitePath =
  | "/"
  | "/services"
  | "/demo-games"
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

export interface HomeService {
  number: string;
  icon: "spark" | "devices" | "diamond" | "controls";
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
  title: string;
  summary: string;
  description: string;
  capabilities: readonly string[];
  image: MediaAsset;
}

export interface DemoItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: MediaAsset;
  tags: readonly string[];
  demoUrl?: string;
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
    demos: SeoEntry;
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
    cta: {
      title: string;
      description: string;
      primaryAction: ActionLink;
      telegramLabel: string;
      phoneLabel: string;
    };
    processHeading: SectionCopy;
  };
  servicesPage: {
    label: string;
    title: string;
    description: string;
  };
  services: readonly ServiceItem[];
  demosPage: {
    label: string;
    title: string;
    description: string;
    note: string;
  };
  demos: readonly DemoItem[];
  platformPage: {
    label: string;
    title: string;
    description: string;
    image: MediaAsset;
    modulesHeading: string;
    modules: readonly PlatformModule[];
    differentiators: readonly string[];
  };
  process: readonly ProcessStep[];
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
