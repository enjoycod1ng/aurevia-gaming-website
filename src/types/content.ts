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

export type ServiceIconName =
  | "spark"
  | "devices"
  | "diamond"
  | "controls"
  | "shield"
  | "target"
  | "check"
  | "performance"
  | "wallet";

export type ServiceTone = "gold" | "blue" | "violet" | "green";

export interface HomeService {
  number: string;
  icon: ServiceIconName;
  title: string;
  description: string;
  action: ActionLink;
}

export interface HomeReason {
  number: string;
  title: string;
  description: string;
  result: string;
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
}

export interface ContactStatusMessage {
  tone: "success" | "warning" | "error";
  message: string;
}

export interface ContactScopeItem {
  icon: ServiceIconName;
  tone: ServiceTone;
  title: string;
  description: string;
  action: ActionLink;
}

export type GameCategory = "grid-slots" | "video-slots";

export interface GameCatalogItem {
  id: string;
  title: string;
  category: GameCategory;
  categoryLabel: string;
  description: string;
  image: MediaAsset;
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
}

export interface GameFilter {
  label: string;
  value: "all" | GameCategory;
}

export type PlatformTone = ServiceTone | "red";

export interface PlatformModule {
  icon: ServiceIconName;
  tone: PlatformTone;
  title: string;
  description: string;
  footer: string;
}

export interface PlatformSecurityItem {
  tone: PlatformTone;
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
    whatsappHref: string;
    telegramHandle: string;
    telegramUrl: string;
  };
  navigation: readonly NavigationItem[];
  primaryCta: ActionLink;
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
      showcase: GamePreview;
    };
    services: {
      heading: SectionCopy;
      items: readonly HomeService[];
    };
    demos: {
      heading: SectionCopy;
      items: readonly GameCatalogItem[];
    };
    platform: {
      heading: SectionCopy;
      highlightedTitle: string;
      action: ActionLink;
      features: readonly string[];
      dashboard: MediaAsset;
    };
    reasons: {
      heading: SectionCopy;
      items: readonly HomeReason[];
    };
    cta: ProjectCta;
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
      featured: GamePreview;
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
    cta: ProjectCta;
  };
  platformPage: {
    hero: {
      label: string;
      titleLines: readonly string[];
      description: string;
      primaryAction: ActionLink;
      secondaryAction: ActionLink;
      overview: MediaAsset;
    };
    modules: {
      heading: SectionCopy;
      items: readonly PlatformModule[];
    };
    admin: {
      heading: SectionCopy;
      dashboard: MediaAsset;
    };
    reporting: {
      heading: SectionCopy;
      items: readonly { title: string; description: string }[];
    };
    integrations: {
      heading: SectionCopy;
      capabilitiesAriaLabel: string;
      capabilities: readonly string[];
      securityTitle: string;
      securityItems: readonly PlatformSecurityItem[];
    };
    cta: ProjectCta;
  };
  contactPage: {
    hero: SectionCopy & {
      telegramDescription: string;
      whatsappDescription: string;
    };
    form: {
      title: string;
      description: string;
      fields: {
        name: { label: string; placeholder: string };
        contact: { label: string; placeholder: string };
        company: { label: string; placeholder: string };
        targetMarket: { label: string; placeholder: string };
        projectTypeLabel: string;
        budget: { label: string; placeholder: string };
        timeline: { label: string; placeholder: string };
        details: { label: string; placeholder: string };
      };
      projectTypes: readonly string[];
      budgetOptions: readonly string[];
      consentLabel: string;
      submitLabel: string;
      statusMessages: Readonly<Record<string, ContactStatusMessage>>;
    };
    scopes: {
      heading: SectionCopy;
      items: readonly ContactScopeItem[];
    };
    process: {
      heading: SectionCopy;
      steps: readonly ProcessStep[];
    };
    brief: {
      heading: SectionCopy;
      checklistAriaLabel: string;
      checklist: readonly string[];
      questionsTitle: string;
      questions: readonly FaqItem[];
    };
    cta: ProjectCta;
  };
  footer: {
    description: string;
    telegramLabel: string;
  };
}

export interface GamePreview {
  label: string;
  title: string;
  description: string;
  image: MediaAsset;
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
}
