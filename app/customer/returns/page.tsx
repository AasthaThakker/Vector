"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, QrCode, CheckCircle, XCircle, AlertCircle, Brain } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function ReturnsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const productsParam = searchParams.get("products");

  const { data: returnsData, mutate } = useSWR("/api/returns", fetcher);
  const returns = returnsData?.returns || [];

  const [showForm, setShowForm] = useState(!!orderId);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [returnMethod, setReturnMethod] = useState("pickup");
  const [dropboxLocation, setDropboxLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [aiValidation, setAiValidation] = useState<{
    match: boolean;
    confidence: number;
    reason: string;
    canSubmit: boolean;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  let products: { productId: string; name: string; category: string }[] = [];
  try {
    if (productsParam) products = JSON.parse(decodeURIComponent(productsParam));
  } catch {
    // ignore
  }

  const handleFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, []);

  // AI validation function
  const validateWithAI = async () => {
    if (!imagePreview || !description.trim()) {
      setAiValidation(null);
      return;
    }

    setValidating(true);
    try {
      const response = await fetch("/api/ai/validate-immediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imagePreview,
          description: description.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiValidation({
          match: data.validation.match,
          confidence: data.validation.confidence,
          reason: data.validation.reason,
          canSubmit: data.canSubmit
        });
      } else {
        setAiValidation({
          match: false,
          confidence: 0,
          reason: data.error || "Validation failed",
          canSubmit: false
        });
      }
    } catch (error) {
      setAiValidation({
        match: false,
        confidence: 0,
        reason: "AI service unavailable",
        canSubmit: false
      });
    }
    setValidating(false);
  };

  // Trigger AI validation when image or description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imagePreview && description.trim()) {
        validateWithAI();
      } else {
        setAiValidation(null);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [imagePreview, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !selectedProduct || !reason) {
      toast.error("Please fill all required fields");
      return;
    }

    // Check AI validation if image and description are provided
    if (imagePreview && description.trim() && aiValidation && !aiValidation.canSubmit) {
      toast.error("AI validation indicates low confidence. Please provide more accurate description or clearer image.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl || "";
      }

      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId: selectedProduct,
          reason,
          description,
          imageUrl,
          returnMethod,
          dropboxLocation: returnMethod === "dropbox" ? dropboxLocation : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.return?.qrCodeData) {
        setQrCode(data.return.qrCodeData);
      }

      toast.success("Return request submitted successfully!");
      await mutate();

      if (returnMethod !== "dropbox") {
        router.push("/customer/track");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit return");
    }
    setSubmitting(false);
  };

  if (qrCode) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <GlassCard className="max-w-md text-center">
          <QrCode className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">Your Drop-Box QR Code</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Show this QR code at the drop-box location to complete your return.
          </p>
          <div className="mt-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="Return QR Code" className="h-48 w-48 rounded-lg" />
          </div>
          <Button className="mt-6" onClick={() => { setQrCode(""); router.push("/customer/track"); }}>
            Track My Return
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Returns</h1>
          <p className="text-muted-foreground">Manage your return and exchange requests.</p>
        </div>
        {!showForm && (
          <Button onClick={() => router.push("/customer/orders")}>Request New Return</Button>
        )}
      </div>

      {showForm && orderId && (
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-foreground">New Return Request</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.productId} value={p.productId}>
                      {p.name} ({p.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective Product</SelectItem>
                  <SelectItem value="wrong_size">Wrong Size</SelectItem>
                  <SelectItem value="wrong_color">Wrong Color</SelectItem>
                  <SelectItem value="not_as_described">Not As Described</SelectItem>
                  <SelectItem value="damaged">Damaged in Shipping</SelectItem>
                  <SelectItem value="changed_mind">Changed Mind</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Upload Image (optional)</Label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                {imagePreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(""); }}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="h-auto cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Return Method</Label>
              <Select value={returnMethod} onValueChange={setReturnMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Home Pickup</SelectItem>
                  <SelectItem value="dropbox">Drop Box (QR Code)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {returnMethod === "dropbox" && (
              <div className="flex flex-col gap-2">
                <Label>Preferred Drop-Box Location</Label>
                <Select value={dropboxLocation} onValueChange={setDropboxLocation}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mall_central">Central Mall - Ground Floor</SelectItem>
                    <SelectItem value="station_north">North Station - Counter 3</SelectItem>
                    <SelectItem value="hub_south">South Hub - Main Entrance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting || (aiValidation && !aiValidation.canSubmit) || false}>
                {submitting ? "Submitting..." : "Submit Return Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); router.push("/customer/returns"); }}>
                Cancel
              </Button>
            </div>

            {/* AI Validation Results */}
            {validating && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Brain className="h-4 w-4 animate-pulse text-blue-600" />
                <span className="text-sm text-blue-700">AI is analyzing your image and description...</span>
              </div>
            )}

            {aiValidation && !validating && (
              <div className={`rounded-lg border p-3 ${
                aiValidation.canSubmit 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start gap-2">
                  {aiValidation.canSubmit ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${
                        aiValidation.canSubmit ? 'text-green-800' : 'text-red-800'
                      }`}>
                        AI Validation {aiValidation.canSubmit ? 'Passed' : 'Failed'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        aiValidation.canSubmit ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {(aiValidation.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className={`text-xs ${
                      aiValidation.canSubmit ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {aiValidation.reason}
                    </p>
                    {!aiValidation.canSubmit && (
                      <p className="text-xs text-red-600 mt-1">
                        💡 Please provide a more accurate description or clearer image to improve validation results.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </GlassCard>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Your Returns</h2>
        {returns.length === 0 ? (
          <GlassCard className="py-8 text-center">
            <p className="text-muted-foreground">No return requests found.</p>
          </GlassCard>
        ) : (
          returns.map((ret: {
            _id: string;
            reason: string;
            description: string;
            status: string;
            returnMethod: string;
            createdAt: string;
            qrCodeData: string;
          }) => (
            <GlassCard key={ret._id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Return #{ret._id.slice(-8).toUpperCase()}</p>
                    <StatusBadge status={ret.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ret.reason} &middot; {ret.returnMethod}</p>
                  {ret.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{ret.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(ret.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {ret.qrCodeData && ret.returnMethod === "dropbox" && (
                  <div className="flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ret.qrCodeData} alt="QR Code" className="h-16 w-16 rounded" />
                  </div>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

export default function CustomerReturns() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ReturnsContent />
    </Suspense>
  );
}
