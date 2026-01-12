'use client';

import Link from 'next/link';
import { EditableText } from './EditableText';
import { useDesign } from '@/context/DesignContext';

export function EditableHero() {
  const { settings, isEditMode } = useDesign();

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: settings.secondaryColor }}
        />
        <div
          className="absolute bottom-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: settings.accentColor }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: settings.primaryColor }}
        />
      </div>

      {/* Animated Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 900" fill="none">
        <path
          className="draw-line"
          d="M0 450 Q 360 200 720 450 T 1440 450"
          stroke={settings.primaryColor}
          strokeWidth="1"
          fill="none"
          style={{ animationDelay: '0.5s' }}
        />
        <path
          className="draw-line"
          d="M0 500 Q 360 700 720 500 T 1440 500"
          stroke={settings.secondaryColor}
          strokeWidth="1"
          fill="none"
          style={{ animationDelay: '1s' }}
        />
      </svg>

      <div className="absolute inset-0 grain" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 fade-in"
          style={{ fontFamily: settings.headingFont, color: settings.textColor }}
        >
          <EditableText
            textKey="hero.title"
            fallback="Art That Speaks"
            as="span"
            className="block"
            style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          />
          <br />
          <EditableText
            textKey="hero.subtitle"
            fallback="to Your Soul"
            as="span"
            className="italic"
          />
        </h1>
        <EditableText
          textKey="hero.description"
          fallback="Discover unique prints that transform your space into a personal gallery. Each piece tells a story."
          as="p"
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 fade-in fade-in-delay-1"
          style={{ fontFamily: settings.bodyFont, color: settings.textColor, opacity: 0.7 }}
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in fade-in-delay-2">
          <Link
            href="/gallery"
            className="group inline-flex items-center justify-center px-8 py-4 text-white text-sm tracking-wide transition btn-primary interactive-glow rounded-full"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <EditableText textKey="hero.cta" fallback="Explore Collection" />
            <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="#featured"
            className="group inline-flex items-center justify-center px-8 py-4 border text-sm tracking-wide transition rounded-full"
            style={{ borderColor: settings.secondaryColor, color: settings.textColor }}
          >
            View Featured Works
            <svg className="w-4 h-4 ml-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 fade-in fade-in-delay-3">
        <div className="flex flex-col items-center gap-2" style={{ color: settings.textColor, opacity: 0.4 }}>
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute top-20 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg z-50">
          Edit Mode: Double-click text to edit
        </div>
      )}
    </section>
  );
}
