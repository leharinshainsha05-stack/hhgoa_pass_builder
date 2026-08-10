import React, { useState } from "react";
import HHGoaLandingPage from "./HHGoaLandingPage";
import HHGoaFormStep from "./HHGoaFormStep";
import Step2PhotoUpload from "./Step2PhotoUpload";
import Step3UploadPreview from "./Step3UploadPreview";

function App() {
  // step: 'landing' | 1 | 2 | 3
  const [step, setStep] = useState("landing");

  // Form Data State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    primaryRole: "Full-Stack Developer",
    secondarySkill: "React / Next.js",
    builderTitle: "Goa Beach Hacker",
    userPhoto: null,
  });

  return (
    <div className="min-h-screen bg-[#0b6839] text-[#fffbea]">
      {step === "landing" && (
        <HHGoaLandingPage onGetStarted={() => setStep(1)} />
      )}

      {(step === 1 || step === "form") && (
        <HHGoaFormStep
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(2)}
          onBack={() => setStep("landing")}
        />
      )}

      {(step === 2 || step === "upload") && (
        <Step2PhotoUpload
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {(step === 3 || step === "preview") && (
        <Step3UploadPreview
          formData={formData}
          setFormData={setFormData}
          onBackToUpload={() => setStep(2)}
          onBackToForm={() => setStep(1)}
          onBackToHero={() => setStep("landing")}
        />
      )}
    </div>
  );
}

export default App;
