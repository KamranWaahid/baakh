"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  Star,
  TrendingUp,
  History
} from "lucide-react";
import { useState } from "react";

export default function PeriodsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("All");

  const periods = [
    {
      id: "17th-century",
      name: "17th Century",
      sindhiName: "سترھين صدي",
      description: "The early period of classical Sindhi poetry, marked by the emergence of Sufi traditions.",
      years: "1600-1699",
      poets: 12,
      works: 85,
      icon: History,
      color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
      tags: ["Sufi", "Mysticism", "Devotional"],
      poetsList: ["Makhdoom Nooh", "Shah Inayat", "Mir Masoom"]
    },
    {
      id: "18th-century",
      name: "18th Century",
      sindhiName: "ارڙھين صدي",
      description: "The golden age of Sindhi poetry, featuring legendary poets like Shah Abdul Latif Bhittai.",
      years: "1700-1799",
      poets: 25,
      works: 320,
      icon: Star,
      color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
      tags: ["Sufi", "Classical", "Folk"],
      poetsList: ["Shah Abdul Latif", "Sachal Sarmast", "Sami"]
    },
    {
      id: "19th-century",
      name: "19th Century",
      sindhiName: "اڻوھين صدي",
      description: "A period of cultural renaissance and the emergence of new poetic forms and themes.",
      years: "1800-1899",
      poets: 18,
      works: 245,
      icon: Sparkles,
      color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      tags: ["Romantic", "Social", "Nature"],
      poetsList: ["Bedil", "Rohal Faqir", "Mirza Qaleech"]
    },
    {
      id: "20th-century",
      name: "20th Century",
      sindhiName: "ويھين صدي",
      description: "Modern era of Sindhi poetry with contemporary themes and experimental forms.",
      years: "1900-1999",
      poets: 35,
      works: 450,
      icon: TrendingUp,
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      tags: ["Modern", "Experimental", "Philosophical"],
      poetsList: ["Shaikh Ayaz", "Taj Joyo", "Hameed Sindhi"]
    }
  ];

  const filteredPeriods = selectedPeriod === "All" 
    ? periods 
    : periods.filter(period => period.name.includes(selectedPeriod));

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="text-center py-12 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-center text-foreground">
                Historical Timeline
              </h1>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Journey through the centuries of Sindhi poetry and discover how it evolved over time
              </p>
            </motion.div>
          </section>

          {/* Filters / Chips */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap items-center gap-2">
                {["All", "17th", "18th", "19th", "20th"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`h-9 px-4 rounded-full text-sm border transition-all ${
                      selectedPeriod === period
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    {period} Century
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{filteredPeriods.length} periods</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['Sufi','Romantic','Mysticism','Wisdom','Nature','Truth'].map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full">#{t}</Badge>
              ))}
            </div>
          </section>

          {/* Timeline - Vertical scroll (top to down) */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Timeline</h2>
              <p className="text-sm text-muted-foreground">Scroll to explore eras</p>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 border-l border-border/60" />
              <div className="space-y-6">
                {filteredPeriods.map((period, index) => {
                  const IconComponent = period.icon;
                  return (
                    <motion.div
                      key={period.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                      className="relative pl-10"
                    >
                      <span className="absolute left-0 top-6 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
                      <Card className="rounded-xl ring-1 ring-border/60 hover:ring-border transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${period.color}`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold">{period.name}</h3>
                                <Badge variant="outline" className="text-[11px] rounded-full px-3 py-1">{period.years}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2" dir="rtl">{period.sindhiName}</p>
                              <p className="text-sm text-muted-foreground mb-3">{period.description}</p>

                              {/* Tags for era */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {period.tags?.map((t: string, tagIndex: number) => (
                                  <Badge key={`${period.id}-tag-${tagIndex}-${t}`} variant="secondary" className="text-[11px] rounded-full px-3 py-1">
                                    {t}
                                  </Badge>
                                ))}
                              </div>

                              {/* Poets in era */}
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Key Poets:</span>
                                {period.poetsList?.map((p: string, poetIndex: number) => (
                                  <Badge key={`${period.id}-poet-${poetIndex}-${p}`} variant="outline" className="rounded-full px-2.5 py-0.5">{p}</Badge>
                                ))}
                              </div>

                              {/* Summary stats */}
                              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{period.poets} poets</span>
                                <span className="opacity-60">•</span>
                                <span>{period.works} works</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="mt-16">
            <Card className="rounded-xl ring-1 ring-border/60 bg-card/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center">Poetry Through the Ages</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{periods.reduce((sum, p) => sum + p.poets, 0)}</div>
                    <div className="text-sm text-muted-foreground">Total Poets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{periods.reduce((sum, p) => sum + p.works, 0)}</div>
                    <div className="text-sm text-muted-foreground">Total Works</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">400+</div>
                    <div className="text-sm text-muted-foreground">Years</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">4</div>
                    <div className="text-sm text-muted-foreground">Centuries</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
} 