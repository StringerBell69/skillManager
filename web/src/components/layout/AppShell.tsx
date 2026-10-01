import { Outlet, Navigate } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { Sidebar, SidebarBody, SidebarLink } from "../beui/animated-sidebar";
import { LayoutDashboard, KeyRound, CreditCard } from "lucide-react";

export default function AppShell() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={24} />,
    },
    {
      label: "Devices",
      href: "/devices",
      icon: <KeyRound size={24} />,
    },
    {
      label: "Billing",
      href: "/billing",
      icon: <CreditCard size={24} />,
    },
  ];

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-4">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">SM</span>
            </div>
            <span className="font-bold text-lg text-foreground truncate hidden md:block">
              SkillManager
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center md:justify-start px-2 py-4">
          <UserButton 
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10 border-2 border-border"
              }
            }}
          />
        </div>
      </SidebarBody>
      
      <main className="flex-1 overflow-y-auto bg-background md:pt-0 pt-16">
        <div className="h-full p-8">
          <Outlet />
        </div>
      </main>
    </Sidebar>
  );
}
