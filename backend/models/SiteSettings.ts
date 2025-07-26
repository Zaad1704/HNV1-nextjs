import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  siteName: string;
  contactEmail: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage?: string;
  statsTitle: string;
  statsSubtitle: string;
  bannerImage?: string;
  bannerOverlayText?: string;
  bannerOverlaySubtext?: string;
  pricingTitle?: string;
  pricingSubtitle?: string;
  leadershipTitle?: string;
  leadershipSubtitle?: string;
  leadership?: {
    title?: string;
    subtitle?: string;
    executives?: Array<{
      name: string;
      position: string;
      bio: string;
      imageUrl?: string;
      linkedin?: string;
      twitter?: string;
    }>;
  };
  heroSection?: {
    title?: string;
    subtitle?: string;
    bannerImage?: string;
  };
  featuresTitle?: string;
  featuresSubtitle?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  contactTitle?: string;
  contactSubtitle?: string;
  updatedAt: Date;
}

const SiteSettingsSchema: Schema<ISiteSettings> = new Schema({
  siteName: { type: String, default: 'HNV Property Management' },
  contactEmail: { type: String, default: 'support@hnvpm.com' },
  siteDescription: { type: String, default: 'Professional Property Management Solutions' },
  heroTitle: { type: String, default: 'The All-in-One Platform for Modern Property Management' },
  heroSubtitle: { type: String, default: 'Streamline your property management with our comprehensive solution' },
  heroBackgroundImage: { type: String, default: '' },
  statsTitle: { type: String, default: 'Trusted by Property Managers Worldwide' },
  statsSubtitle: { type: String, default: 'Join thousands of property managers who trust our platform' },
  bannerImage: { type: String, default: '' },
  bannerOverlayText: { type: String, default: '' },
  bannerOverlaySubtext: { type: String, default: '' },
  pricingTitle: { type: String, default: 'Simple, Transparent Pricing' },
  pricingSubtitle: { type: String, default: 'Choose the plan that fits your needs' },
  leadershipTitle: { type: String, default: 'Meet Our Team' },
  leadershipSubtitle: { type: String, default: 'The experts behind our success' },
  featuresTitle: { type: String, default: 'Powerful Features' },
  featuresSubtitle: { type: String, default: 'Everything you need to manage properties efficiently' },
  aboutTitle: { type: String, default: 'Why Choose Our Platform?' },
  aboutSubtitle: { type: String, default: 'Built for modern property managers' },
  contactTitle: { type: String, default: 'Get in Touch' },
  contactSubtitle: { type: String, default: "We'd love to hear from you. Send us a message and we'll respond as soon as possible." }
}, {
  timestamps: true,
  strict: false,
  minimize: false
});

export default mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);