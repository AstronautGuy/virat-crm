"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import { api } from "@/trpc/react";
import { Shield, Users, User, MapPin } from "lucide-react";
import Link from "next/link";
import dagre from "dagre";

const NodeStyles = {
  Admin:
    "border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-300",
  Manager: "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300",
  Employee: "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300",
};

interface NodeData {
  id: string;
  name: string;
  role: "Admin" | "Manager" | "Employee";
}

const CustomNode = ({ data }: { data: NodeData }) => {
  const Icon =
    data.role === "Admin" ? Shield : data.role === "Manager" ? Users : User;

  return (
    <div
      className={`group min-w-[220px] rounded-2xl border-2 bg-white px-5 py-4 shadow-lg transition-all duration-300 ${NodeStyles[data.role]}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-white !bg-gray-300"
      />
      <div className="flex items-center gap-4">
        <div
          className={`rounded-xl p-3 transition-colors ${NodeStyles[data.role]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
            {data.role}
          </p>
          <p className="truncate text-sm font-bold text-gray-900">
            {data.name}
          </p>
        </div>
        <Link
          href={`/admin/live-map?userId=${data.id}`}
          className="translate-x-2 transform rounded-xl p-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/80"
        >
          <MapPin className="h-5 w-5 text-blue-600" />
        </Link>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-white !bg-gray-300"
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 260;
const nodeHeight = 100;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB",
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (which is center-based) to top-left-based
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export function OrgFlowchart() {
  const { data: roots, isLoading } = api.users.getOrgTree.useQuery();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges],
  );

  useEffect(() => {
    if (!roots) return;

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    type OrgNode = {
      id: string;
      name: string;
      role: string | null;
      children?: OrgNode[];
    };

    const traverse = (node: OrgNode, parentId: string | null = null) => {
      const id = node.id;

      initialNodes.push({
        id,
        type: "custom",
        data: {
          name: node.name,
          role: (node.role ?? "Employee") as "Admin" | "Manager" | "Employee",
          id: node.id,
        },
        position: { x: 0, y: 0 }, // Positioned by dagre
      });

      if (parentId) {
        initialEdges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: ConnectionLineType.SmoothStep,
          animated: true,
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        });
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, id));
      }
    };

    (roots as OrgNode[]).forEach((root) => traverse(root));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [roots]);

  if (isLoading)
    return <div className="h-[700px] animate-pulse rounded-3xl bg-gray-50" />;

  return (
    <div className="relative h-[800px] w-full overflow-hidden rounded-3xl border border-gray-100 bg-slate-50 shadow-inner">
      <div className="absolute top-6 left-6 z-10 flex gap-2">
        <button
          onClick={() => onLayout("TB")}
          className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs font-bold shadow-sm transition-colors hover:bg-gray-50"
        >
          Vertical
        </button>
        <button
          onClick={() => onLayout("LR")}
          className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs font-bold shadow-sm transition-colors hover:bg-gray-50"
        >
          Horizontal
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="#cbd5e1" gap={25} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
