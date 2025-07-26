export interface IFeature {
  title: string;
  description: string;
  text: string;
  icon: string;
  sectionId: string;
}

export interface IFeaturesPage {
  title: string;
  subtitle: string;
  features: IFeature[];
}

export interface ISiteSettings {
  logos?: {
    companyName?: string;
    faviconUrl?: string;
    footerLogoUrl?: string;
    navbarLogoUrl?: string;
  };
  heroSection?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    customImageUrl?: string;
    additionalImageUrl?: string;
    additionalTitle?: string;
    additionalDescription?: string;
  };
  footer?: {
    description?: string;
    copyrightText?: string;
    quickLinks?: Array<{
      text: string;
      url: string;
    }>;
  };
  contact?: {
    email?: string;
    phone?: string;
    addresses?: string[];
  };
  featuresPage?: IFeaturesPage;
  bannerSection?: {
    imageUrl?: string;
    altText?: string;
    overlayText?: string;
    overlaySubtext?: string;
  };
}