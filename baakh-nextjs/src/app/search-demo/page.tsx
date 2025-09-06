"use client";

import { motion } from "framer-motion";
import SearchInterface from "@/components/ui/SearchInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  User, 
  Hash, 
  Clock, 
  Search, 
  Sparkles,
  Globe,
  Heart,
  Filter
} from "lucide-react";

export default function SearchDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-primary/10">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Discover Poetry
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Explore centuries of Sindhi poetry, discover hidden gems, and find the perfect verse 
                that speaks to your soul. Our intelligent search connects you with poets, themes, and eras.
              </p>
            </motion.div>

            {/* Search Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <SearchInterface />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Poems</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Poets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Themes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">300+</div>
                <div className="text-sm text-muted-foreground">Years</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Search Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our search is designed to be both powerful and intuitive, helping you discover 
              poetry in ways you never thought possible.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Smart Categorization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="border border-border/60 hover:border-primary/60 hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Categorization</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Results are automatically grouped by type - poems, poets, themes, and timelines - 
                  making it easy to find exactly what you're looking for.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Multi-Language Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border border-border/60 hover:border-primary/60 hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Multi-Language</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Search across Sindhi, English, and other languages. Find poetry in its original 
                  form or discover translations that bring new meaning.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Filtering */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="border border-border/60 hover:border-primary/60 hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Refine your search by poet, era, theme, form, and more. Build complex queries 
                  to discover hidden connections and patterns.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Voice Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="border border-border/60 hover:border-primary/60 hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Voice & Surprise</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Use voice search for hands-free discovery or let our "Surprise Me" feature 
                  introduce you to unexpected poetry gems.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Real-time Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="border border-border/60 hover:border-primary/60 hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Real-time Search</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  See results as you type with intelligent suggestions and instant categorization. 
                  No waiting, just immediate discovery.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rich Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border border-border/60 hover:border-primary/60 hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Rich Context</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Every result includes rich metadata - poet information, historical context, 
                  themes, and excerpts to help you make informed choices.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Search Types Preview */}
      <div className="bg-muted/30 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                What You Can Search For
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our search covers the full spectrum of poetic content, from individual verses 
                to historical timelines and thematic collections.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Poems & Verses",
                description: "Individual poems, couplets, and verses with full text and translations",
                color: "from-blue-500/20 to-blue-600/20",
                badgeColor: "bg-blue-100 text-blue-800"
              },
              {
                icon: <User className="w-6 h-6" />,
                title: "Poets & Authors",
                description: "Biographical information, works, and complete collections by poet",
                color: "from-green-500/20 to-green-600/20",
                badgeColor: "bg-green-100 text-green-800"
              },
              {
                icon: <Hash className="w-6 h-6" />,
                title: "Themes & Topics",
                description: "Collections organized by subject, emotion, or thematic elements",
                color: "from-purple-500/20 to-purple-600/20",
                badgeColor: "bg-purple-100 text-purple-800"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Timeline & Era",
                description: "Historical periods, movements, and chronological organization",
                color: "from-orange-500/20 to-orange-600/20",
                badgeColor: "bg-orange-100 text-orange-800"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`border border-border/60 hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${item.color}`}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-background/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {item.icon}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <Badge className={item.badgeColor}>
                      Available
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl font-bold text-foreground">
            Ready to Discover Poetry?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your journey through centuries of Sindhi poetry. Whether you're a researcher, 
            poetry lover, or just curious, our search will guide you to amazing discoveries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
              Start Searching
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
