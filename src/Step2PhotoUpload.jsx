import React, { useState, useRef, useEffect } from "react";
import heic2any from "heic2any";
import { Camera, Upload, ArrowLeft, RefreshCw, AlertCircle, X } from "lucide-react";

export default function Step2PhotoUpload({
  formData = {},
  setFormData,
  onNext,
  onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Process uploaded or captured image file
  const processImageFile = async (file) => {
    if (!file) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      let processFile = file;
      const fileNameLower = file.name ? file.name.toLowerCase() : "";
      const fileTypeLower = file.type ? file.type.toLowerCase() : "";

      const isHeic =
        fileNameLower.endsWith(".heic") ||
        fileNameLower.endsWith(".heif") ||
        fileTypeLower.includes("heic") ||
        fileTypeLower.includes("heif");

      if (isHeic) {
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        processFile = Array.isArray(converted) ? converted[0] : converted;
      }

      const url = URL.createObjectURL(processFile);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (setFormData) {
          setFormData((prev) => ({ ...prev, userPhoto: url }));
        }
        setLoading(false);
        // Automatically advance to Step 3 preview upon successful photo selection
        if (onNext) {
          onNext();
        }
      };
      img.onerror = () => {
        setErrorMsg("Failed to read image file. Please upload a valid JPG, PNG, or HEIC.");
        setLoading(false);
      };
    } catch (err) {
      console.error("HEIC conversion / file load error:", err);
      setErrorMsg("Could not process image file. Try converting to JPG or PNG.");
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  // Start Webcam Video Stream
  const startWebcam = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });
      mediaStreamRef.current = stream;
      setIsWebcamOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn("Webcam access denied or unavailable, falling back to camera input:", err);
      // Fallback to native camera file input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setErrorMsg("Camera access unavailable. Please use the Upload Photo option.");
      }
    }
  };

  // Stop Webcam Video Stream
  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsWebcamOpen(false);
  };

  // Capture Frame from Webcam
  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    stopWebcam();

    if (setFormData) {
      setFormData((prev) => ({ ...prev, userPhoto: dataUrl }));
    }
    // Automatically advance to Step 3 preview
    if (onNext) {
      onNext();
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const rawTitleStr = formData.builderTitle?.trim() || "Goa Beach Hacker";
  const cleanTitleStr = rawTitleStr.startsWith("•") ? rawTitleStr.replace(/^•\s*/, "") : rawTitleStr;

  return (
    <div className="min-h-[100dvh] bg-[#0b6839] text-[#fffbea] flex flex-col font-sans">
      
      {/* Hidden File & Camera Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*, .heic, .HEIC"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <header className="w-full bg-[#ff0080] border-b-2 border-[#f5dc18] px-4 sm:px-8 py-3.5 flex items-center justify-between z-10 shadow-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/hh-goa-logo.png"
            alt="HH Goa Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 object-cover rounded-xl border border-[#f5dc18]"
          />
          <span className="font-cinzel text-base sm:text-lg md:text-xl font-bold text-[#fffbea] tracking-wider">
            HACKER HOUSE GOA '26
          </span>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] inline-flex items-center gap-1.5 sm:gap-2 bg-[#0b6839] hover:bg-[#071c11] text-[#fffbea] hover:text-[#f5dc18] px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold border border-[#f5dc18] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#f5dc18]" /> <span className="hidden sm:inline">Back to</span> Details
          </button>
        )}
      </header>

      {/* Main Split-Screen Container */}
      <main className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-[calc(100dvh-64px)] overflow-y-auto">
        
        {/* Left Panel: Details Summary (Off-White #fffbea) */}
        <div className="w-full md:col-span-1 bg-[#fffbea] text-[#000000] p-5 sm:p-8 lg:p-10 flex flex-col justify-between border-r border-[#0b6839]/10 text-left overflow-y-auto relative overflow-hidden z-0">
          
          {/* Watermark Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.06] overflow-hidden">
            <img
              src="/image_48.png"
              alt="Security Code Matrix Watermark"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10">
            <div className="text-xs md:text-sm font-black tracking-[0.2em] text-[#ff0080] uppercase mb-1">
              STEP 2 OF 3 • PHOTO CAPTURE
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-black text-[#0b6839] mb-5 sm:mb-8">
              Your Details Summary
            </h2>

            {/* Summary List */}
            <div className="space-y-4 md:space-y-6 bg-white/70 p-4 sm:p-6 rounded-2xl border border-[#0b6839]/15 shadow-sm">
              <div>
                <div className="text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-1">
                  NAME
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-black text-[#000000]">
                  {`${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "BUILDER NAME"}
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-1">
                  ROLE / STACK
                </div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a1a]">
                  {formData.primaryRole || "Full-Stack Developer"}
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-1">
                  SKILL
                </div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a1a]">
                  {formData.secondarySkill || "React / Next.js"}
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-1">
                  BUILDER TITLE
                </div>
                <div className="text-base sm:text-lg md:text-xl font-black text-[#ff0080] flex items-center gap-2">
                  <span className="text-[#ff0080] text-xl">•</span> {cleanTitleStr}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-6 relative z-10">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="min-h-[48px] inline-flex items-center gap-2 text-sm font-extrabold text-[#0b6839] hover:text-[#ff0080] py-3 px-5 rounded-xl border border-[#0b6839]/30 hover:border-[#ff0080] bg-white hover:bg-white/90 transition cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-[#0b6839]" />
                <span>Back to Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Dedicated Action Area (Dark Green #0b6839) */}
        <div className="w-full md:col-span-1 bg-[#0b6839] p-5 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center overflow-y-auto">
          
          <div className="max-w-md w-full flex flex-col items-center">
            
            {/* Step 2 Heading Prompt */}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-cinzel font-black text-[#fffbea] text-center mb-3 sm:mb-4 leading-snug">
              Take or upload a photo of yourself for your official Hacker House Goa Builder Pass.
            </h3>

            <p className="text-xs sm:text-sm text-[#fffbea]/80 mb-6 sm:mb-8 font-medium">
              Your photo will be auto-fitted onto your custom high-security Builder Pass.
            </p>

            {/* Two Large Action Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full mb-5 sm:mb-6">
              
              {/* Button 1: 📷 Take Photo */}
              <button
                type="button"
                onClick={startWebcam}
                className="min-h-[110px] h-28 sm:h-36 bg-[#f5dc18] hover:bg-[#ff0080] hover:text-[#fffbea] text-[#000000] rounded-2xl flex flex-col items-center justify-center p-3 sm:p-4 cursor-pointer shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 group border-2 border-[#f5dc18]"
              >
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 transition-transform group-hover:scale-110" />
                <span className="text-xs sm:text-base font-black">Take Photo</span>
              </button>

              {/* Button 2: 📤 Upload Photo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[110px] h-28 sm:h-36 bg-[#f5dc18] hover:bg-[#ff0080] hover:text-[#fffbea] text-[#000000] rounded-2xl flex flex-col items-center justify-center p-3 sm:p-4 cursor-pointer shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 group border-2 border-[#f5dc18]"
              >
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 transition-transform group-hover:scale-110" />
                <span className="text-xs sm:text-base font-black">Upload Photo</span>
              </button>
            </div>

            <p className="text-xs text-[#fffbea]/70 font-mono">
              Supports JPG, PNG, and iPhone HEIC (Auto-centered & cropped)
            </p>

            {loading && (
              <div className="mt-5 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#f5dc18] animate-pulse bg-black/30 px-4 py-2.5 rounded-xl border border-[#f5dc18]/30">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#f5dc18]" /> Processing image...
              </div>
            )}

            {errorMsg && (
              <div className="mt-5 p-3.5 bg-[#ff0080]/20 border border-[#ff0080] rounded-xl text-xs sm:text-sm font-semibold text-[#fffbea] flex items-center gap-2.5 text-left">
                <AlertCircle className="w-5 h-5 text-[#ff0080] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Webcam Modal */}
      {isWebcamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071c11] border-2 border-[#f5dc18] rounded-2xl p-4 sm:p-6 max-w-lg w-full flex flex-col items-center text-center shadow-2xl relative">
            <button
              type="button"
              onClick={stopWebcam}
              className="absolute top-4 right-4 text-[#fffbea] hover:text-[#ff0080] p-1 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h4 className="text-lg sm:text-xl font-cinzel font-black text-[#f5dc18] mb-3 sm:mb-4">
              Capture Profile Photo
            </h4>

            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 sm:mb-5 border border-[#f5dc18]/40 shadow-inner relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={captureWebcamPhoto}
                className="min-h-[48px] flex-1 py-3.5 bg-[#f5dc18] hover:bg-[#e5ce14] text-[#000000] font-black text-sm sm:text-base rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Photo</span>
              </button>
              <button
                type="button"
                onClick={stopWebcam}
                className="min-h-[48px] py-3.5 px-5 bg-white/10 hover:bg-white/20 text-[#fffbea] font-bold text-sm sm:text-base rounded-xl border border-white/20 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
