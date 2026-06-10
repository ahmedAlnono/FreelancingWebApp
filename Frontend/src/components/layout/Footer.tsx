import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30 mt-20">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-gradient">WorkHive</span>
          </Link>
          <p className="text-sm text-muted-foreground">Where great work happens. Hire top talent or find your next gig.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">For Clients</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/freelancers" className="hover:text-foreground">Find Talent</Link></li>
            <li><Link to="/post-job" className="hover:text-foreground">Post a Job</Link></li>
            <li><Link to="/categories" className="hover:text-foreground">Browse Categories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">For Freelancers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/jobs" className="hover:text-foreground">Find Work</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/profile" className="hover:text-foreground">Your Profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <div className="flex gap-3 text-muted-foreground">
            <a href="#" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} WorkHive. All rights reserved.
      </div>
    </footer>
  );
}
