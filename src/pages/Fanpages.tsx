import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown, ExternalLink, Users, Sparkles, ShieldCheck } from "lucide-react";
import { FacebookPage } from "../types";

export const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-orange-105 text-orange-700 border-orange-200 font-bold",
  ];
  let hash = 0;
  const cleanName = name || "Page";
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

interface FanpagesProps {
  pages: FacebookPage[];
  selectedPageIds: string[];
  onTogglePage: (id: string) => void;
  onSelectPages?: (ids: string[]) => void;
  isFbConnected: boolean;
  onConnectFb: () => void;
}

export default function Fanpages({
  pages,
  selectedPageIds,
  onTogglePage,
  onSelectPages,
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

  const handleSelectAll = () => {
    if (onSelectPages) {
      const allIds = processedPages.map((p) => p.id);
      onSelectPages(allIds);
    }
  };

  const handleDeselectAll = () => {
    if (onSelectPages) {
      onSelectPages([]);
    }
  };

  return (
    <div className="space-y-6 text-slate-850">
      {isFbConnected ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden animate-fade-in">
          {/* List Toolbar control */}
          <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:max-w-2xl shrink-0">
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

              {onSelectPages && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer transition active:scale-[0.98]"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition active:scale-[0.98]"
                  >
                    Deselect All
                  </button>
                </div>
              )}
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
                      className={`hover:bg-[#F8FAFC]/50 transition duration-150 ${isSelected ? "bg-[#EFF6FF]/25" : ""}`}
                    >
                      <td className={`py-4 px-6 transition-all duration-300 ${isSelected ? "border-l-4 border-blue-600 pl-5 bg-blue-50/10" : ""}`}>
                        <div className="flex items-center gap-3.5">
                          <a
                            href={`https://facebook.com/${page.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 shadow-sm transition hover:scale-105 ${getAvatarColor(page.name)}`}
                            title={`Open ${page.name} on Facebook`}
                          >
                            {page.name ? page.name.trim().charAt(0).toUpperCase() : "?"}
                          </a>
                          <div>
                            <a
                              href={`https://facebook.com/${page.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-slate-900 text-xs leading-snug hover:text-blue-600 hover:underline inline-flex items-center gap-1 group"
                              title={`Open ${page.name} on Facebook`}
                            >
                              <span>{page.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </a>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-blue-650 bg-blue-50/50 border border-blue-105/35 font-mono px-1.5 py-0.5 rounded leading-none font-semibold">
                                ID {page.id.substring(0, 8)}
                              </span>
                              <span className="text-[11px] text-[#64748B] font-medium">{page.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs font-bold text-slate-800">
                          {page.followers.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">Organic fan count</span>
                      </td>
                      <td className="py-4 px-6">
                        {isSelected ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-250/50 leading-none uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Posting Enabled</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono font-medium pl-1">Live queue dispatching</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold bg-slate-50 text-slate-500 rounded-full border border-slate-200 leading-none uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Inactive Target</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono font-medium pl-1">Excl. from feed</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onTogglePage(page.id)}
                          className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all duration-155 cursor-pointer active:scale-[0.98] select-none ${
                            isSelected
                              ? "bg-rose-50 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 border-rose-200 text-rose-600 font-bold"
                              : "bg-[#2563EB] hover:bg-blue-700 border-transparent text-white font-bold hover:shadow-md hover:shadow-blue-500/10"
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
