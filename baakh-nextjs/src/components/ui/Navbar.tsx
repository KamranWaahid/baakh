"use client";

import { useMemo, useState } from "react";
import { Bell, Search, User, Users, BookOpen, Type, BarChart3, Shield, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  type SearchCategory = "Poets" | "Poetry" | "Tools" | "Settings" | "Dashboard";
  const index = useMemo(() => ([
    { id: "poets", title: "Poets", href: "/admin/poets", cat: "Poets", icon: Users, k: ["poet","authors","manage"] },
    { id: "poet-new", title: "Add Poet", href: "/admin/poets/create", cat: "Poets", icon: Users, k: ["add poet","new poet"] },
    { id: "poetry", title: "Poetry", href: "/admin/poetry", cat: "Poetry", icon: BookOpen, k: ["poetry","couplet","ghazal","nazam"] },
    { id: "poetry-new", title: "Add Poetry", href: "/admin/poetry/create", cat: "Poetry", icon: BookOpen, k: ["add poetry","new poetry"] },
    { id: "romanizer", title: "Romanizer", href: "/admin/romanizer", cat: "Tools", icon: Type, k: ["romanizer","hesudhar","tools"] },
    { id: "analytics", title: "Analytics", href: "/admin/analytics", cat: "Dashboard", icon: BarChart3, k: ["analytics","insights","stats"] },
    { id: "settings", title: "Settings", href: "/admin/settings", cat: "Settings", icon: Cog, k: ["settings","appearance","general"] },
    { id: "access", title: "Roles & Permissions", href: "/admin/settings#access", cat: "Settings", icon: Shield, k: ["roles","permissions","access"] },
  ]), []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return index;
    return index.filter(i => i.title.toLowerCase().includes(term) || i.k.some(k => k.includes(term)));
  }, [q, index]);

  const grouped = useMemo(() => {
    const g: Record<SearchCategory, typeof filtered> = { Poets: [], Poetry: [], Tools: [], Settings: [], Dashboard: [] };
    filtered.forEach(i => { (g[i.cat as SearchCategory] ||= []).push(i); });
    return g;
  }, [filtered]);

  const openSelected = () => {
    const t = filtered[activeIdx] || filtered[0];
    if (t) {
      router.push(t.href);
      setQ("");
    }
  };

  return (
    <header className="min-h-16 py-2 px-6 bg-background/80 supports-[backdrop-filter]:backdrop-blur-md flex items-center justify-between border-b border-border">
      {/* Left side - Logo and Search */}
      <div className="flex items-center gap-6">
        {!isAdmin && <Logo size="sm" />}
        
        {isAdmin && (
          <div className="hidden md:flex items-center gap-3">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">Admin</Badge>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search admin…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setActiveIdx(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openSelected();
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
                  if (e.key === 'Escape') setQ("");
                }}
                className="w-80 pl-10 rounded-full"
              />
              {q && (
                <div className="absolute left-0 right-0 top-11 z-30 rounded-xl ring-1 ring-border/60 bg-card/95 backdrop-blur shadow-lg p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {(["Poets","Poetry","Tools","Settings","Dashboard"] as SearchCategory[]).map((cat) => (
                      <div key={cat}>
                        <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">{cat}</div>
                        {(grouped[cat] || []).slice(0, 5).map((item, idx) => {
                          const globalIdx = filtered.findIndex(f => f.id === item.id);
                          const isActive = globalIdx === activeIdx;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onMouseEnter={() => setActiveIdx(globalIdx)}
                              onClick={() => { router.push(item.href); setQ(""); }}
                              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${isActive ? 'bg-muted ring-1 ring-border/60' : 'hover:bg-muted/50'}`}
                            >
                              <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{item.title}</div>
                                {item.href && <div className="text-[11px] text-muted-foreground truncate">{item.href}</div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="px-2 pt-2 text-[11px] text-muted-foreground">↑/↓ to navigate · Enter to open</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right side - Notifications and User */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">Welcome</div>
        <Button variant="ghost" size="sm">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
} 