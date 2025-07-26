'use client';
import React from "react";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import ServicesSection from "../components/landing/ServicesSection";
import LeadershipSection from "../components/landing/LeadershipSection";
import ContactSection from "../components/landing/ContactSection";

export default function LandingPage() { // Renamed from HomePage to match common naming
  return (
    <div className="bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <LeadershipSection />
      <ContactSection />
    </div>
  );
}
