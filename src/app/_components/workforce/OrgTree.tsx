"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Users, ChevronRight, ChevronDown, MapPin, Shield, User } from "lucide-react";
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
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
          level === 0 ? "bg-blue-50 border-blue-100 shadow-sm" : "bg-white border-gray-100 hover:border-blue-200"
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${!hasChildren && "invisible"}`}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </button>

        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          node.role === "Admin" ? "bg-purple-100 text-purple-600" : 
          node.role === "Manager" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
        }`}>
          {node.role === "Admin" ? <Shield className="h-5 w-5" /> : 
           node.role === "Manager" ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{node.name}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">{node.role}</p>
        </div>

        <div className="flex gap-2">
          <Link 
            href={`/admin/live-map?userId=${node.id}`}
            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
            className="flex flex-col gap-2 mt-2 overflow-hidden"
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
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (!roots || roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <Users className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-sm font-medium text-gray-500">No organizational structure found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4">
      {(roots as unknown as OrgNodeData[]).map((root) => (
        <OrgNode key={root.id} node={root} level={0} />
      ))}
    </div>
  );
}
