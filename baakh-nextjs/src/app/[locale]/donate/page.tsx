"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowLeft,
  Heart,
  Shield,
  BookOpen,
  Award
} from "lucide-react";

export default function DonatePage() {
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [amount, setAmount] = useState<number | null>(25);
  const [custom, setCustom] = useState<string>("");
  const presets = [5, 10, 25, 50, 100];

  const handlePreset = (value: number) => {
    setAmount(value);
    setCustom("");
  };

  const handleCustomChange = (v: string) => {
    const cleaned = v.replace(/[^0-9]/g, "");
    setCustom(cleaned);
    setAmount(cleaned ? Number(cleaned) : null);
  };

  const handleDonate = () => {
    // Placeholder: integrate payment here
    // eslint-disable-next-line no-console
    console.log("Donate:", { amount, frequency });
    alert("Thanks for your support! (UI only)");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main */}
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="text-center py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">Donate</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">Support Baakh</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Help us preserve, research, and share classical Sindhi poetry. Your contribution keeps this archive open and independent.
              </p>
            </motion.div>
          </section>

          {/* Donate Card */}
          <Card className="rounded-xl ring-1 ring-border/60 bg-card/50">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-lg">Make a contribution</CardTitle>
              <p className="text-sm text-muted-foreground">Quick, secure, and fully transparent</p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Frequency */}
              <div className="mb-5">
                <div className="flex items-center justify-center gap-2">
                  {[{ k: "one-time", label: "One‑time" }, { k: "monthly", label: "Monthly" }].map((f) => (
                    <button
                      key={f.k}
                      onClick={() => setFrequency(f.k as typeof frequency)}
                      className={`h-9 px-4 rounded-full text-sm border transition-all ${
                        frequency === f.k
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset amounts */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePreset(p)}
                    className={`h-11 rounded-xl border text-sm font-medium transition-all ${
                      amount === p && !custom
                        ? "bg-primary text-primary-foreground border-primary shadow"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Custom amount</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={custom}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="Enter amount"
                    className="h-11 pl-7 rounded-full bg-input/50 border-0 focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Every contribution helps. Suggested: $5, $10, $25.</p>
              </div>

              {/* Optional note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Message (optional)</label>
                <Textarea rows={3} placeholder="Leave a note for the team" className="rounded-xl bg-input/50 border-0 focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              {/* Primary action */}
              <Button onClick={handleDonate} className="w-full h-11 rounded-full shadow-md hover:shadow-lg">
                <Heart className="w-4 h-4 mr-2" />
                Donate {amount ? `$${amount}` : "now"} {frequency === "monthly" ? "/ month" : ""}
              </Button>

              {/* Guarantees */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                <div className="rounded-lg ring-1 ring-border/60 bg-card/50 p-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Secure & private
                </div>
                <div className="rounded-lg ring-1 ring-border/60 bg-card/50 p-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Supports open research
                </div>
                <div className="rounded-lg ring-1 ring-border/60 bg-card/50 p-3 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Transparent impact
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact */}
          <section className="mt-10">
            <Card className="rounded-xl ring-1 ring-border/60 bg-card/50">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm text-muted-foreground">Couplets curated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-sm text-muted-foreground">Poets indexed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">300+</div>
                    <div className="text-sm text-muted-foreground">Years preserved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Note */}
          <p className="mt-6 text-xs text-muted-foreground text-center">
            This is a design-only page. Payment processing is not yet connected. For grants or large gifts, please
            <Link href="/contact" className="underline ml-1">contact us</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}


