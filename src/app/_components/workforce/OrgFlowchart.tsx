"use client";

import React, { useRef, useState, type MouseEvent } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type OrgNode = {
  id: string;
  name: string;
  role: string | null;
  employeeCode: string | null;
  children?: OrgNode[];
};

const bgColors = [
  "bg-emerald-900", // Depth 0
  "bg-emerald-800", // Depth 1
  "bg-emerald-700", // Depth 2
  "bg-emerald-600", // Depth 3
  "bg-emerald-500", // Depth 4
  "bg-emerald-400", // Depth 5
  "bg-emerald-300", // Depth 6
];

const OrgNodeComponent = ({
  node,
  depth = 0,
}: {
  node: OrgNode;
  depth?: number;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const bgColor = bgColors[Math.min(depth, bgColors.length - 1)];

  return (
    <div className="flex flex-col items-stretch mx-1 sm:mx-2">
      {/* Node Content */}
      {hasChildren ? (
        <div
          className={`relative border border-emerald-950 flex flex-col items-center justify-center text-center font-bold text-white px-2 sm:px-4 py-1.5 shadow-sm ${bgColor}`}
        >
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/live-map?userId=${node.id}`}
              className="hover:underline uppercase text-[10px] sm:text-xs tracking-wide whitespace-nowrap"
            >
              {node.name}
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col border-2 border-emerald-700 w-28 sm:w-32 bg-white shadow-sm shrink-0">
          <div className="flex text-[8px] sm:text-[9px] font-bold text-center border-b-2 border-emerald-700 bg-emerald-100 text-emerald-900">
            <div className="flex-1 border-r-2 border-emerald-700 p-1">
              E/A CODE
            </div>
            <div className="flex-[2] p-1">NAME</div>
          </div>
          <div className="flex text-[9px] sm:text-[10px] text-center font-bold text-emerald-900 h-8 items-center bg-white">
            <div
              className="flex-1 border-r-2 border-emerald-700 p-1 truncate"
              title={node.employeeCode || "-"}
            >
              {node.employeeCode || "-"}
            </div>
            <div className="flex-[2] p-1 truncate" title={node.name}>
              <Link
                href={`/admin/live-map?userId=${node.id}`}
                className="hover:underline"
              >
                {node.name}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Children */}
      {hasChildren && (
        <div className="flex flex-col items-stretch">
          {/* Vertical line from parent down to the horizontal line */}
          <div className="h-4 sm:h-6 w-0.5 bg-emerald-700 mx-auto" />

          {/* Children container */}
          <div className="flex flex-row justify-center">
            {node.children!.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === node.children!.length - 1;
              const isOnly = node.children!.length === 1;

              return (
                <div
                  key={child.id}
                  className="relative flex flex-col items-center"
                >
                  {/* Horizontal line */}
                  {!isOnly && (
                    <div
                      className={`absolute top-0 h-0.5 bg-emerald-700 ${
                        isFirst
                          ? "left-1/2 right-0"
                          : isLast
                            ? "left-0 right-1/2"
                            : "inset-x-0"
                      }`}
                    />
                  )}
                  {/* Vertical line down to the child */}
                  <div className="h-4 sm:h-6 w-0.5 bg-emerald-700" />

                  {/* Render the child */}
                  <div className="pt-0">
                    <OrgNodeComponent node={child} depth={depth + 1} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export function OrgFlowchart() {
  const { data: roots, isLoading } = api.users.getOrgTree.useQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5; // Scroll-fast
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  if (isLoading)
    return (
      <div className="flex h-[700px] items-center justify-center rounded-3xl bg-slate-50 border border-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );

  if (!roots || roots.length === 0) {
    return (
      <div className="flex h-[700px] items-center justify-center rounded-3xl bg-slate-50 border border-gray-100">
        <p className="text-gray-500 font-medium">No organizational data found.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`h-[700px] w-full overflow-auto rounded-3xl border border-gray-100 bg-slate-50 shadow-inner p-8 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="min-w-max flex flex-col items-center pb-20">
        <div className="flex flex-row justify-center gap-12">
          {(roots as OrgNode[]).map((root) => (
            <OrgNodeComponent key={root.id} node={root} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}
