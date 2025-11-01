import {
  FileChartLine,
  LayoutDashboard,
  Lightbulb,
  StickyNote,
  VectorSquare,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    Icon: LayoutDashboard,
  },
  {
    label: "Corpus Documents",
    href: "/corpus-documents",
    Icon: StickyNote,
  },
  {
    label: "Corpus Topics",
    href: "/corpus-topics",
    Icon: Lightbulb,
  },
  {
    label: "Author Networks",
    href: "/author-networks",
    Icon: VectorSquare,
  },
  {
    label: "Paper Analysis",
    href: "/paper-analysis",
    Icon: FileChartLine,
  },
];
