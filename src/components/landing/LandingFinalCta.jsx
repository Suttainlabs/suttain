import React from "react";
import { Link } from "react-router-dom";

export default function LandingFinalCta() {
  return (
    <div className="bg-[#9531F5] text-white px-6 py-20 text-center">
      <div className="max-w-[1080px] mx-auto">
        <h2 className="font-heading font-semibold text-[clamp(24px,3.6vw,32px)] text-white mb-3.5">Start with either door</h2>
        <p className="text-[#D4D2F0] max-w-[480px] mx-auto mb-8 text-[15.5px] leading-[1.6]">
          Scan something on your shelf, or talk to us about what your team needs from the API.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/BarcodeScanner"
            className="inline-flex items-center bg-white text-[#9531F5] border-[1.5px] border-white rounded-[7px] px-[18px] py-[9px] text-sm font-medium hover:bg-[#F5EEFF] transition-colors"
          >
            Scan a product
          </Link>
          <Link
            to="/EnterpriseAPI"
            className="inline-flex items-center bg-transparent text-white border-[1.5px] border-white rounded-[7px] px-[18px] py-[9px] text-sm font-medium hover:bg-white hover:text-[#9531F5] transition-colors"
          >
            Talk to us about API access
          </Link>
        </div>
      </div>
    </div>
  );
}