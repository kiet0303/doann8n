import React, { useState } from "react";
import { Search, Users, ShieldCheck, Check } from "lucide-react";
import { FacebookPage } from "../types";

interface PageSelectorProps {
  pages: FacebookPage[];
  selectedPageIds: string[];
  onTogglePage: (id: string) => void;
  isFbConnected: boolean;
  onSelectPages?: (ids: string[]) => void;
}

export default function PageSelector({
  pages,
  selectedPageIds,
  onTogglePage,
  isFbConnected,
  onSelectPages,
}: PageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (onSelectPages) {
      const targetPages = searchQuery ? filteredPages : pages;
      onSelectPages(targetPages.map((p) => p.id));
    }
  };

  const handleDeselectAll = () => {
    if (onSelectPages) {
      onSelectPages([]);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl flex flex-col h-full max-h-[500px] overflow-hidden text-slate-800">
      {/* Sleek Header */}
      <div className="p-5 border-b border-[#E2E8F0] flex flex-col gap-2.5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)] shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900 margin-0">Select Pages</h2>
          <span className="text-xs text-[#2563EB] font-semibold">
            {selectedPageIds.length} Selected
          </span>
        </div>
        
        {isFbConnected && onSelectPages && (
          <div className="flex gap-2 w-full">
            <button
              onClick={handleSelectAll}
              className="flex-1 py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 rounded-md transition cursor-pointer select-none text-center"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="flex-1 py-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 rounded-md transition cursor-pointer select-none text-center"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 border-b border-[#E2E8F0]/80 shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!isFbConnected}
            placeholder={isFbConnected ? "Filter connected fanpages..." : "Connect Facebook to search pages"}
            className="w-full pl-9 pr-3 py-2 border border-[#CBD5E1] rounded-lg text-xs bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none transition disabled:opacity-50"
          />
        </div>
      </div>

      {/* Pages Container list */}
      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        {!isFbConnected ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg m-2">
            <Users className="w-8 h-8 text-slate-350 mb-2.5" />
            <h4 className="text-xs font-bold text-slate-600">Facebook Not Linked</h4>
            <p className="text-[11px] text-[#64748B] mt-1 max-w-[200px] leading-relaxed">
              Connect your account in the Configuration form to retrieve pages.
            </p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-xs text-slate-400">No matching pages found.</span>
          </div>
        ) : (
          filteredPages.map((page) => {
            const isSelected = selectedPageIds.includes(page.id);
            return (
              <div
                key={page.id}
                onClick={() => onTogglePage(page.id)}
                className={`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#EFF6FF] text-slate-900"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Controlled click via parent div
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB] cursor-pointer shrink-0"
                />
                
                {/* Micro avatar */}
                <img
                  src={page.pictureUrl}
                  alt={page.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200/80 shrink-0"
                />

                <div className="flex-grow min-w-0">
                  <div className="text-xs font-semibold leading-tight text-slate-900 truncate">
                    {page.name}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-medium leading-none mt-1">
                    {page.followers.toLocaleString()} followers
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Helpful Info bar */}
      <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] shrink-0 text-[10px] text-[#64748B] font-medium flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
        <span>Broadcasting utilizes standard Graph API tokens securely.</span>
      </div>
    </div>
  );
}
