import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown, ExternalLink, Users, Sparkles, ShieldCheck } from "lucide-react";
import { FacebookPage } from "../types";

interface FanpagesProps {
  pages: FacebookPage[];
  selectedPageIds: string[];
  onTogglePage: (id: string) => void;
  isFbConnected: boolean;
  onConnectFb: () => void;
}

export default function Fanpages({
  pages,
  selectedPageIds,
  onTogglePage,
  isFbConnected,
  onConnectFb,
}: FanpagesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "followers" | "selected">("followers");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Aggregate stats of pages
  const statsSummary = useMemo(() => {
    const connectedList = isFbConnected ? pages : [];
    const totalLikes = connectedList.reduce((acc, p) => acc + p.followers, 0);
    const activeSelectedList = connectedList.filter((p) => selectedPageIds.includes(p.id));
    const activeSelectedLikes = activeSelectedList.reduce((acc, p) => acc + p.followers, 0);

    return {
      totalAccessible: connectedList.length,
      activeSelected: activeSelectedList.length,
      aggregateLikes: totalLikes,
      activeLikes: activeSelectedLikes,
    };
  }, [pages, isFbConnected, selectedPageIds]);

  // Sort and filter pages
  const processedPages = useMemo(() => {
    let result = [...pages];

    // Filter
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "name") {
        return multiplier * a.name.localeCompare(b.name);
      } else if (sortBy === "followers") {
        return multiplier * (a.followers - b.followers);
      } else if (sortBy === "selected") {
        const selectedA = selectedPageIds.includes(a.id) ? 1 : 0;
        const selectedB = selectedPageIds.includes(b.id) ? 1 : 0;
        return multiplier * (selectedA - selectedB);
      }
      return 0;
    });

    return result;
  }, [pages, searchQuery, sortBy, sortOrder, selectedPageIds]);

  const handleSort = (type: "name" | "followers" | "selected") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6 text-slate-850">
      {/* Upper info section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider block">Integrations Portal</span>
          <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">
            Facebook Fanpages
          </h2>
          <p className="text-[#64748B] text-xs font-medium">
            Review detailed analytical metrics for integrated Fanpages and modify targeted broadcast feeds.
          </p>
        </div>

        {/* Aggregate Reach Cards layout */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="px-5 py-3 border border-[#E2E8F0] bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wide block">Total Fan Reach</span>
            <span className="font-mono text-base font-bold text-slate-950 mt-1 block">
              {isFbConnected ? statsSummary.aggregateLikes.toLocaleString() : "0"} Likes
            </span>
          </div>
          <div className="px-5 py-3 border border-[#E2E8F0]/80 bg-[#EFF6FF] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wide block">Active Targets Reach</span>
            <span className="font-mono text-base font-bold text-[#2563EB] mt-1 block">
              {isFbConnected ? statsSummary.activeLikes.toLocaleString() : "0"} Likes
            </span>
          </div>
        </div>
      </div>

      {isFbConnected ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden animate-fade-in">
          {/* List Toolbar control */}
          <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Lookup fanpages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#CBD5E1] bg-white rounded-lg focus:border-[#2563EB] outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto text-xs font-medium">
              <span className="text-[#64748B] whitespace-nowrap">Sort metric:</span>
              <button
                onClick={() => handleSort("followers")}
                className={`px-3 py-1.5 border rounded-lg flex items-center gap-1 cursor-pointer transition ${
                  sortBy === "followers" ? "bg-slate-900 text-white border-slate-900 font-semibold" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>Follower Count</span>
                {sortBy === "followers" && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => handleSort("name")}
                className={`px-3 py-1.5 border rounded-lg flex items-center gap-1 cursor-pointer transition ${
                  sortBy === "name" ? "bg-slate-900 text-white border-slate-900 font-semibold" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>Page Name</span>
                {sortBy === "name" && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => handleSort("selected")}
                className={`px-3 py-1.5 border rounded-lg flex items-center gap-1 cursor-pointer transition ${
                  sortBy === "selected" ? "bg-slate-900 text-white border-slate-900 font-semibold" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>Target Status</span>
                {sortBy === "selected" && <ArrowUpDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Catalog Tabular view */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/55 text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Page Name / Category</th>
                  <th className="py-4 px-6">Followers Volume</th>
                  <th className="py-4 px-6">Target Status</th>
                  <th className="py-4 px-6 text-right">Toggle Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {processedPages.map((page) => {
                  const isSelected = selectedPageIds.includes(page.id);
                  return (
                    <tr
                      key={page.id}
                      className={`hover:bg-[#F8FAFC]/50 transition duration-100 ${isSelected ? "bg-[#EFF6FF]/25" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={page.pictureUrl}
                            alt={page.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-semibold text-slate-900 text-xs leading-snug">{page.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-[#64748B] bg-slate-100 border border-slate-200 font-mono px-1.5 py-0.5 rounded leading-none font-semibold">
                                ID {page.id.substring(0, 8)}
                              </span>
                              <span className="text-[11px] text-[#64748B]">{page.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs font-semibold text-slate-800">
                          {page.followers.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">Organic reach</span>
                      </td>
                      <td className="py-4 px-6">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] rounded-full border border-blue-100 leading-none">
                            <Sparkles className="w-3 h-3 text-[#2563EB]" />
                            <span>Target Enabled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-medium bg-slate-50 text-[#64748B] rounded-full border border-slate-200 leading-none">
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onTogglePage(page.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition duration-155 cursor-pointer ${
                            isSelected
                              ? "bg-white hover:bg-slate-50 border-[#CBD5E1] text-slate-700 font-semibold"
                              : "bg-[#2563EB] hover:bg-blue-700 border-transparent text-white font-medium"
                          }`}
                        >
                          {isSelected ? "Deselect" : "Select Target"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#E2E8F0] rounded-xl shadow-sm text-center">
          <Users className="w-14 h-14 text-slate-450 bg-slate-50 border border-slate-100 p-3 rounded-full mb-4" />
          <h3 className="font-sans font-bold text-base text-slate-800">No Integrations Configured</h3>
          <p className="text-[#64748B] text-xs mt-1.5 max-w-sm mx-auto leading-relaxed font-medium">
            Link your Facebook profile using the workflow configuration tool to query dynamic Fanpages and manage delivery endpoints.
          </p>
          <button
            onClick={onConnectFb}
            className="mt-5 px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition"
          >
            Authenticate Profile
          </button>
        </div>
      )}
    </div>
  );
}
