'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Eye, Globe } from 'lucide-react';
import apiClient from '@/lib/api';

const SiteEditorPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [siteData, setSiteData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSiteData();
  }, []);

  const fetchSiteData = async () => {
    try {
      // Add timestamp to prevent caching
      const { data } = await apiClient.get(`/public/site-settings?t=${Date.now()}`);

      setSiteData(data.data || {});
    } catch (error) {
      console.error('Failed to fetch site data:', error);
      setSiteData({}); // Set empty object as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'hero', label: 'Hero Section', icon: Globe },
    { id: 'stats', label: 'Stats Section', icon: Eye },
    { id: 'banner', label: 'Banner Section', icon: Settings },
    { id: 'about', label: 'About Section', icon: Globe },
    { id: 'features', label: 'Features Section', icon: Eye },
    { id: 'services', label: 'Services Section', icon: Settings },
    { id: 'pricing', label: 'Pricing Section', icon: Globe },
    { id: 'leadership', label: 'Leadership Section', icon: Eye },
    { id: 'contact', label: 'Contact Section', icon: Settings }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to backend with action chain trigger
      const response = await apiClient.put('/super-admin/site-settings', {
        ...siteData,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Super Admin'
      });

      // Force refresh of site settings cache
      await fetchSiteData();
      
      // Trigger multiple refresh events for different components
      window.dispatchEvent(new Event('siteSettingsUpdated'));
      window.dispatchEvent(new Event('landingPageRefresh'));
      window.dispatchEvent(new Event('publicDataRefresh'));
      
      // Clear any cached data
      if ('caches' in window) {
        caches.delete('site-settings-cache');
      }
      
      alert('Settings saved successfully! Changes will appear on the landing page.');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSiteData = (field: string, value: any) => {
    setSiteData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File, field: string) => {
    if (!file) return;
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', activeTab);
    formData.append('field', field);
    
    try {
      setIsSaving(true);
      console.log('Uploading image:', { fileName: file.name, size: file.size, type: file.type });
      
      const response = await apiClient.post('/super-admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout
      });
      
      console.log('Upload response:', response.data);
      
      if (response.data.success) {
        // Update the site data with the new image URL
        const newSiteData = { 
          ...siteData, 
          [field]: response.data.data.imageUrl,
          lastImageUpdate: new Date().toISOString()
        };
        setSiteData(newSiteData);
        
        // Automatically save the settings
        await apiClient.put('/super-admin/site-settings', newSiteData);
        
        alert('Image uploaded and saved successfully!');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Image upload failed:', error);
      const message = error.response?.data?.message || error.message || 'Failed to upload image';
      alert(`Upload failed: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading site data...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Site Editor</h1>
          <p className="text-text-secondary mt-1">Customize your platform's appearance and content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="app-surface rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-app-border max-h-[60vh] lg:max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold text-text-primary mb-4 text-sm lg:text-base">Landing Page Sections</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'hover:bg-app-bg text-text-secondary'
                  }`}
                >
                  <tab.icon size={16} className="lg:w-[18px] lg:h-[18px]" />
                  <span className="font-medium text-xs lg:text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="app-surface rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-app-border max-h-[70vh] lg:max-h-[80vh] overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-text-primary mb-4">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-text-secondary mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={siteData.siteName || 'HNV Property Management'}
                      onChange={(e) => updateSiteData('siteName', e.target.value)}
                      className="w-full p-2 lg:p-3 text-sm lg:text-base border border-app-border rounded-xl lg:rounded-2xl bg-app-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={siteData.contactEmail || 'support@hnvpm.com'}
                      onChange={(e) => updateSiteData('contactEmail', e.target.value)}
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Site Description
                  </label>
                  <textarea
                    rows={3}
                    value={siteData.siteDescription || 'Professional Property Management Solutions'}
                    onChange={(e) => updateSiteData('siteDescription', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Hero Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={siteData.heroTitle || 'The All-in-One Platform for Modern Property Management'}
                    onChange={(e) => updateSiteData('heroTitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Hero Background Image
                  </label>
                  <div className="border-2 border-dashed border-app-border rounded-2xl p-6 text-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id="hero-bg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'heroBackgroundImage');
                      }}
                    />
                    <label htmlFor="hero-bg" className="cursor-pointer">
                      <div className="text-text-muted mb-2">Click to upload hero background</div>
                      <div className="text-sm text-text-secondary">PNG, JPG up to 5MB</div>
                      {siteData.heroBackgroundImage && (
                        <div className="mt-2 text-green-600 text-sm">✓ Image uploaded</div>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={3}
                    value={siteData.heroSubtitle || 'Streamline your property management with our comprehensive solution'}
                    onChange={(e) => updateSiteData('heroSubtitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    defaultValue="Start Your Free Trial"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Stats Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Stats Title
                  </label>
                  <input
                    type="text"
                    value={siteData.statsTitle || 'Trusted by Property Managers Worldwide'}
                    onChange={(e) => updateSiteData('statsTitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Stats Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={siteData.statsSubtitle || 'Join thousands of property managers who trust our platform'}
                    onChange={(e) => updateSiteData('statsSubtitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'landscape' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Landscape Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Landscape Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Transform Your Property Management"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Landscape Subtitle
                  </label>
                  <textarea
                    rows={2}
                    defaultValue="Experience the future of property management"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'transform' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Transform Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Transform Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Transform Your Business"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Transform Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Streamline operations and grow your portfolio"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'banner' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Banner Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Banner Image
                  </label>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-app-border rounded-2xl p-6 text-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="banner-img"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'bannerImage');
                        }}
                      />
                      <label htmlFor="banner-img" className="cursor-pointer">
                        <div className="text-text-muted mb-2">Click to upload banner image</div>
                        <div className="text-sm text-text-secondary">PNG, JPG up to 5MB</div>
                        {siteData.bannerImage && (
                          <div className="mt-2 text-green-600 text-sm">✓ Image uploaded</div>
                        )}
                      </label>
                    </div>
                    <input
                      type="url"
                      value={siteData.bannerImage || ''}
                      onChange={(e) => updateSiteData('bannerImage', e.target.value)}
                      placeholder="Or enter image URL"
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Banner Overlay Text
                  </label>
                  <input
                    type="text"
                    value={siteData.bannerOverlayText || ''}
                    onChange={(e) => updateSiteData('bannerOverlayText', e.target.value)}
                    placeholder="Optional overlay text"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Banner Overlay Subtext
                  </label>
                  <input
                    type="text"
                    value={siteData.bannerOverlaySubtext || ''}
                    onChange={(e) => updateSiteData('bannerOverlaySubtext', e.target.value)}
                    placeholder="Optional overlay subtext"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">About Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    About Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Why Choose Our Platform?"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    About Subtitle
                  </label>
                  <textarea
                    rows={2}
                    defaultValue="Built for modern property managers"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Features Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Features Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Powerful Features"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Features Subtitle
                  </label>
                  <input
                    type="text"
                    defaultValue="Everything you need to manage properties efficiently"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 border border-app-border rounded-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Feature {i} Title
                          </label>
                          <input
                            type="text"
                            defaultValue={`Feature ${i}`}
                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Feature {i} Description
                          </label>
                          <textarea
                            rows={2}
                            defaultValue={`Description for feature ${i}`}
                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Feature {i} Icon/Image
                        </label>
                        <div className="border-2 border-dashed border-app-border rounded-xl p-4 text-center">
                          <input type="file" accept="image/*" className="hidden" id={`feature-${i}`} />
                          <label htmlFor={`feature-${i}`} className="cursor-pointer">
                            <div className="text-text-muted text-sm">Upload feature icon</div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Services Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Services Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Our Services"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Services Subtitle
                  </label>
                  <input
                    type="text"
                    defaultValue="Comprehensive property management solutions"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Pricing Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Pricing Title
                  </label>
                  <input
                    type="text"
                    value={siteData.pricingTitle || 'Simple, Transparent Pricing'}
                    onChange={(e) => updateSiteData('pricingTitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Pricing Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteData.pricingSubtitle || 'Choose the plan that fits your needs'}
                    onChange={(e) => updateSiteData('pricingSubtitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'leadership' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Leadership Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Leadership Title
                  </label>
                  <input
                    type="text"
                    value={siteData.leadershipTitle || 'Meet Our Team'}
                    onChange={(e) => updateSiteData('leadershipTitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Leadership Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteData.leadershipSubtitle || 'The experts behind our success'}
                    onChange={(e) => updateSiteData('leadershipSubtitle', e.target.value)}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-text-primary">Team Members</h4>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-app-border rounded-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Member {i} Name
                          </label>
                          <input
                            type="text"
                            defaultValue={`Team Member ${i}`}
                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Position
                          </label>
                          <input
                            type="text"
                            defaultValue={`Position ${i}`}
                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Profile Photo
                          </label>
                          <div className="border-2 border-dashed border-app-border rounded-xl p-3 text-center">
                            <input type="file" accept="image/*" className="hidden" id={`member-${i}`} />
                            <label htmlFor={`member-${i}`} className="cursor-pointer text-sm text-text-muted">
                              Upload photo
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'install' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Install App Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Install App Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Install Our App"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Install App Subtitle
                  </label>
                  <input
                    type="text"
                    defaultValue="Get the native mobile experience"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    App Store URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://apps.apple.com/..."
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Google Play URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://play.google.com/..."
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary">Contact Section</h2>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Contact Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Get in Touch"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Contact Subtitle
                  </label>
                  <textarea
                    rows={2}
                    defaultValue="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Contact Address
                    </label>
                    <input
                      type="text"
                      defaultValue="123 Business Ave, Suite 100"
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteEditorPage;