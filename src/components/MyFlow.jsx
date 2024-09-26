import { useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { ReactFlow, Background, ReactFlowProvider, Panel } from "@xyflow/react";
import { Button } from "@nextui-org/react";
import { useShallow } from "zustand/react/shallow";
import { useNodeStore } from "../stores/nodestore";
import Recipe from "./nodes/Recipe";

const nodeTypes = {
  recipe: Recipe,
};

const Myflow = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, addEdge, createNode } =
    useNodeStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        addEdge: state.addEdge,
        createNode: state.createNode,
      }))
    );

  const addNode = async () => {
    const name = "electronic-circuit";
    const response = await fetch(
      `http://localhost:8000/api/get_recipe?recipe_name=${name}`
    );
    const data = await response.json();
    createNode(data);
  };
  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={addEdge}
      >
        <Background />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

export default Myflow;
