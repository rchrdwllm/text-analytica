"use client";

import { NAV_ITEMS } from "@/constants/nav-items";
import NavLink from "./nav-link";
import Link from "next/link";

const Sidebar = () => {
  return (
    <aside className="bg-sidebar p-3 py-6 min-w-[300px] h-full">
      <Link href="/dashboard">
        <h1 className="font-semibold text-2xl">🔬 Text Analytica</h1>
      </Link>
      <section className="space-y-3 mt-6">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </section>
    </aside>
  );
};

export default Sidebar;
