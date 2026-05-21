"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import {
  Users,
  ChevronRight,
  ChevronDown,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface OrgNodeData {
  id: string;
  name: string;
  role: string | null;
  children?: OrgNodeData[];
}

interface OrgNodeProps {
  node: OrgNodeData;
  level: number;
}

const OrgNode: React.FC<OrgNodeProps> = ({ node, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
          level === 0
            ? "border-blue-100 bg-blue-50 shadow-sm"
            : "border-gray-100 bg-white hover:border-blue-200"
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-md p-1 transition-colors hover:bg-gray-100 ${!hasChildren && "invisible"}`}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            node.role === "Admin"
              ? "bg-purple-100 text-purple-600"
              : node.role === "Manager"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {node.role === "Admin" ? (
            <Shield className="h-5 w-5" />
          ) : node.role === "Manager" ? (
            <Users className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">
            {node.name}
          </p>
          <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">
            {node.role}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/live-map?userId=${node.id}`}
            className="rounded-lg bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
            title="View on Map"
          >
            <MapPin className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex flex-col gap-2 overflow-hidden"
          >
            {node.children?.map((child) => (
              <OrgNode key={child.id} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function OrgTree() {
  const { data: roots, isLoading } = api.users.getOrgTree.useQuery();

  if (isLoading) {
    return (
      <div className="flex animate-pulse flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!roots || roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
        <Users className="mb-4 h-12 w-12 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          No organizational structure found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-4">
      {(roots as unknown as OrgNodeData[]).map((root) => (
        <OrgNode key={root.id} node={root} level={0} />
      ))}
    </div>
  );
}
