import { Link, NavLink, useNavigate } from "react-router-dom";
import { Briefcase, Moon, Sun, Search, Bell, MessageSquare, Menu, LogOut, LayoutDashboard, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navLinks = [
  { to: "/jobs", label: "Find Jobs" },
  { to: "/freelancers", label: "Find Talent" },
  { to: "/categories", label: "Categories" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/jobs?q=${encodeURIComponent(q)}`);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-elegant">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline text-gradient">WorkHive</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to} to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md ml-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs, skills, freelancers..."
              className="pl-9 bg-secondary/50 border-transparent focus-visible:bg-background"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="relative hidden sm:inline-flex">
                <Link to="/messages">
                  <MessageSquare className="h-4 w-4" />
                  {user.unreadMessages > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">{user.unreadMessages}</Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
                <Bell className="h-4 w-4" />
                {user.notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">{user.notifications}</Badge>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/profile"><User className="h-4 w-4 mr-2" />Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/post-job"><Briefcase className="h-4 w-4 mr-2" />Post a Job</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}><LogOut className="h-4 w-4 mr-2" />Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              <Button asChild className="gradient-primary text-primary-foreground border-0">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                    className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? "bg-accent text-primary" : "hover:bg-accent/50"}`}>
                    {l.label}
                  </NavLink>
                ))}
                {!isAuthenticated && (
                  <>
                    <Button asChild variant="outline" className="mt-4"><Link to="/login" onClick={() => setOpen(false)}>Log in</Link></Button>
                    <Button asChild className="gradient-primary text-primary-foreground border-0"><Link to="/signup" onClick={() => setOpen(false)}>Sign up</Link></Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
