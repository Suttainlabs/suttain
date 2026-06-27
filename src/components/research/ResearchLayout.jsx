import React from "react";
import { Outlet } from "react-router-dom";
import ResearchNavBar from "@/components/navigation/DarkNavBar";

/**
 * ResearchLayout — light-themed shell for all /research/* routes.
 * Uses Suttain brand identity: #EDF7F2 page background, brand teal/violet/blue accents.
 */
export default function ResearchLayout() {
  return (
    <div className="min-h-screen bg-[#EDF7F2] text-slate-800">
      <ResearchNavBar />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}