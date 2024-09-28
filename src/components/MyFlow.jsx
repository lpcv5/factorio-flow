import { useMemo } from "react";
import { ReactFlow, Background } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useNodeStore } from "../stores/nodestore";
import Recipe from "./nodes/Recipe";
import "@xyflow/react/dist/style.css";

const Myflow = () => {
  const nodeTypes = useMemo(() => ({ recipe: Recipe }), []);
  const { nodes, edges, onNodesChange, onEdgesChange, addEdge } = useNodeStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      addEdge: state.addEdge,
    }))
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={addEdge}
      fitView
    >
      <Background />
    </ReactFlow>
  );
};

export default Myflow;
