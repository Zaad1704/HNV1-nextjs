"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SiteSettingsSchema = new mongoose_1.Schema({
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
exports.default = mongoose_1.default.model('SiteSettings', SiteSettingsSchema);
