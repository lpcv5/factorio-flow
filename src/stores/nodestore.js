import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { create } from "zustand";
import { produce } from "immer";
import dagre from "@dagrejs/dagre";
import { calculateProduction } from "../utils/matrixCal";
import dataAPI from "../utils/dataApi";

export const useNodeStore = create((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange(changes) {
    set(
      produce((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes);
      })
    );
  },

  onEdgesChange(changes) {
    set(
      produce((state) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      })
    );
  },

  addEdge(data) {
    set(
      produce((state) => {
        state.edges.unshift(data);
      })
    );
  },

  createNode(data) {
    const id = data.name;
    const position = { x: 0, y: 0 };
    const producer = data.producers[0].id;
    data.producer = producer;

    set(
      produce((state) => {
        state.nodes.push({ id, type: "recipe", data, position });
      })
    );
  },

  updateNode(id, data) {
    set(
      produce((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) {
          Object.assign(node.data, data);
        }
      })
    );
  },

  layout: () => {
    const { nodes, edges } = get();
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR" });

    nodes.forEach((node) =>
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      })
    );

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    set(
      produce((state) => {
        state.nodes.forEach((node) => {
          const position = g.node(node.id);
          node.position = {
            x: position.x - (node.measured?.width ?? 0) / 2,
            y: position.y - (node.measured?.height ?? 0) / 2,
          };
        });
      })
    );
  },

  handleAddNode: async (id, addId) => {
    const { nodes, edges, createNode, addEdge } = get();

    // 检查节点是否已存在
    const existingNode = nodes.find((node) => node.id === addId);
    if (!existingNode) {
      // 创建新节点
      const response = await dataAPI.getRecipeDetails(addId);
      createNode(response.data);
    }

    const edgeId = id + "+" + addId;
    const existingEdge = edges.find((edge) => edge.id === edgeId);
    if (!existingEdge) {
      const edgeData = {
        id: edgeId,
        source: id,
        target: addId,
      };
      addEdge(edgeData);
    }
    // 执行布局
    get().layout();
  },

  setProducer: (id, producerId) => {
    set(
      produce((state) => {
        const data = state.nodes.find((node) => node.id === id).data;
        data.producer = producerId;
      })
    );
  },

  calculateProduction: (nodeId, targetRate, isPerMinute = true) => {
    set(
      produce((state) => {
        // 收集所有配方
        const recipes = state.nodes.map((node) =>
          JSON.parse(JSON.stringify(node.data))
        );

        const result = calculateProduction(
          recipes,
          nodeId,
          targetRate,
          isPerMinute
        );

        // 更新节点数据
        state.nodes.forEach((node) => {
          const nodeResult = result.itemsPerSecond[node.id];
          if (nodeResult !== undefined) {
            // 更新 ingredients 的 amount
            node.data.ingredients.forEach((ingredient) => {
              ingredient.amount =
                result.itemsPerSecond[ingredient.item_id] || ingredient.amount;
            });

            // 更新 products 的 amount
            node.data.products.forEach((product) => {
              product.amount = nodeResult;
            });

            // 更新其他相关数据
            node.data.machinesNeeded = result.machinesNeeded[node.data.id] || 0;
            node.data.itemsPerSecond = nodeResult;
            node.data.itemsPerMinute = result.itemsPerMinute[node.id] || 0;
          }
        });
      })
    );
  },
}));
