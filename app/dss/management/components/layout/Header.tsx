// app/leave/management/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { BriefcaseBusiness, ChevronRight } from 'lucide-react';

// NOTE: This component requires a CSS file or a global style block for the .wave-bg class
// or you can use inline styles (as shown below for simplicity).

export default function Header() {
  return (
    <header className="w-full bg-white shadow-lg relative overflow-hidden">
      {/* 1. WAVE GRAPHIC BACKGROUND (Interactive Graphics)
        - Using a background SVG/CSS pattern for a dynamic, wavy look.
        - Set to a subtle light-blue/gray for an official, non-distracting feel.
      */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39 56.44c58-10.79 114.16-30.13 172-41.94 82.26-17.34 168-18.45 250-5.83 82.26 12.67 168 18.45 250 5.83 58 10.79 114.16 30.13 172 41.94 58 10.79 114.16 30.13 172 41.94 133 25.17 259 0 359-33.88V0H0v56.44z' class='fill-gray-600' opacity='0.5'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '100% 100px',
          backgroundPosition: 'top',
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-2">
        {/* MOBILE & DESKTOP: Unified, Left-Dominant Layout */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-6 py-2">
          
          {/* LEFT SIDE: Logos and Main Title (One Side Focus) */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-6">
            
            {/* 1. Official Logos Grouping (Interactive) */}
            <div className="flex items-center space-x-3 p-1 rounded-lg bg-white/70 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md">
              <Link
                href="https://iitbhu.ac.in/"
                className="transition-transform duration-200 hover:scale-[1.05]"
              >
                <img
                  src="/Images/header/left2_IIt_logo.png"
                  alt="IIT BHU"
                  title="IIT BHU"
                  className="w-34 lg:w-36 h-auto"
                />
              </Link>
              <Link
                href="https://www.slcrvaranasi.com/"
                className="transition-transform duration-200 hover:scale-[1.05]"
              >
                <img
                  src="/Images/header/right1_slcr.png"
                  alt="Smart Laboratory on Clean River"
                  title="Smart Laboratory on Clean River"
                  className="w-36 lg:w-36 h-auto"
                />
              </Link>
            </div>

            {/* 2. System Title & Subtitle (Different Layout - Left Aligned) */}
            <div className="mt-2 lg:mt-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-gray-200 lg:border-l lg:pl-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-indigo-800 transition-colors duration-200 hover:text-indigo-600 flex items-center">
                <BriefcaseBusiness className="w-5 h-5 lg:w-7 lg:h-7 mr-2 text-indigo-500" />
                Leave Management Portal
              </h1>
              <p className="mt-0.5 text-xs lg:text-sm text-gray-600 font-medium leading-tight">
                An Official Leave Administration System
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Minimal Status/Marquee */}
          <div className="hidden lg:block w-40">
             <p className="text-xs text-gray-500 font-medium flex items-center justify-end">
                <ChevronRight className="w-3 h-3 text-indigo-400 mr-1" />
                Secure Access
              </p>
          </div>
          
           {/* MOBILE Marquee (Below main content) */}
          <div className="w-full lg:hidden overflow-hidden mt-2 border-t border-gray-100 pt-1">
            <p className="text-[10px] text-indigo-700 font-medium whitespace-nowrap overflow-hidden relative">
              <span
                className="inline-block whitespace-nowrap"
                style={{ animation: 'marquee 15s linear infinite' }}
              >
                • Streamlined leave requests • Real-time tracking • Instant approvals and status updates
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </header>
  );
}