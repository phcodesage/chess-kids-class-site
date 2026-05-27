"use client";

import { useState, useEffect } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  cashPrice: string;
  cardPrice: string;
  stripeLink?: string;
  cardLink?: string;
}

export function calcCardPrice(priceStr: string): string {
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return priceStr;
  return "$" + (num * 1.04).toFixed(2);
}

export default function PaymentModal({
  isOpen,
  onClose,
  courseName,
  cashPrice,
  cardPrice,
  stripeLink,
  cardLink,
}: PaymentModalProps) {
  const [step, setStep] = useState<"choose" | "zelle" | "done">("choose");
  const [form, setForm] = useState({ name: "", email: "", phone: "", reference: "" });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Lock body scroll when modal is open (works on iOS Safari too)
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    setStep("choose");
    setForm({ name: "", email: "", phone: "", reference: "" });
    setScreenshot(null);
    setScreenshotPreview(null);
    setLoading(false);
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setScreenshot(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null);
    }
  }

  const activeLink = cardLink || stripeLink || '';
  const isStripeLink = activeLink.includes('stripe.com');
  const cardProviderLabel = isStripeLink ? 'Pay by Card (Stripe)' : 'Pay by Card (Valor Pay)';

  function handleCardPay() {
    const link = cardLink || stripeLink;
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
    handleClose();
  }

  async function handleZelleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Prepare payment data
    const paymentData = {
      id: crypto.randomUUID(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      reference: form.reference,
      courseName: courseName,
      amount: parseFloat(cashPrice.replace(/[^0-9.]/g, "")) || 0,
      screenshotData: screenshotPreview,
      screenshotName: screenshot?.name,
      screenshotType: screenshot?.type,
      status: "pending" as const,
      submittedAt: new Date().toISOString(),
      notes: "",
    };
    
    try {
      // Save to MongoDB via API
      const response = await fetch("/api/zelle-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        console.error("Failed to save payment to database");
      }
      
      // Also save to localStorage as backup
      const existingPayments = JSON.parse(localStorage.getItem("zellePayments") || "[]");
      existingPayments.push(paymentData);
      localStorage.setItem("zellePayments", JSON.stringify(existingPayments));
    } catch (error) {
      console.error("Error saving payment:", error);
      // Fallback to localStorage only
      const existingPayments = JSON.parse(localStorage.getItem("zellePayments") || "[]");
      existingPayments.push(paymentData);
      localStorage.setItem("zellePayments", JSON.stringify(existingPayments));
    }
    
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("done");
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brandNavy/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-[18px] shadow-2xl w-full overflow-hidden flex flex-col max-h-[95vh] border border-brandBorder transition-all duration-300 ${
          step === "zelle" ? "max-w-[460px] md:max-w-[850px]" : "max-w-[460px] md:max-w-[500px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brandNavy px-6 py-5 flex items-center justify-between">
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
              Payment Options
            </p>
            <h2 className="font-heading text-lg font-bold text-white mt-1">
              {courseName}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* Price Note Banner */}
        <div className="bg-brandRose/30 border-b border-brandBorder px-6 py-3">
          <div className="flex items-center gap-2 mb-1 text-[13px] font-semibold text-brandNavy flex-wrap">
            <span>💵 Cash (Zelle):</span>
            <span className="text-green-700 font-bold">{cashPrice}</span>
            <span className="text-brandMuted font-normal">— no extra fee</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-brandNavy flex-wrap">
            <span>💳 Card:</span>
            <span className="text-brandRed font-bold">{cardPrice}</span>
            <span className="text-brandMuted font-normal">— includes 4% processing fee</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* CHOOSE STEP */}
          {step === "choose" && (
            <div>
              <p className="text-brandMuted text-sm mb-4">
                Choose your preferred payment method:
              </p>

              {/* Zelle Option */}
              <button
                onClick={() => setStep("zelle")}
                className="w-full flex items-start gap-4 p-4 rounded-[14px] border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-colors cursor-pointer mb-3 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0 text-xl mt-0.5">
                  💵
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brandNavy text-[15px]">
                    Pay with Cash (Zelle)
                  </p>
                  <p className="text-brandMuted text-[13px] break-words">
                    Send <span className="text-green-700 font-semibold">{cashPrice}</span> to{" "}
                    <span className="text-green-700 font-medium">payments@exceedlearningcenterny.com</span>
                  </p>
                </div>
              </button>

              {/* Card Option */}
              <button
                onClick={handleCardPay}
                className="w-full flex items-start gap-4 p-4 rounded-[14px] border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-brandNavy flex items-center justify-center flex-shrink-0 text-xl mt-0.5">
                  💳
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brandNavy text-[15px]">
                    {cardProviderLabel}
                  </p>
                  <p className="text-brandMuted text-[13px] break-words">
                    <span className="text-brandRed font-semibold">{cardPrice}</span>{" "}
                    <span className="text-brandMuted/70">(includes 4% processing fee)</span>
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* ZELLE FORM STEP */}
          {step === "zelle" && (
            <form onSubmit={handleZelleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Instructions and Screenshot */}
                <div className="flex flex-col gap-4 justify-between">
                  <div className="bg-green-50 border border-green-200 rounded-[14px] p-4 text-[13px] text-green-800">
                    <p className="font-bold mb-2">How to pay via Zelle:</p>
                    <ol className="list-decimal pl-5 space-y-1 leading-relaxed">
                      <li>Open your bank app and go to Zelle</li>
                      <li className="break-words">Send <strong>{cashPrice}</strong> to <strong>payments@exceedlearningcenterny.com</strong></li>
                      <li>Take a screenshot of your confirmation</li>
                      <li>Fill in form and upload screenshot to confirm</li>
                    </ol>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-end">
                    <label className="block font-display text-[11px] font-bold uppercase tracking-[0.1em] text-brandNavy mb-1.5">
                      Payment Screenshot <span className="normal-case font-normal text-brandMuted">(optional but recommended)</span>
                    </label>
                    <label
                      className={`flex-grow flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors px-4 py-5 text-center min-h-[140px] ${
                        screenshot
                          ? "border-green-400 bg-green-50"
                          : "border-brandBorder bg-brandSand/30 hover:border-brandNavy/40 hover:bg-brandSand/60"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                      {screenshotPreview ? (
                        <div className="w-full space-y-2">
                          {screenshot?.type.startsWith("image/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={screenshotPreview}
                              alt="Payment confirmation preview"
                              className="mx-auto max-h-32 rounded-lg object-contain border border-green-200"
                            />
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-green-700">
                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-semibold text-sm">{screenshot?.name}</span>
                            </div>
                          )}
                          <p className="text-[12px] text-green-700 font-semibold">✓ Proof attached — tap to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <svg className="mx-auto h-8 w-8 text-brandMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-[13px] font-semibold text-brandNavy">Tap to upload screenshot</p>
                          <p className="text-[11px] text-brandMuted">JPG, PNG, or PDF — max 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Right Column: Inputs and Buttons */}
                <div className="flex flex-col justify-between">
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block font-display text-[11px] font-bold uppercase tracking-[0.1em] text-brandNavy mb-1">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl border border-brandBorder bg-brandSand/30 text-sm text-brandNavy outline-none focus:border-brandNavy/50 focus:ring-1 focus:ring-brandNavy/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display text-[11px] font-bold uppercase tracking-[0.1em] text-brandNavy mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="email@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-brandBorder bg-brandSand/30 text-sm text-brandNavy outline-none focus:border-brandNavy/50 focus:ring-1 focus:ring-brandNavy/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display text-[11px] font-bold uppercase tracking-[0.1em] text-brandNavy mb-1">
                        Phone Number *
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="(555) 000-0000"
                        className="w-full px-4 py-2.5 rounded-xl border border-brandBorder bg-brandSand/30 text-sm text-brandNavy outline-none focus:border-brandNavy/50 focus:ring-1 focus:ring-brandNavy/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display text-[11px] font-bold uppercase tracking-[0.1em] text-brandNavy mb-1">
                        Zelle Reference / Confirmation Number *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.reference}
                        onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                        placeholder="e.g. ZL123456789"
                        className="w-full px-4 py-2.5 rounded-xl border border-brandBorder bg-brandSand/30 text-sm text-brandNavy outline-none focus:border-brandNavy/50 focus:ring-1 focus:ring-brandNavy/20"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("choose")}
                      className="flex-1 py-3 rounded-xl border border-brandBorder bg-white font-semibold text-brandMuted hover:bg-brandSand transition-colors text-sm"
                    >
                      Back
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Submitting..." : "✓ Confirm Zelle Payment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* DONE STEP */}
          {step === "done" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">
                🎉
              </div>
              <h3 className="font-heading text-xl font-bold text-brandNavy mb-2">
                Zelle Payment Confirmed!
              </h3>
              <p className="text-brandMuted text-sm mb-6 leading-relaxed">
                Thank you, <strong>{form.name}</strong>! We have received your Zelle confirmation. Our team will verify your payment and send you enrollment details shortly.
              </p>
              <button
                onClick={handleClose}
                className="px-7 py-3 rounded-xl bg-brandNavy text-white font-bold text-sm hover:bg-brandNavy/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
