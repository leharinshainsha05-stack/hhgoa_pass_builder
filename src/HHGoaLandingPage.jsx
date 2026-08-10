import React from "react";

export default function HHGoaLandingPage({ onGetStarted }) {
  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center bg-[#071c11] text-[#fffbea] select-none">
      {/* Fullscreen Looping Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/hero-bg.mp4"
      />

      {/* Main Center Content Container (Compact Frame with Generous Breathing Space on all 4 sides) */}
      <main className="relative z-20 w-full max-w-4xl px-4 sm:px-8 py-4 flex flex-col items-center justify-center text-center">
        
        {/* Header Group: Square Logo + Text Block (Scaled down for breathing room) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-[12px] md:gap-[18px] w-full max-w-3xl">
          
          {/* Left Square Logo - Height matched 1:1 with SVG text container */}
          <div className="shrink-0 flex items-center justify-center">
            <img
              src="/hh-goa-logo.png"
              alt="Hacker House Goa Logo"
              className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[135px] lg:h-[135px] object-cover rounded-[18px] sm:rounded-[22px] md:rounded-[26px] shadow-[0_16px_36px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-105 border border-white/10"
            />
          </div>

          {/* Right SVG Text Container - Letter Spacing Reduced by 4% (textLength 691px) */}
          <div className="flex flex-col justify-center w-full max-w-[300px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[538px]">
            <svg
              viewBox="0 0 691 180"
              className="w-full h-auto overflow-visible drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            >
              {/* Top Tagline: "This is" */}
              <text
                x="0"
                y="38"
                fill="#fffbea"
                fontFamily="Caveat, cursive"
                fontWeight="700"
                fontSize="46"
              >
                This is
              </text>

              {/* Line 1: "HH GOA'26" - Letter Spacing Reduced by 4% (691px) */}
              <text
                x="0"
                y="125"
                textLength="691"
                lengthAdjust="spacing"
                fill="#fffbea"
                fontFamily="Cinzel, serif"
                fontWeight="800"
                fontSize="96"
              >
                HH GOA'26
              </text>

              {/* Line 2: "HACKER HOUSE GOA 2026" - Letter Spacing Reduced by 4% (691px) */}
              <text
                x="0"
                y="168"
                textLength="691"
                lengthAdjust="spacing"
                fill="#fffbea"
                fontFamily="Cinzel, serif"
                fontWeight="700"
                fontSize="38"
              >
                HACKER HOUSE GOA 2026
              </text>
            </svg>
          </div>

        </div>

        {/* CTA Button - Scaled Proportionately with 48px Touch Target */}
        <div className="flex items-center justify-center mt-5 sm:mt-6">
          <button
            type="button"
            onClick={onGetStarted}
            className="min-h-[48px] bg-[#f5dc18] hover:bg-[#e5ce14] text-[#071c11] font-extrabold text-sm sm:text-base md:text-lg px-8 py-3 rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-[3px] border-[#0b6839] flex items-center justify-center"
          >
            Get Your ID Card
          </button>
        </div>

      </main>
    </div>
  );
}
