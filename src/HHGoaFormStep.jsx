import React from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Zap } from "lucide-react";

export default function HHGoaFormStep({
  formData,
  setFormData,
  onNext,
  onBack,
}) {
  const titlesList = [
    "Solana Architect",
    "3 AM Bug Creator",
    "Agentic AI Engineer",
    "Goa Beach Hacker",
    "Gas Fee Optimizer",
    "Zero-Knowledge Wizard",
    "Full-Stack Caffeine Engine",
    "DeFi Protocol Sorcerer",
    "Smart Contract Auditor",
    "Frontend Pixel Craftsman",
  ];

  const handleRandomTitle = () => {
    const random = titlesList[Math.floor(Math.random() * titlesList.length)];
    setFormData((prev) => ({ ...prev, builderTitle: random }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="min-h-screen bg-[#0b6839] text-[#000000] font-sans flex flex-col items-center">
      {/* 1. Top Header Nav Bar (Electric Pink #ff0080 with 3px Solid Neon Yellow #f5dc18 Bottom Border) */}
      <header className="w-full bg-[#ff0080] border-b-[3px] border-[#f5dc18] px-4 sm:px-8 py-4 flex items-center justify-between z-10 shadow-lg">
        {/* Left Side: HH Goa Logo + Serif Title "HACKER HOUSE GOA '26" in Off-White (#fffbea) */}
        <div className="flex items-center gap-3">
          <img
            src="/hh-goa-logo.png"
            alt="HH Goa Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl border border-[#f5dc18]"
          />
          <span className="font-cinzel text-lg sm:text-xl font-bold text-[#fffbea] tracking-wider">
            HACKER HOUSE GOA '26
          </span>
        </div>

        {/* Right Side: Back button leading to Hero Section */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-[#0b6839] hover:bg-[#071c11] text-[#fffbea] hover:text-[#f5dc18] px-4 py-2 rounded-full text-xs font-bold border border-[#f5dc18] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#f5dc18]" /> Back to Hero
          </button>
        )}
      </header>

      {/* Main Page Content Container */}
      <main className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        
        {/* Centered Form Card (Clean light-themed Off-White container #fffbea) */}
        <div className="w-full max-w-2xl bg-[#fffbea] rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-[#0b6839]/20 text-left">
          
          {/* Header Typography */}
          <div className="mb-8 text-left">
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#ff0080] uppercase tracking-widest mb-2">
              <Zap className="w-3.5 h-3.5 text-[#ff0080]" /> HACKER HOUSE GOA 2026
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl font-black font-cinzel text-[#0b6839] tracking-tight mb-2">
              Obtain Your Builder Pass
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#333333] font-medium max-w-xl leading-relaxed">
              Tell us who you are, what you're building, and your hacker title to generate your official badge.
            </p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Field Grid 1: First Name & Last Name (Side-by-side on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#0b6839] uppercase tracking-wider mb-2">
                  First Name <span className="text-[#ff0080]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leharin"
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full p-3.5 sm:p-4 rounded-xl bg-[#ffffff] border-2 border-gray-300 text-[#000000] placeholder-gray-500 focus:outline-none focus:border-[#ff0080] focus:ring-2 focus:ring-[#ff0080]/30 font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#0b6839] uppercase tracking-wider mb-2">
                  Last Name <span className="text-[#ff0080]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nisha"
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full p-3.5 sm:p-4 rounded-xl bg-[#ffffff] border-2 border-gray-300 text-[#000000] placeholder-gray-500 focus:outline-none focus:border-[#ff0080] focus:ring-2 focus:ring-[#ff0080]/30 font-medium transition"
                />
              </div>
            </div>

            {/* Field Grid 2: Primary Role & Secondary Skill (Side-by-side on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#0b6839] uppercase tracking-wider mb-2">
                  Primary Role / Stack <span className="text-[#ff0080]">*</span>
                </label>
                <select
                  required
                  value={formData.primaryRole || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryRole: e.target.value }))
                  }
                  className="w-full p-3.5 sm:p-4 rounded-xl bg-[#ffffff] border-2 border-gray-300 text-[#000000] focus:outline-none focus:border-[#ff0080] focus:ring-2 focus:ring-[#ff0080]/30 font-medium cursor-pointer transition"
                >
                  <option value="" disabled>Select your primary role...</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Frontend Engineer (React / Next.js)">Frontend Engineer (React / Next.js)</option>
                  <option value="Backend Architect (Node / Go / Python)">Backend Architect (Node / Go / Python)</option>
                  <option value="AI & Agentic Workflows">AI & Agentic Workflows</option>
                  <option value="Smart Contract & Web3 Engineer">Smart Contract & Web3 Engineer</option>
                  <option value="UI/UX & Product Designer">UI/UX & Product Designer</option>
                  <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                  <option value="Mobile Developer (React Native / Flutter)">Mobile Developer (React Native / Flutter)</option>
                  <option value="Security & Smart Contract Auditor">Security & Smart Contract Auditor</option>
                  <option value="Data Engineer & Analytics">Data Engineer & Analytics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#0b6839] uppercase tracking-wider mb-2">
                  Secondary Skill / Language
                </label>
                <select
                  value={formData.secondarySkill || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, secondarySkill: e.target.value }))
                  }
                  className="w-full p-3.5 sm:p-4 rounded-xl bg-[#ffffff] border-2 border-gray-300 text-[#000000] focus:outline-none focus:border-[#ff0080] focus:ring-2 focus:ring-[#ff0080]/30 font-medium cursor-pointer transition"
                >
                  <option value="">Select your secondary skill...</option>
                  <option value="React / Next.js / TypeScript">React / Next.js / TypeScript</option>
                  <option value="Python / FastAPI / PyTorch">Python / FastAPI / PyTorch</option>
                  <option value="Rust / Solana">Rust / Solana</option>
                  <option value="Solidity / EVM">Solidity / EVM</option>
                  <option value="Go / Microservices">Go / Microservices</option>
                  <option value="Figma & Design Systems">Figma & Design Systems</option>
                  <option value="LangChain / LlamaIndex / Agentic Frameworks">LangChain / LlamaIndex / Agentic Frameworks</option>
                  <option value="Docker / Kubernetes / AWS">Docker / Kubernetes / AWS</option>
                  <option value="PostgreSQL / Redis / Vector DBs">PostgreSQL / Redis / Vector DBs</option>
                  <option value="GraphQL / REST APIs">GraphQL / REST APIs</option>
                  <option value="TailwindCSS / Framer Motion">TailwindCSS / Framer Motion</option>
                  <option value="n8n / Automations & Scripting">n8n / Automations & Scripting</option>
                </select>
              </div>
            </div>

            {/* Field 3: Builder Title / Persona (Full width with auto-generate button in Electric Pink) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-bold text-[#0b6839] uppercase tracking-wider">
                  Builder Title / Persona
                </label>
                <button
                  type="button"
                  onClick={handleRandomTitle}
                  className="text-xs flex items-center gap-1.5 text-[#ff0080] hover:underline font-extrabold cursor-pointer transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#ff0080]" /> Auto-Generate Title
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Solana Architect"
                value={formData.builderTitle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, builderTitle: e.target.value }))
                }
                className="w-full p-3.5 sm:p-4 rounded-xl bg-[#ffffff] border-2 border-gray-300 text-[#000000] placeholder-gray-500 focus:outline-none focus:border-[#ff0080] focus:ring-2 focus:ring-[#ff0080]/30 font-medium transition"
              />
            </div>

            {/* Primary Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-[#f5dc18] hover:bg-[#ff0080] text-[#000000] hover:text-[#fffbea] font-black text-base sm:text-lg rounded-xl shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Next: Upload Photo & Preview</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

          </form>

        </div>

      </main>
    </div>
  );
}
