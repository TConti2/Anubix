"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
  { href: "/dashboard/students", label: "Students", icon: <Users size={20} /> },
  { href: "/dashboard/classes", label: "Classes", icon: <Calendar size={20} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-60 bg-gray-900 text-white p-4">
      <nav className="flex flex-col space-y-4">
        {links.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <span
                className={`flex items-center space-x-2 p-2 rounded-md ${
                  isActive ? "bg-gray-700" : "hover:bg-gray-800"
                }`}
              >
                {icon}
                <span>{label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
