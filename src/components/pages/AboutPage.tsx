'use client';
// frontend/src/pages/AboutPage.tsx
import React from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation'; // NEW: Import useDynamicTranslation

const AboutPage = () => {
  const { data: settings, isLoading, isError } = useSiteSettings();

  // NEW: Translate dynamic content from settings for this page
  const { translatedText: translatedTitle } = useDynamicTranslation(settings?.aboutPage?.title || 'About HNV Solutions');
  const { translatedText: translatedSubtitle } = useDynamicTranslation(settings?.aboutPage?.subtitle || 'We are dedicated to simplifying property management through innovative technology.');
  const { translatedText: translatedMissionTitle } = useDynamicTranslation(settings?.aboutPage?.missionTitle || 'Our Mission');
  const { translatedText: translatedMissionStatement } = useDynamicTranslation(settings?.aboutPage?.missionStatement || 'To provide user-friendly tools that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability.');
  const { translatedText: translatedVisionTitle } = useDynamicTranslation(settings?.aboutPage?.visionTitle || 'Our Vision');
  const { translatedText: translatedVisionStatement } = useDynamicTranslation(settings?.aboutPage?.visionStatement || 'To be the leading global platform for property management, recognized for our commitment to customer success and continuous innovation.');
  const { translatedText: translatedTeamTitle } = useDynamicTranslation(settings?.aboutPage?.teamTitle || 'Meet Our Leadership');
  const { translatedText: translatedTeamSubtitle } = useDynamicTranslation(settings?.aboutPage?.teamSubtitle || 'The driving force behind our commitment to excellence.');

  if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading...</div>; // Added dark mode class
  if (isError || !settings) return <div className="text-red-500 text-center p-8 dark:text-red-500">Error loading content.</div>; // Added dark mode class

  return (
    <div className="py-20 bg-light-bg text-dark-text dark:bg-dark-bg dark:text-dark-text-dark transition-colors duration-300"> {/* Added dark mode class */}
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center">{translatedTitle}</h1> {/* Added dark mode class */}
        <p className="text-light-text dark:text-light-text-dark mt-4 max-w-3xl mx-auto text-center">{translatedSubtitle}</p> {/* Added dark mode class */}
        
        {/* NEW: Main About Page Image */}
        {settings.aboutPage?.imageUrl && (
            <div className="mt-12 text-center">
                <img src={settings.aboutPage.imageUrl} alt="About Us" className="w-full max-w-4xl mx-auto rounded-xl shadow-lg border border-border-color dark:border-border-color-dark object-cover h-96 transition-all duration-200" width="auto" height="384"/> {/* Added width and height */}
            </div>
        )}

        {/* Mission & Vision Sections (from AboutSection.tsx logic) */}
        <div className="mt-20 grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
                <h3 className="text-2xl font-semibold text-brand-primary dark:text-brand-secondary mb-3 transition-colors">{translatedMissionTitle}</h3>
                <p className="text-light-text dark:text-light-text-dark leading-relaxed">{translatedMissionStatement}</p>
            </div>
            <div>
                <h3 className="text-2xl font-semibold text-brand-primary dark:text-brand-secondary mb-3 transition-colors">{translatedVisionTitle}</h3>
                <p className="text-light-text dark:text-light-text-dark leading-relaxed">{translatedVisionStatement}</p>
            </div>
        </div>

        {/* Leadership Section */}
        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center">{translatedTeamTitle}</h2>
            <p className="text-light-text dark:text-light-text-dark mt-4 max-w-2xl mx-auto text-center">{translatedTeamSubtitle}</p>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {settings.aboutPage?.executives.map((exec, index) => {
                    const { translatedText: translatedExecName } = useDynamicTranslation(exec.name);
                    const { translatedText: translatedExecTitle } = useDynamicTranslation(exec.title);
                    return (
                        <div key={index} className="text-center bg-light-card dark:bg-dark-card/70 p-8 rounded-xl border border-border-color dark:border-border-color-dark shadow-md transition-all duration-200"> {/* Added dark mode classes */}
                            <img src={exec.imageUrl} alt={exec.name} className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-border-color dark:border-border-color-dark" width="160" height="160" /> {/* Added width and height */}
                            <h4 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{translatedExecName}</h4>
                            <p className="text-brand-primary dark:text-brand-secondary">{translatedExecTitle}</p>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
