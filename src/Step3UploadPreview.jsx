import React, { useState, useRef, useEffect } from "react";
import heic2any from "heic2any";
import { toPng } from "html-to-image";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import {
  Camera,
  Upload,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  Edit3,
  Sliders,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// Preload sticker PNG assets for canvas rendering fallback
const stickerTicketImg = typeof window !== "undefined" ? new Image() : null;
if (stickerTicketImg) stickerTicketImg.src = "/image_351993.png";

const stickerVerifiedImg = typeof window !== "undefined" ? new Image() : null;
if (stickerVerifiedImg) stickerVerifiedImg.src = "/image_351997.png";

export default function Step3UploadPreview({
  formData = {},
  setFormData,
  onBackToUpload,
  onBackToForm,
  onBackToHero,
}) {
  const safeFormData = formData || {};

  // Default Sample Avatar SVG Data URI for immediate poster preview
  const DEFAULT_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b6839" />
        <stop offset="50%" stop-color="#071c11" />
        <stop offset="100%" stop-color="#ff0080" />
      </linearGradient>
      <linearGradient id="avatar" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f5dc18" />
        <stop offset="100%" stop-color="#ff0080" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" fill="url(#bg)" />
    <circle cx="250" cy="190" r="95" fill="url(#avatar)" />
    <path d="M 90 450 C 90 310, 410 310, 410 450 Z" fill="url(#avatar)" opacity="0.9" />
    <circle cx="215" cy="180" r="12" fill="#000" />
    <circle cx="285" cy="180" r="12" fill="#000" />
    <path d="M 210 230 Q 250 265 290 230" stroke="#000" stroke-width="8" stroke-linecap="round" fill="none" />
  </svg>
  `)}`;

  const [imageSrc, setImageSrc] = useState(safeFormData.userPhoto || DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showAdjustControls, setShowAdjustControls] = useState(false);
  const [toastState, setToastState] = useState({ show: false, message: "" });

  const toast = {
    success: (msg) => {
      setToastState({ show: true, message: msg });
      setTimeout(() => {
        setToastState({ show: false, message: "" });
      }, 4500);
    },
  };

  // Check if a custom user photo is present (vs default sample avatar)
  const hasCustomPhoto = Boolean(safeFormData.userPhoto) || (Boolean(imageSrc) && imageSrc !== DEFAULT_AVATAR);

  // Manual Photo Repositioning & Zoom Controls
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const canvasRef = useRef(null);
  const rawCardCanvasRef = useRef(null);
  const imageObjRef = useRef(null);
  const logoObjRef = useRef(null);
  const watermarkObjRef = useRef(null);
  const mascotObjRef = useRef(null);

  // Dedicated refs for separate Camera and File Explorer inputs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Preload HH Goa Logo, Watermark Matrix & Mascot Assets
  useEffect(() => {
    const logo = new Image();
    logo.src = "/hh-goa-logo.png";
    logo.onload = () => {
      logoObjRef.current = logo;
      if (imageSrc) {
        drawGraphic();
      }
    };

    const wm = new Image();
    wm.src = "/image_48.png";
    wm.onload = () => {
      watermarkObjRef.current = wm;
      if (imageSrc) {
        drawGraphic();
      }
    };

    const mascot = new Image();
    mascot.src = "/mascot-removebg-preview.png";
    mascot.onload = () => {
      mascotObjRef.current = mascot;
      if (imageSrc) {
        drawGraphic();
      }
    };
  }, []);

  // Update imageObjRef when imageSrc changes
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageObjRef.current = img;
        drawGraphic();
      };
    }
  }, [imageSrc]);

  // Process uploaded image file (.jpg, .png, .heic)
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
        imageObjRef.current = img;
        setImageSrc(url);
        if (setFormData) {
          setFormData((prev) => ({ ...prev, userPhoto: url }));
        }
        // Reset zoom & offset positions on new image upload
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
        setLoading(false);
      };
      img.onerror = () => {
        setErrorMsg("Failed to read image file. Please upload a valid JPG, PNG, or HEIC.");
        setLoading(false);
      };
    } catch (err) {
      console.error("HEIC conversion / file load error:", err);
      setErrorMsg("Could not process HEIC file. Try converting to JPG or PNG.");
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

  const handleImageUpload = handlePhotoUpload;

  // Live Canvas Drawing Routine with try/catch Error Boundary
  const drawGraphic = () => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          drawCompositeBuilderCard(canvas, ctx);
        }
      }
      const rawCanvas = rawCardCanvasRef.current;
      if (rawCanvas) {
        const rawCtx = rawCanvas.getContext("2d");
        if (rawCtx) {
          drawRawBuilderCard(rawCanvas, rawCtx);
        }
      }
    } catch (err) {
      console.warn("Canvas drawing safely caught error:", err);
    }
  };

  useEffect(() => {
    if (imageSrc) {
      drawGraphic();
    }
  }, [formData, imageSrc, zoom, offsetX, offsetY]);

  useEffect(() => {
    if (imageSrc && document.fonts) {
      document.fonts.ready.then(() => {
        drawGraphic();
      });
    }
  }, [imageSrc]);

  // Helper: Draw multi-line wrapped text on Canvas
  const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY;
  };

  // --- 1. RAW ID BADGE CANVAS RENDERING (1080 x 1500 STANDALONE PASS) ---
  const drawRawBuilderCard = (canvas, ctx) => {
    canvas.width = 1080;
    canvas.height = 1500;

    // Fill Outer Frame Color
    ctx.fillStyle = "#071c11";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardX = 30;
    const cardY = 30;
    const cardW = 1020;
    const cardH = 1440;
    const cardR = 36;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.clip();

    // Off-White Card Body Background (#fffbea)
    ctx.fillStyle = "#fffbea";
    ctx.fillRect(cardX, cardY, cardW, cardH);

    // DISTINCTLY VISIBLE SECURITY WATERMARK PATTERN INSIDE CARD BODY (20% OPACITY)
    const wmImg = watermarkObjRef.current;
    if (wmImg) {
      ctx.save();
      ctx.globalAlpha = 0.20;
      ctx.drawImage(wmImg, cardX, cardY + 190, cardW, cardH - 190 - 175);
      ctx.restore();
    }

    // Card Body Security Grid Line Accents
    ctx.save();
    ctx.strokeStyle = "rgba(11, 104, 57, 0.08)";
    ctx.lineWidth = 2;
    for (let x = cardX; x < cardX + cardW; x += 55) {
      ctx.beginPath();
      ctx.moveTo(x, cardY + 190);
      ctx.lineTo(x, cardY + cardH - 175);
      ctx.stroke();
    }
    for (let y = cardY + 190; y < cardY + cardH - 175; y += 55) {
      ctx.beginPath();
      ctx.moveTo(cardX, y);
      ctx.lineTo(cardX + cardW, y);
      ctx.stroke();
    }
    ctx.restore();

    // Header Bar (#ff0080)
    const headerH = 190;
    ctx.fillStyle = "#ff0080";
    ctx.fillRect(cardX, cardY, cardW, headerH);

    // Logo Badge
    const logoX = cardX + 35;
    const logoY = cardY + 25;
    const logoSize = 140;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 22);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.strokeStyle = "#f5dc18";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.clip();

    const logoImg = logoObjRef.current;
    if (logoImg) {
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    }
    ctx.restore();

    // Header Text
    const headerTextX = logoX + logoSize + 30;
    ctx.fillStyle = "#fffbea";
    ctx.font = "bold 44px 'Cinzel', Georgia, serif";
    ctx.fillText("HACKER HOUSE", headerTextX, cardY + 85);

    ctx.fillStyle = "#fffbea";
    ctx.font = "800 52px 'Cinzel', Georgia, serif";
    ctx.fillText("GOA '26", headerTextX, cardY + 145);

    // Accent Line
    ctx.fillStyle = "#f5dc18";
    ctx.fillRect(cardX, cardY + headerH, cardW, 4);

    // Photo Box (Left)
    const photoX = cardX + 35;
    const photoY = cardY + headerH + 35;
    const photoW = 440;
    const photoH = 440;
    const photoR = 24;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.fillStyle = "#fffbea";
    ctx.fill();
    ctx.clip();

    const userImg = hasCustomPhoto ? imageObjRef.current : null;
    if (userImg) {
      const aspect = userImg.width / userImg.height;
      let sx, sy, sWidth, sHeight;

      if (aspect > 1) {
        sHeight = userImg.height;
        sWidth = userImg.height;
        sx = (userImg.width - userImg.height) / 2;
        sy = 0;
      } else {
        sWidth = userImg.width;
        sHeight = userImg.width;
        sx = 0;
        sy = (userImg.height - userImg.width) * 0.2;
      }

      const cropW = sWidth / zoom;
      const cropH = sHeight / zoom;

      const cropX = sx + (sWidth - cropW) / 2 + offsetX;
      const cropY = sy + (sHeight - cropH) / 2 + offsetY;

      const clampedX = Math.max(0, Math.min(userImg.width - cropW, cropX));
      const clampedY = Math.max(0, Math.min(userImg.height - cropH, cropY));

      ctx.drawImage(
        userImg,
        clampedX,
        clampedY,
        cropW,
        cropH,
        photoX,
        photoY,
        photoW,
        photoH
      );
    } else {
      // Empty / Default Placeholder Box (#fffbea background)
      ctx.fillStyle = "#fffbea";
      ctx.fillRect(photoX, photoY, photoW, photoH);

      // Camera Circle Icon
      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 35, 50, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(11, 104, 57, 0.1)";
      ctx.fill();

      // Camera Body
      ctx.fillStyle = "#0b6839";
      ctx.beginPath();
      ctx.roundRect(photoX + photoW / 2 - 30, photoY + photoH / 2 - 52, 60, 42, 8);
      ctx.fill();

      // Camera Lens
      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 31, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#fffbea";
      ctx.fill();

      // Text: "Click to Upload Photo"
      ctx.fillStyle = "#0b6839";
      ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Click to Upload Photo", photoX + photoW / 2, photoY + photoH / 2 + 45);
      ctx.textAlign = "left";
    }
    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.strokeStyle = "#0b6839";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Right Details Stack
    const detailsX = photoX + photoW + 35;
    const detailsMaxW = cardW - (photoW + 105);

    // NAME
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("NAME", detailsX, photoY + 40);

    ctx.fillStyle = "#000000";
    ctx.font = "900 48px 'Plus Jakarta Sans', sans-serif";
    const firstNameStr = formData.firstName || "";
    const lastNameStr = formData.lastName || "";
    const fullName = `${firstNameStr} ${lastNameStr}`.trim() || "BUILDER NAME";
    drawWrappedText(ctx, fullName, detailsX, photoY + 95, detailsMaxW, 52);

    // ROLE / STACK
    const roleY = photoY + 195;
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("ROLE / STACK", detailsX, roleY);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
    const displayRole = formData.primaryRole || "UI/UX & Product Design";
    drawWrappedText(ctx, displayRole, detailsX, roleY + 42, detailsMaxW, 38);

    // SKILL
    const skillY = photoY + 310;
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("SKILL", detailsX, skillY);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 30px 'Plus Jakarta Sans', sans-serif";
    const displaySkill = formData.secondarySkill || "Python / FastAPI";
    drawWrappedText(ctx, displaySkill, detailsX, skillY + 40, detailsMaxW, 36);

    // Divider Line
    const dividerY = photoY + photoH + 28;
    ctx.fillStyle = "rgba(11, 104, 57, 0.15)";
    ctx.fillRect(cardX + 35, dividerY, cardW - 70, 2);

    // Persona Title Section
    const titleSectionY = dividerY + 38;
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("BUILDER TITLE", cardX + 35, titleSectionY);

    const rawTitle = formData.builderTitle?.trim() || "Goa Beach Hacker";
    const cleanTitle = rawTitle.startsWith("•") ? rawTitle.replace(/^•\s*/, "") : rawTitle;

    ctx.fillStyle = "#ff0080";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText("•", cardX + 35, titleSectionY + 58);

    ctx.fillStyle = "#000000";
    ctx.font = "800 50px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(cleanTitle, cardX + 80, titleSectionY + 56);

    // Access Pass Box
    const badgeBoxX = cardX + 35;
    const badgeBoxY = titleSectionY + 105;
    const badgeBoxW = cardW - 70;
    const badgeBoxH = 165;

    ctx.beginPath();
    ctx.roundRect(badgeBoxX, badgeBoxY, badgeBoxW, badgeBoxH, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#0b6839";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("ACCESS LEVEL: ALL ACCESS • VIP BUILDER", badgeBoxX + 25, badgeBoxY + 55);

    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 19px monospace";
    ctx.fillText("VENUE: GOA, INDIA  •  DATE: AUG 2026", badgeBoxX + 25, badgeBoxY + 120);

    ctx.beginPath();
    ctx.roundRect(badgeBoxX + badgeBoxW - 265, badgeBoxY + 28, 240, 46, 23);
    ctx.fillStyle = "#0b6839";
    ctx.fill();

    ctx.fillStyle = "#fffbea";
    ctx.font = "bold 17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓ VERIFIED BUILDER", badgeBoxX + badgeBoxW - 145, badgeBoxY + 57);
    ctx.textAlign = "left";

    // Barcode
    const barcodeY = badgeBoxY + badgeBoxH + 22;
    ctx.fillStyle = "#000000";
    const barcodeXStart = cardX + 35;
    const barcodeWidth = cardW - 70;
    for (let b = 0; b < barcodeWidth; b += 12) {
      const lineWidth = (b % 3 === 0) ? 5 : (b % 2 === 0 ? 2 : 7);
      ctx.fillRect(barcodeXStart + b, barcodeY, lineWidth, 65);
    }

    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("HH26-GOA-BUILDER-ID-PASS", cardX + cardW / 2, barcodeY + 95);
    ctx.textAlign = "left";

    // Footer
    const footerH = 175;
    const footerY = cardY + cardH - footerH;

    ctx.fillStyle = "#ff0080";
    ctx.fillRect(cardX, footerY, cardW, footerH);

    ctx.fillStyle = "#f5dc18";
    ctx.fillRect(cardX, footerY, cardW, 4);

    ctx.fillStyle = "#fffbea";
    ctx.font = "900 54px 'Cinzel', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("BUILDER PASS", cardX + cardW / 2, footerY + 82);

    ctx.fillStyle = "#f5dc18";
    ctx.font = "bold 24px monospace";
    ctx.fillText(
      "GOA, INDIA • AUG 2026 • #FrameInGoa",
      cardX + cardW / 2,
      footerY + 134
    );

    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.strokeStyle = "#ff0080";
    ctx.lineWidth = 6;
    ctx.stroke();
  };

  // --- 2. COMPOSITE PRESENTATION CANVAS (1080 x 1350 POSTER CANVAS WITH FULL-COLOR MATRIX BACKDROP) ---
  const drawCompositeBuilderCard = (canvas, ctx) => {
    canvas.width = 1080;
    canvas.height = 1350;

    // ==========================================
    // LAYER 1: POSTER CANVAS BACKDROP (BASE LAYER)
    // ==========================================
    // 1.1 Main Background Color: Deep Tropical Green (#0b6839)
    ctx.fillStyle = "#0b6839";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1.2 Full-Page Poster Backdrop Pattern from image_48.png in FULL COLOR (Pink Rosettes & Neon Yellow Matrix Lines)
    const wmImg = watermarkObjRef.current;
    if (wmImg) {
      ctx.save();
      ctx.globalAlpha = 0.65; // High contrast full-color backdrop matrix pattern
      ctx.drawImage(wmImg, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // High-tech terminal code lines backdrop accents - HIGH VISIBILITY NEON YELLOW (65% OPACITY)
    ctx.save();
    ctx.fillStyle = "rgba(245, 220, 24, 0.65)";
    ctx.font = "bold 16px monospace";
    const codeSnippets = [
      ">> status: VERIFIED BUILDER • LOCATION: GOA, INDIA",
      "const builder = await HHGoa.verify({ pass: 'ALL_ACCESS' });",
      "OadBb1GSdb. NECEDOSSSs8AC  >> FrameInGoa (",
      "function connect_builder() { return new BuilderPass(); }",
      "0x4841434b455220484f55534520474f412032303236",
      "import { Solana, AgenticAI, ZeroKnowledge } from '@hhgoa/2026';",
    ];
    codeSnippets.forEach((line, index) => {
      ctx.fillText(line, 40, 70 + index * 200);
      ctx.fillText(line, 500, 160 + index * 210);
    });
    ctx.restore();

    // ==========================================
    // LAYER 2: CENTRAL ID PASS (FLOATING LAYER)
    // ==========================================
    // Positioned in the absolute center of 1080px x 1350px canvas with optimal margin
    const cardW = 580;
    const cardH = 880;
    const cardX = (canvas.width - cardW) / 2; // 250px (Absolute Center X)
    const cardY = (canvas.height - cardH) / 2; // 235px (Absolute Center Y)
    const cardR = 28;

    // Heavy 3D Drop Shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 50;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.fillStyle = "#fffbea";
    ctx.fill();
    ctx.restore();

    // Clip internal elements to rounded card shape
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.clip();

    // Off-White Card Body Background (#fffbea)
    ctx.fillStyle = "#fffbea";
    ctx.fillRect(cardX, cardY, cardW, cardH);

    // DISTINCTLY VISIBLE SECURITY WATERMARK PATTERN INSIDE CARD BODY (20% OPACITY)
    if (wmImg) {
      ctx.save();
      ctx.globalAlpha = 0.20;
      ctx.drawImage(wmImg, cardX, cardY + 135, cardW, cardH - 135 - 115);
      ctx.restore();
    }

    // Card Body Security Grid Line Accents
    ctx.save();
    ctx.strokeStyle = "rgba(11, 104, 57, 0.08)";
    ctx.lineWidth = 1.5;
    for (let x = cardX; x < cardX + cardW; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, cardY + 135);
      ctx.lineTo(x, cardY + cardH - 115);
      ctx.stroke();
    }
    for (let y = cardY + 135; y < cardY + cardH - 115; y += 45) {
      ctx.beginPath();
      ctx.moveTo(cardX, y);
      ctx.lineTo(cardX + cardW, y);
      ctx.stroke();
    }
    ctx.restore();

    // Header Bar (#ff0080)
    const headerH = 135;
    ctx.fillStyle = "#ff0080";
    ctx.fillRect(cardX, cardY, cardW, headerH);

    // Logo Badge
    const logoX = cardX + 24;
    const logoY = cardY + 18;
    const logoSize = 100;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 16);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.strokeStyle = "#f5dc18";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();

    const logoImg = logoObjRef.current;
    if (logoImg) {
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    }
    ctx.restore();

    // Header Text
    const headerTextX = logoX + logoSize + 20;
    ctx.fillStyle = "#fffbea";
    ctx.font = "bold 32px 'Cinzel', Georgia, serif";
    ctx.fillText("HACKER HOUSE", headerTextX, cardY + 60);

    ctx.fillStyle = "#fffbea";
    ctx.font = "800 38px 'Cinzel', Georgia, serif";
    ctx.fillText("GOA '26", headerTextX, cardY + 102);

    // Header Accent Line
    ctx.fillStyle = "#f5dc18";
    ctx.fillRect(cardX, cardY + headerH, cardW, 3);

    // Photo Box
    const photoX = cardX + 22;
    const photoY = cardY + headerH + 22;
    const photoW = 250;
    const photoH = 250;
    const photoR = 18;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.fillStyle = "#fffbea";
    ctx.fill();
    ctx.clip();

    const userImg = hasCustomPhoto ? imageObjRef.current : null;
    if (userImg) {
      const aspect = userImg.width / userImg.height;
      let sx, sy, sWidth, sHeight;

      if (aspect > 1) {
        sHeight = userImg.height;
        sWidth = userImg.height;
        sx = (userImg.width - userImg.height) / 2;
        sy = 0;
      } else {
        sWidth = userImg.width;
        sHeight = userImg.width;
        sx = 0;
        sy = (userImg.height - userImg.width) * 0.2;
      }

      const cropW = sWidth / zoom;
      const cropH = sHeight / zoom;

      const cropX = sx + (sWidth - cropW) / 2 + offsetX;
      const cropY = sy + (sHeight - cropH) / 2 + offsetY;

      const clampedX = Math.max(0, Math.min(userImg.width - cropW, cropX));
      const clampedY = Math.max(0, Math.min(userImg.height - cropH, cropY));

      ctx.drawImage(
        userImg,
        clampedX,
        clampedY,
        cropW,
        cropH,
        photoX,
        photoY,
        photoW,
        photoH
      );
    } else {
      // Empty / Default Placeholder Box (#fffbea background)
      ctx.fillStyle = "#fffbea";
      ctx.fillRect(photoX, photoY, photoW, photoH);

      // Camera Circle Icon
      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 20, 28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(11, 104, 57, 0.12)";
      ctx.fill();

      // Camera Body
      ctx.fillStyle = "#0b6839";
      ctx.beginPath();
      ctx.roundRect(photoX + photoW / 2 - 18, photoY + photoH / 2 - 30, 36, 26, 6);
      ctx.fill();

      // Camera Lens
      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 17, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#fffbea";
      ctx.fill();

      // Text: "Click to Upload Photo"
      ctx.fillStyle = "#0b6839";
      ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Click to Upload Photo", photoX + photoW / 2, photoY + photoH / 2 + 28);
      ctx.textAlign = "left";
    }
    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.strokeStyle = "#0b6839";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Right Details Stack
    const detailsX = photoX + photoW + 20;
    const detailsMaxW = cardW - (photoW + 64);

    // NAME
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText("NAME", detailsX, photoY + 24);

    ctx.fillStyle = "#000000";
    ctx.font = "900 32px 'Plus Jakarta Sans', sans-serif";
    const firstNameStr = formData.firstName || "";
    const lastNameStr = formData.lastName || "";
    const fullName = `${firstNameStr} ${lastNameStr}`.trim() || "BUILDER NAME";
    drawWrappedText(ctx, fullName, detailsX, photoY + 58, detailsMaxW, 36);

    // ROLE / STACK
    const roleY = photoY + 116;
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText("ROLE / STACK", detailsX, roleY);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
    const displayRole = formData.primaryRole || "UI/UX & Product Design";
    drawWrappedText(ctx, displayRole, detailsX, roleY + 26, detailsMaxW, 26);

    // SKILL
    const skillY = photoY + 192;
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText("SKILL", detailsX, skillY);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 21px 'Plus Jakarta Sans', sans-serif";
    const displaySkill = formData.secondarySkill || "Python / FastAPI";
    drawWrappedText(ctx, displaySkill, detailsX, skillY + 25, detailsMaxW, 25);

    // Divider Line
    const dividerY = photoY + photoH + 18;
    ctx.fillStyle = "rgba(11, 104, 57, 0.15)";
    ctx.fillRect(cardX + 22, dividerY, cardW - 44, 2);

    // Persona Title Section
    const titleSectionY = dividerY + 24;
    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText("BUILDER TITLE", cardX + 22, titleSectionY);

    const rawTitle = formData.builderTitle?.trim() || "Goa Beach Hacker";
    const cleanTitle = rawTitle.startsWith("•") ? rawTitle.replace(/^•\s*/, "") : rawTitle;

    ctx.fillStyle = "#ff0080";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("•", cardX + 22, titleSectionY + 40);

    ctx.fillStyle = "#000000";
    ctx.font = "800 34px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(cleanTitle, cardX + 52, titleSectionY + 38);

    // Access Level Badge Box
    const badgeBoxX = cardX + 22;
    const badgeBoxY = titleSectionY + 68;
    const badgeBoxW = cardW - 44;
    const badgeBoxH = 115;

    ctx.beginPath();
    ctx.roundRect(badgeBoxX, badgeBoxY, badgeBoxW, badgeBoxH, 14);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#0b6839";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ACCESS LEVEL: ALL ACCESS • VIP BUILDER", badgeBoxX + 16, badgeBoxY + 38);

    ctx.fillStyle = "#0b6839";
    ctx.font = "bold 12px monospace";
    ctx.fillText("VENUE: GOA, INDIA  •  DATE: AUG 2026", badgeBoxX + 16, badgeBoxY + 84);

    ctx.beginPath();
    ctx.roundRect(badgeBoxX + badgeBoxW - 170, badgeBoxY + 20, 155, 32, 16);
    ctx.fillStyle = "#0b6839";
    ctx.fill();

    ctx.fillStyle = "#fffbea";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓ VERIFIED BUILDER", badgeBoxX + badgeBoxW - 92.5, badgeBoxY + 41);
    ctx.textAlign = "left";

    // Barcode
    const barcodeY = badgeBoxY + badgeBoxH + 15;
    ctx.fillStyle = "#000000";
    const barcodeXStart = cardX + 22;
    const barcodeWidth = cardW - 44;
    for (let b = 0; b < barcodeWidth; b += 8) {
      const lineWidth = (b % 3 === 0) ? 4 : (b % 2 === 0 ? 1.5 : 5);
      ctx.fillRect(barcodeXStart + b, barcodeY, lineWidth, 45);
    }

    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("HH26-GOA-BUILDER-ID-PASS", cardX + cardW / 2, barcodeY + 68);
    ctx.textAlign = "left";

    // Footer Bar
    const footerH = 115;
    const footerY = cardY + cardH - footerH;

    ctx.fillStyle = "#ff0080";
    ctx.fillRect(cardX, footerY, cardW, footerH);

    ctx.fillStyle = "#f5dc18";
    ctx.fillRect(cardX, footerY, cardW, 3);

    ctx.fillStyle = "#fffbea";
    ctx.font = "900 38px 'Cinzel', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("BUILDER PASS", cardX + cardW / 2, footerY + 54);

    ctx.fillStyle = "#f5dc18";
    ctx.font = "bold 16px monospace";
    ctx.fillText(
      "GOA, INDIA • AUG 2026 • #FrameInGoa",
      cardX + cardW / 2,
      footerY + 90
    );

    // Coconut Surfer Mascot Layer (Z-Index: 30 - Overlapping Left Border & Footer Banner)
    if (mascotImg && mascotImg.complete && mascotImg.naturalWidth > 0) {
      ctx.save();
      const mascotH = 180;
      const mascotAspect = mascotImg.naturalWidth / mascotImg.naturalHeight;
      const mascotW = mascotH * mascotAspect;
      const mascotX = cardX + 7;
      const mascotY = cardY + cardH - 300;
      ctx.drawImage(mascotImg, mascotX, mascotY, mascotW, mascotH);
      ctx.restore();
    }
    ctx.restore();

    // Card Outer Border
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.strokeStyle = "#f5dc18";
    ctx.lineWidth = 4;
    ctx.stroke();

    // ==========================================
    // LAYER 3: BRANDING & STAMPS (TOP LAYER)
    // ==========================================
    // Rendered via absolute DOM img tags in #poster-canvas-wrapper (top-3 left-3 & top-3 right-3)
    // to guarantee single sticker authority and zero duplicate overlays.

    // ==========================================
    // LAYER 4: AUTHORITATIVE FOOTER (OVERLAY LAYER)
    // ==========================================
    // Giant #FrameInGoa hashtag watermark in bottom-right corner
    ctx.save();
    ctx.fillStyle = "#f5dc18";
    ctx.font = "900 36px monospace";
    ctx.textAlign = "right";
    ctx.fillText("#FrameInGoa", canvas.width - 50, canvas.height - 35);
    ctx.textAlign = "left";
    ctx.restore();
  };

  // --- TRIGGER 1: STANDALONE CARD DOWNLOAD (HHGoa_2026_ID_Card.png) ---
  const handleDownloadCard = async () => {
    const cardElement = document.getElementById('builder-id-card');
    if (!cardElement) {
      console.error("Card element '#builder-id-card' not found.");
      return;
    }

    try {
      if (cardElement.tagName === "CANVAS") {
        const ctx = cardElement.getContext("2d");
        if (ctx) {
          drawRawBuilderCard(cardElement, ctx);
        }
        const dataUrl = cardElement.toDataURL("image/png", 1.0);
        const link = document.createElement('a');
        link.download = 'HHGoa_2026_ID_Card.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Preload images inside the card to prevent transparent snapshots
      const images = cardElement.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Export card with forced white/pink background, excluding surfer mascot
      const dataUrl = await toPng(cardElement, {
        quality: 0.95,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#ffffff', // Ensures non-transparent card canvas
        filter: (node) => node.id !== 'surfer-mascot' && (!node.classList || !node.classList.contains('surfer-mascot')),
        ignoreElements: (element) => element.id === 'surfer-mascot' || (element.classList && element.classList.contains('surfer-mascot')),
        onclone: (clonedDoc) => {
          const mascot = clonedDoc.getElementById('surfer-mascot');
          if (mascot) mascot.style.display = 'none';
          const mascotsByClass = clonedDoc.getElementsByClassName('surfer-mascot');
          Array.from(mascotsByClass).forEach((m) => {
            m.style.display = 'none';
          });
        },
        style: {
          transform: 'none',
          margin: '0 auto',
          borderRadius: '16px', // Preserves ID card rounded corners
        },
      });

      // Trigger PNG download
      const link = document.createElement('a');
      link.download = 'HHGoa_2026_ID_Card.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error downloading card:', err);
      alert('Could not download card. Please try again.');
    }
  };

  const handleDownloadCardOnly = handleDownloadCard;
  const handleDownloadPNG = handleDownloadCard;

  // --- TRIGGER 2: FULL POSTER DOWNLOAD & OPEN X COMPOSER (#FrameInGoa) ---
  const handleShareToX = async () => {
    const node = document.getElementById('poster-canvas-wrapper');
    const shareText = encodeURIComponent(
      "Just claimed my Builder Pass for Hacker House Goa '26! 🚀🌴\n\nSee you guys in Goa! #FrameInGoa #HackerHouseGoa"
    );
    const xIntentUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

    if (!node) {
      console.error("Poster element '#poster-canvas-wrapper' not found in DOM.");
      window.open(xIntentUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      // 1. Preload image assets inside poster container, resolving gracefully on load or error
      const images = node.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );

      // 2. Generate PNG Data URL with html2canvas (null-safe & locked to unscaled 420x560 layout)
      const canvas = await html2canvas(node, {
        width: 420,
        height: 560,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0b6839',
        onclone: (clonedDoc) => {
          if (!clonedDoc) return;
          const clonedPoster = clonedDoc.getElementById('poster-canvas-wrapper');
          if (clonedPoster) {
            clonedPoster.style.width = '420px';
            clonedPoster.style.height = '560px';
            clonedPoster.style.transform = 'none';
            if (clonedPoster.parentElement) {
              clonedPoster.parentElement.style.transform = 'none';
            }
          }
        }
      });

      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        // 3. Trigger File Download BEFORE opening Twitter/X intent window
        const link = document.createElement('a');
        link.setAttribute('download', 'HHGoa_2026_Share_Poster.png');
        link.setAttribute('href', dataUrl);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Poster export capture notice:', err);
    }

    // 4. Launch Twitter / X Share Intent in a new tab AFTER download trigger
    try {
      window.open(xIntentUrl, '_blank', 'noopener,noreferrer');
    } catch (winErr) {
      console.error('Failed to open Twitter/X share intent window:', winErr);
    }
  };

  const rawTitleStr = formData.builderTitle?.trim() || "Goa Beach Hacker";
  const cleanTitleStr = rawTitleStr.startsWith("•") ? rawTitleStr.replace(/^•\s*/, "") : rawTitleStr;

  return (
    <div className="h-[100dvh] max-h-screen bg-[#0b6839] text-[#fffbea] flex flex-col font-sans relative overflow-hidden">
      
      {/* Toast Notification Banner */}
      {toastState.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#000000] text-[#fffbea] border-2 border-[#f5dc18] px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-2xl transition-all duration-300 animate-bounce max-w-[90vw]">
          <CheckCircle2 className="w-5 h-5 text-[#f5dc18] shrink-0" />
          <span className="text-xs sm:text-base font-extrabold text-left">{toastState.message}</span>
        </div>
      )}

      {/* Hidden File & Camera Input Elements */}
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

      {/* 1. Header Bar (Top Navigation - Clean with No Redundant Buttons) */}
      <header className="w-full bg-[#ff0080] border-b-2 border-[#f5dc18] px-4 sm:px-8 py-3 flex items-center justify-between z-10 shadow-md shrink-0 h-16">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/hh-goa-logo.png"
            alt="HH Goa Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-xl border border-[#f5dc18]"
          />
          <span className="font-cinzel text-base sm:text-lg md:text-xl font-bold text-[#fffbea] tracking-wider">
            HACKER HOUSE GOA '26
          </span>
        </div>

        {onBackToUpload && (
          <button
            type="button"
            onClick={onBackToUpload}
            className="min-h-[40px] inline-flex items-center gap-1.5 sm:gap-2 bg-[#0b6839] hover:bg-[#071c11] text-[#fffbea] hover:text-[#f5dc18] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold border border-[#f5dc18] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#f5dc18]" /> <span className="hidden sm:inline">Re-upload</span> Photo
          </button>
        )}
      </header>

      {/* 2. Main Body Split-Screen Container */}
      <main className="grid grid-cols-1 lg:grid-cols-2 flex-1 h-[calc(100dvh-64px)] overflow-hidden">
        
        {/* Left Half: Summary Panel with Clean Solid Off-White Background (#fffbea) */}
        <div className="w-full lg:col-span-1 bg-[#fffbea] text-[#000000] p-4 sm:p-6 lg:p-8 flex flex-col justify-between border-r border-[#0b6839]/10 text-left relative z-0 overflow-y-auto max-h-full h-full">
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#ff0080] uppercase mb-1">
              STEP 3 OF 3 • CARD PREVIEW
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-black text-[#0b6839] mb-4 sm:mb-6">
              Your Builder Pass
            </h2>

            {/* Builder Photo Avatar Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-white/70 rounded-2xl border border-[#0b6839]/15 shadow-sm mb-4 sm:mb-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#101010] border-2 border-[#0b6839] overflow-hidden shrink-0 cursor-pointer relative group shadow-inner"
                title="Click to upload or change profile photo"
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Builder Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0b6839]/10">
                    <Camera className="w-6 h-6 text-[#0b6839]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Upload className="w-5 h-5 text-[#f5dc18]" />
                </div>
              </div>
              <div className="flex flex-col justify-center text-left">
                <div className="text-[10px] sm:text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-0.5">
                  BUILDER PHOTO
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#ff0080] hover:text-[#0b6839] cursor-pointer underline"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{hasCustomPhoto ? "Change Photo" : "Upload Photo"}</span>
                </button>
              </div>
            </div>

            {/* Summary List with Expanded Typography & Spacing */}
            <div className="space-y-3.5 md:space-y-4">
              <div>
                <div className="text-[10px] sm:text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-0.5">
                  NAME
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-black text-[#000000]">
                  {`${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "BUILDER NAME"}
                </div>
              </div>

              <div>
                <div className="text-[10px] sm:text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-0.5">
                  ROLE / STACK
                </div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a1a]">
                  {formData.primaryRole || "Full-Stack Developer"}
                </div>
              </div>

              <div>
                <div className="text-[10px] sm:text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-0.5">
                  SKILL
                </div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a1a]">
                  {formData.secondarySkill || "React / Next.js"}
                </div>
              </div>

              <div>
                <div className="text-[10px] sm:text-xs font-extrabold text-[#0b6839] uppercase tracking-wider mb-0.5">
                  BUILDER TITLE
                </div>
                <div className="text-base sm:text-lg md:text-xl font-black text-[#ff0080] flex items-center gap-2">
                  <span className="text-[#ff0080] text-xl">•</span> {cleanTitleStr}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons: Re-upload Photo + Edit Details */}
          <div className="pt-4 sm:pt-6 flex flex-wrap items-center gap-3 relative z-10">
            <button
              type="button"
              onClick={onBackToUpload || (() => fileInputRef.current?.click())}
              className="min-h-[42px] inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#fffbea] bg-[#0b6839] hover:bg-[#071c11] hover:text-[#f5dc18] py-2 px-4 rounded-xl border border-[#f5dc18] transition cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4 text-[#f5dc18]" />
              <span>Re-upload Photo</span>
            </button>

            {onBackToForm && (
              <button
                type="button"
                onClick={onBackToForm}
                className="min-h-[42px] inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0b6839] hover:text-[#ff0080] py-2 px-4 rounded-xl border border-[#0b6839]/30 hover:border-[#ff0080] bg-white/60 hover:bg-white transition cursor-pointer shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-[#0b6839]" />
                <span>Edit Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Half: Upload & Scaled Preview Zone with Dark Green Background (#0b6839) */}
        <div className="w-full lg:col-span-1 bg-[#0b6839] p-4 sm:p-5 flex flex-col items-center justify-between overflow-hidden h-full">
          
          {/* Hidden Canvas specifically for Standalone Builder Pass Export (#builder-id-card) */}
          <canvas
            id="builder-id-card"
            ref={rawCardCanvasRef}
            className="hidden"
          />

          {/* Responsive CSS Scale Wrapper for Mobile Viewports */}
          <div className="w-full flex justify-center items-center py-2 overflow-hidden flex-1 relative my-auto">
            <div className="origin-center scale-[0.75] xs:scale-[0.85] sm:scale-100 transition-transform duration-200 shrink-0">
              {/* 1. POSTER CANVAS WRAPPER - EXCLUSIVELY WRAPPED IN id="poster-canvas-wrapper" */}
              <div
                id="poster-canvas-wrapper"
                className="w-[420px] h-[560px] mx-auto overflow-hidden rounded-2xl relative shadow-2xl bg-[#0b6839] flex flex-col items-center justify-center p-0 shrink-0"
                style={{ width: '420px', height: '560px' }}
              >
              {/* Top-Left Ticket Sticker */}
              <img
                src="/image_351993.png"
                alt="HH GOA '26 Builder Pass Sticker"
                crossOrigin="anonymous"
                className="absolute top-5 left-3 w-20 sm:w-28 h-auto object-contain z-20 pointer-events-none drop-shadow-md"
                style={{ transform: "rotate(-8deg)", zIndex: 20 }}
              />

              {/* Top-Right Seal Sticker */}
              <img
                src="/image_351997.png"
                alt="Verified Aug 2026 Stamp Sticker"
                crossOrigin="anonymous"
                className="absolute w-16 sm:w-24 h-auto object-contain z-20 pointer-events-none drop-shadow-md"
                style={{ top: "16px", right: "40px", transform: "rotate(8deg)", zIndex: 20 }}
              />

              {/* Bottom-Left Surfer Mascot Sticker */}
              <img
                id="surfer-mascot"
                src="/mascot-removebg-preview.png"
                alt="Surfer Mascot Sticker"
                crossOrigin="anonymous"
                className="surfer-mascot absolute bottom-[80px] left-[14px] h-28 sm:h-32 w-auto object-contain z-[30] pointer-events-none drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                style={{ zIndex: 30, bottom: "80px", left: "14px" }}
              />

              {/* Poster Bottom-Right Footer */}
              <div className="absolute bottom-3 right-4 text-right z-10 pointer-events-none">
                <p className="font-extrabold text-sm sm:text-base text-yellow-400 tracking-wide drop-shadow">
                  #FrameInGoa
                </p>
              </div>

              {/* STATE 1: BEFORE PHOTO UPLOAD */}
              {!imageSrc && (
                <div className="flex flex-col items-center justify-center text-center max-w-lg p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-serif text-[#fffbea] text-center max-w-lg mb-4 leading-snug">
                    Take or upload a photo of yourself for your new HH Goa '26 Builder Pass.
                  </h3>

                  {/* Two Large Square Action Buttons */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
                    {/* Camera Box */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f5dc18] hover:bg-[#ff0080] hover:text-[#fffbea] rounded-2xl flex flex-col items-center justify-center text-[#000000] cursor-pointer shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
                    >
                      <Camera className="w-7 h-7 mb-1 transition-transform group-hover:scale-110" />
                      <span className="text-xs sm:text-sm font-black">Camera</span>
                    </button>

                    {/* Upload Box */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f5dc18] hover:bg-[#ff0080] hover:text-[#fffbea] rounded-2xl flex flex-col items-center justify-center text-[#000000] cursor-pointer shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
                    >
                      <Upload className="w-7 h-7 mb-1 transition-transform group-hover:scale-110" />
                      <span className="text-xs sm:text-sm font-black">Upload</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#fffbea]/70 font-mono">
                    Supports JPG, PNG, and iPhone HEIC (Auto-centered & cropped)
                  </p>

                  {loading && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#f5dc18] animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing image (HEIC converting)...
                    </div>
                  )}

                  {errorMsg && (
                    <div className="mt-4 p-3 bg-[#ff0080]/20 border border-[#ff0080] rounded-xl text-xs font-semibold text-[#fffbea] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#ff0080] shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STATE 2: AFTER PHOTO UPLOAD */}
              {imageSrc && (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  {/* Presentation Canvas Frame */}
                  <div
                    id="builder-id-card-frame"
                    className="w-full h-full relative group transition-all duration-200"
                  >
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-contain block rounded-2xl"
                    />

                    {/* Direct Interactive Photo Frame Overlay on Card */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      title={hasCustomPhoto ? "Click to change photo" : "Click to upload photo"}
                      className={`absolute rounded-[18px] transition-all duration-200 flex flex-col items-center justify-center cursor-pointer select-none ${
                        hasCustomPhoto
                          ? "bg-black/0 hover:bg-black/55 opacity-0 hover:opacity-100 text-[#fffbea]"
                          : "bg-[#fffbea]/90 hover:bg-[#fffbea] border-2 border-dashed border-[#0b6839] text-[#0b6839] shadow-inner hover:scale-[1.01]"
                      }`}
                      style={{
                        left: "25.2%",
                        top: "27.8%",
                        width: "20.4%",
                        height: "16.3%",
                      }}
                    >
                      {hasCustomPhoto ? (
                        <div className="flex flex-col items-center gap-1 p-1 text-center">
                          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5dc18] drop-shadow-md" />
                          <span className="text-[9px] sm:text-[10px] font-black tracking-wide text-[#fffbea] uppercase drop-shadow">
                            Change Photo
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 p-1.5 text-center">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0b6839]/10 flex items-center justify-center mb-0.5">
                            <Upload className="w-3.5 h-3.5 text-[#0b6839]" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-[#0b6839] leading-tight">
                            Upload Photo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* 2. UI BUTTONS & CONTROLS CONTAINER */}
          {imageSrc && (
            <div className="w-full max-w-[380px] mx-auto flex flex-col gap-2 mt-2 px-2 z-10 shrink-0">
              {/* Download Button: Triggers Standalone Builder Pass Export (#builder-id-card) */}
              <button
                type="button"
                onClick={handleDownloadCardOnly}
                className="w-full min-h-[42px] py-2.5 bg-[#f5dc18] hover:bg-[#e5ce14] active:scale-[0.99] text-[#000000] font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#000000]" />
                <span>Download Card (PNG)</span>
              </button>

              {/* Share to X Button: Triggers Full Poster Export (#poster-canvas-wrapper) & Opens X Intent */}
              <button
                type="button"
                onClick={handleShareToX}
                className="w-full min-h-[42px] py-2.5 bg-[#000000] hover:bg-neutral-900 active:scale-[0.99] text-[#fffbea] hover:text-[#f5dc18] border-2 border-[#f5dc18] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#f5dc18]" />
                <span>Share to X (#FrameInGoa)</span>
              </button>

              {/* Secondary Action Options: Re-upload & Adjust Photo Controls */}
              <div className="flex items-center justify-between text-xs pt-0.5 px-1">
                <button
                  type="button"
                  onClick={onBackToUpload || (() => fileInputRef.current?.click())}
                  className="text-[#f5dc18] hover:underline font-bold cursor-pointer inline-flex items-center gap-1 py-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-upload Photo
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdjustControls(!showAdjustControls)}
                  className="text-[#fffbea] hover:text-[#f5dc18] font-bold cursor-pointer inline-flex items-center gap-1.5 py-1"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#ff0080]" />
                  <span>{showAdjustControls ? "Hide Controls" : "Adjust Photo Fit"}</span>
                </button>
              </div>

              {/* Expandable Photo Position & Zoom Adjustment Sliders Panel */}
              {showAdjustControls && (
                <div className="bg-[#000000]/90 p-3.5 rounded-2xl border border-[#f5dc18]/40 space-y-2.5 mt-1 text-left max-h-[40vh] overflow-y-auto">
                  <div className="flex justify-between items-center text-xs font-bold text-[#f5dc18]">
                    <span>Manual Crop Adjustments</span>
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setOffsetX(0);
                        setOffsetY(0);
                      }}
                      className="text-[#fffbea] hover:text-[#f5dc18] text-xs font-bold underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Zoom Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-[#fffbea] font-semibold mb-1">
                      <span>Zoom Scale</span>
                      <span className="text-[#f5dc18] font-mono">{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#f5dc18] cursor-pointer min-h-[36px]"
                    />
                  </div>

                  {/* Horizontal Offset Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-[#fffbea] font-semibold mb-1">
                      <span>Horizontal Position</span>
                      <span className="text-[#f5dc18] font-mono">{offsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={offsetX}
                      onChange={(e) => setOffsetX(parseInt(e.target.value))}
                      className="w-full accent-[#f5dc18] cursor-pointer min-h-[36px]"
                    />
                  </div>

                  {/* Vertical Offset Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-[#fffbea] font-semibold mb-1">
                      <span>Vertical Position</span>
                      <span className="text-[#f5dc18] font-mono">{offsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={offsetY}
                      onChange={(e) => setOffsetY(parseInt(e.target.value))}
                      className="w-full accent-[#f5dc18] cursor-pointer min-h-[36px]"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </main>
    </div>
  );
}
