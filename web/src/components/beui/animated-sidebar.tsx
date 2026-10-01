import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {children}
      </div>
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Desktop */}
      <motion.div
        className={cn(
          "h-full px-4 py-6 hidden md:flex flex-col bg-background border-r border-border transition-all duration-300",
          open ? "w-64" : "w-[72px]",
          className
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </motion.div>

      {/* Mobile */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between bg-background border-b border-border px-4"
        )}
      >
        <div className="font-bold text-lg text-primary">SM</div>
        <button onClick={() => setOpen(!open)} className="text-foreground">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border p-4 pt-20 flex flex-col"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
}: {
  link: { label: string; href: string; icon: React.ReactNode };
  className?: string;
}) => {
  const { open } = useSidebar();
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-4 group/sidebar py-3 px-2 rounded-md transition-colors hover:bg-secondary",
        className
      )}
    >
      <div className="text-foreground group-hover/sidebar:text-primary transition-colors flex-shrink-0">
        {link.icon}
      </div>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-foreground whitespace-pre inline-block overflow-hidden transition-colors group-hover/sidebar:text-primary"
          >
            {link.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};
