import React from "react";
import { Outlet } from "react-router-dom";
import DarkNavBar from "@/components/navigation/DarkNavBar";

/**
 * ResearchLayout — dark-themed shell for all /research/* routes.
 * Does NOT use the consumer Layout component at all.
 * DarkNavBar provides the persistent research navigation.
 */
export default function ResearchLayout() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100">
      <DarkNavBar />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}