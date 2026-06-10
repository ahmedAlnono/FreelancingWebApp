import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container py-32 text-center">
      <div className="text-7xl font-bold text-gradient mb-4">404</div>
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <Button asChild className="gradient-primary text-primary-foreground border-0"><Link to="/">Back home</Link></Button>
    </div>
  );
};

export default NotFound;
