import React from "react";
import { Link } from "react-router-dom";
import Tr from "@/components/i18n/Tr";

export default function LandingFinalCta() {
  return (
    <div className="bg-[#9531F5] text-white px-6 py-20 text-center">
      <div className="max-w-[1080px] mx-auto">
        <h2 className="font-heading font-semibold text-[clamp(22px,3vw,26px)] text-white mb-3.5"><Tr>Start with either door</Tr></h2>
        <p className="text-[#E4E2F6] max-w-[480px] mx-auto mb-8 text-[15px] leading-[1.65]">
          <Tr>Scan something on your shelf, or talk to us about what your team needs from the API.</Tr>
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/BarcodeScanner"
            className="inline-flex items-center bg-white text-[#9531F5] border-[1.5px] border-white rounded-[7px] px-[18px] py-[9px] text-sm font-medium hover:bg-[#F5EEFF] transition-colors"
          >
            <Tr>Scan a product</Tr>
          </Link>
          <Link
            to="/EnterpriseAPI"
            className="inline-flex items-center bg-transparent text-white border-[1.5px] border-white rounded-[7px] px-[18px] py-[9px] text-sm font-medium hover:bg-white hover:text-[#9531F5] transition-colors"
          >
            <Tr>Talk to us about API access</Tr>
          </Link>
        </div>
      </div>
    </div>
  );
}