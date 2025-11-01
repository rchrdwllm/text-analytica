"use client";

import { NavItem } from "@/constants/nav-items";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const NavLink = ({ label, href, Icon }: NavItem) => {
  const pathname = usePathname();
  const isActive = useMemo(() => pathname.startsWith(href), [pathname, href]);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 hover:bg-primary/10 p-3 rounded-lg hover:text-primary transition-colors",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          : ""
      )}
    >
      <span>
        <Icon className="size-5" />
      </span>
      {label}
    </Link>
  );
};

export default NavLink;
