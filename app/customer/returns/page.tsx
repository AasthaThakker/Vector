"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
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
import { 
  Upload, 
  X, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Brain,
  RotateCcw,
  ChevronRight,
  Package,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 max-w-md text-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md mx-auto w-fit mb-4">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Your Drop-Box QR Code</h2>
              <p className="text-slate-500 mb-6">
                Show this QR code at the drop-box location to complete your return.
              </p>
              <div className="flex justify-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="Return QR Code" className="h-48 w-48 rounded-xl shadow-lg" />
              </div>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" 
                onClick={() => { setQrCode(""); router.push("/customer/track"); }}
              >
                Track My Return
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
              <RotateCcw className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Returns
              </h1>
              <p className="text-slate-500 text-sm">
                Manage your return and exchange requests
              </p>
            </div>
            {!showForm && (
              <Link href="/customer/orders">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  Request New Return
                </Button>
              </Link>
            )}
          </div>
        </div>

        {showForm && orderId && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">New Return Request</h2>
                  <p className="text-sm text-slate-500">Fill in the details to process your return</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700">Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
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
                  <Label className="text-slate-700">Reason</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
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
                  <Label className="text-slate-700">Description</Label>
                  <Textarea
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700">Upload Image (optional)</Label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                      dragActive ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-xl object-cover shadow-md" />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(""); }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-slate-100 rounded-xl">
                          <Upload className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500">Drag & drop or click to upload</p>
                        <Input
                          type="file"
                          accept="image/*"
                          className="h-auto cursor-pointer bg-white border-slate-200"
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
                  <Label className="text-slate-700">Return Method</Label>
                  <Select value={returnMethod} onValueChange={setReturnMethod}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Home Pickup</SelectItem>
                      <SelectItem value="dropbox">Drop Box (QR Code)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {returnMethod === "dropbox" && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-slate-700">Preferred Drop-Box Location</Label>
                    <Select value={dropboxLocation} onValueChange={setDropboxLocation}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mall_central">Central Mall - Ground Floor</SelectItem>
                        <SelectItem value="station_north">North Station - Counter 3</SelectItem>
                        <SelectItem value="hub_south">South Hub - Main Entrance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={submitting || (aiValidation && !aiValidation.canSubmit) || false}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    {submitting ? "Submitting..." : "Submit Return Request"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { setShowForm(false); router.push("/customer/returns"); }}
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                </div>

                {/* AI Validation Results */}
                {validating && (
                  <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <Brain className="h-4 w-4 animate-pulse text-blue-600" />
                    <span className="text-sm text-blue-700">AI is analyzing your image and description...</span>
                  </div>
                )}

                {aiValidation && !validating && (
                  <div className={`rounded-xl border p-4 ${
                    aiValidation.canSubmit 
                      ? 'border-emerald-200 bg-emerald-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      {aiValidation.canSubmit ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${
                            aiValidation.canSubmit ? 'text-emerald-800' : 'text-red-800'
                          }`}>
                            AI Validation {aiValidation.canSubmit ? 'Passed' : 'Failed'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            aiValidation.canSubmit ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {(aiValidation.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <p className={`text-sm ${
                          aiValidation.canSubmit ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {aiValidation.reason}
                        </p>
                        {!aiValidation.canSubmit && (
                          <p className="text-sm text-red-600 mt-2">
                            💡 Please provide a more accurate description or clearer image to improve validation results.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Returns List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your Returns</h2>
                <p className="text-sm text-slate-500">Track all your return requests</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {returns.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-500">No return requests found</p>
                <p className="text-sm text-slate-400 mt-1">You can request a return from your orders page</p>
              </div>
            ) : (
              <div className="space-y-3">
                {returns.map((ret: any) => (
                  <div 
                    key={ret._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                        <RotateCcw className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900">Return #{ret._id.slice(-8).toUpperCase()}</p>
                          <StatusBadge status={ret.status} />
                        </div>
                        <p className="text-sm text-slate-500 capitalize">{ret.reason} &middot; {ret.returnMethod} &middot; <span className="font-semibold">₹{ret.price?.toLocaleString() || '0'}</span></p>
                        {ret.description && (
                          <p className="text-sm text-slate-400 mt-1">{ret.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(ret.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {ret.qrCodeData && (
                      <div className="flex-shrink-0 mt-3 sm:mt-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ret.qrCodeData} alt="QR Code" className="h-16 w-16 rounded-lg shadow-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
