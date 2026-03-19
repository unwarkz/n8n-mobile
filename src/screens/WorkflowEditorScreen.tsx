import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Save, Activity, Plus, X, Settings2, Trash2, Power } from 'lucide-react';
import { api } from '../api';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const COMMON_NODES = [
  { type: 'n8n-nodes-base.webhook', name: 'Webhook' },
  { type: 'n8n-nodes-base.scheduleTrigger', name: 'Schedule' },
  { type: 'n8n-nodes-base.httpRequest', name: 'HTTP Request' },
  { type: 'n8n-nodes-base.set', name: 'Set' },
  { type: 'n8n-nodes-base.switch', name: 'Switch' },
  { type: 'n8n-nodes-base.if', name: 'If' },
  { type: 'n8n-nodes-base.code', name: 'Code' },
];

function parseN8nWorkflow(workflow: any) {
  const nodes = workflow.nodes.map((node: any) => ({
    id: node.name,
    type: 'default',
    position: { x: node.position[0], y: node.position[1] },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { 
      label: (
        <div className="flex flex-col items-center p-1">
          <div className="text-xs font-bold truncate max-w-[120px]">{node.name}</div>
          <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">{node.type.split('.').pop()}</div>
        </div>
      ),
      originalNode: node,
    },
    className: 'bg-white border-2 border-neutral-200 rounded-lg shadow-sm w-36',
  }));

  const edges: any[] = [];
  if (workflow.connections) {
    Object.keys(workflow.connections).forEach((sourceNodeName) => {
      const sourceConnections = workflow.connections[sourceNodeName];
      Object.keys(sourceConnections).forEach((outputType) => {
        const connectionsArray = sourceConnections[outputType];
        connectionsArray.forEach((targets: any[], outputIndex: number) => {
          targets.forEach((target: any) => {
            edges.push({
              id: `e-${sourceNodeName}-${target.node}-${outputIndex}`,
              source: sourceNodeName,
              target: target.node,
              animated: true,
              style: { stroke: '#f97316', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
            });
          });
        });
      });
    });
  }
  return { nodes, edges };
}

export default function WorkflowEditorScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [showPalette, setShowPalette] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editNodeData, setEditNodeData] = useState<any>(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await api.getWorkflow(id!);
        setWorkflow(res);
        const { nodes: parsedNodes, edges: parsedEdges } = parseN8nWorkflow(res);
        setNodes(parsedNodes);
        setEdges(parsedEdges);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [id]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSave = async () => {
    if (!workflow) return;
    setSaving(true);
    try {
      const updatedNodes = nodes.map(n => ({
        ...n.data.originalNode,
        position: [Math.round(n.position.x), Math.round(n.position.y)]
      }));
      
      const newConnections: any = {};
      edges.forEach(edge => {
        if (!newConnections[edge.source]) newConnections[edge.source] = { main: [[]] };
        if (!newConnections[edge.source].main[0]) newConnections[edge.source].main[0] = [];
        newConnections[edge.source].main[0].push({
          node: edge.target,
          type: "main",
          index: 0
        });
      });

      const updatedWorkflow = {
        ...workflow,
        nodes: updatedNodes,
        connections: newConnections
      };

      await api.updateWorkflow(id!, updatedWorkflow);
      setWorkflow(updatedWorkflow);
      alert('Workflow saved successfully!');
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!workflow) return;
    setSaving(true);
    try {
      const updatedWorkflow = { ...workflow, active: !workflow.active };
      await api.updateWorkflow(id!, updatedWorkflow);
      setWorkflow(updatedWorkflow);
    } catch (err: any) {
      alert(`Failed to toggle active status: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNode = (nodeTemplate: any) => {
    const newNodeId = `${nodeTemplate.name} ${Math.floor(Math.random() * 1000)}`;
    const n8nNode = {
      parameters: {},
      id: crypto.randomUUID(),
      name: newNodeId,
      type: nodeTemplate.type,
      typeVersion: 1,
      position: [250, 250],
    };

    const newReactFlowNode = {
      id: newNodeId,
      type: 'default',
      position: { x: 250, y: 250 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { 
        label: (
          <div className="flex flex-col items-center p-1">
            <div className="text-xs font-bold truncate max-w-[120px]">{newNodeId}</div>
            <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">{nodeTemplate.name}</div>
          </div>
        ),
        originalNode: n8nNode,
      },
      className: 'bg-white border-2 border-neutral-200 rounded-lg shadow-sm w-36',
    };

    setNodes((nds) => [...nds, newReactFlowNode]);
    setShowPalette(false);
  };

  const handleNodeClick = (_: any, node: any) => {
    setSelectedNodeId(node.id);
    setEditNodeData({
      name: node.data.originalNode.name,
      parameters: JSON.stringify(node.data.originalNode.parameters || {}, null, 2)
    });
  };

  const handleUpdateNode = () => {
    if (!selectedNodeId || !editNodeData) return;
    
    try {
      const parsedParams = JSON.parse(editNodeData.parameters);
      
      setNodes((nds) => nds.map(n => {
        if (n.id === selectedNodeId) {
          const updatedOriginal = {
            ...n.data.originalNode,
            name: editNodeData.name,
            parameters: parsedParams
          };
          return {
            ...n,
            id: editNodeData.name, // update ID if name changed
            data: {
              ...n.data,
              originalNode: updatedOriginal,
              label: (
                <div className="flex flex-col items-center p-1">
                  <div className="text-xs font-bold truncate max-w-[120px]">{editNodeData.name}</div>
                  <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">{updatedOriginal.type.split('.').pop()}</div>
                </div>
              )
            }
          };
        }
        return n;
      }));

      // If name changed, we also need to update edges that referenced the old name
      if (editNodeData.name !== selectedNodeId) {
        setEdges((eds) => eds.map(e => ({
          ...e,
          source: e.source === selectedNodeId ? editNodeData.name : e.source,
          target: e.target === selectedNodeId ? editNodeData.name : e.target,
        })));
      }

      setSelectedNodeId(null);
    } catch (e) {
      alert("Invalid JSON in parameters");
    }
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter(n => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 mb-4">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 relative">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-neutral-500 hover:bg-neutral-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-semibold text-sm line-clamp-1">{workflow?.name}</h2>
            <div className="flex items-center gap-2 text-[10px] text-neutral-500">
              <span className={`w-2 h-2 rounded-full ${workflow?.active ? 'bg-green-500' : 'bg-neutral-300'}`} />
              {workflow?.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleActive}
            disabled={saving}
            className={`p-2 rounded-full shadow-sm disabled:opacity-50 ${workflow?.active ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-600'}`}
            title={workflow?.active ? "Deactivate" : "Activate"}
          >
            <Power size={16} />
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="p-2 text-white bg-orange-500 rounded-full hover:bg-orange-600 shadow-sm disabled:opacity-50"
            title="Save Workflow"
          >
            <Save size={16} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#ccc" gap={16} />
          <Controls className="mb-4 mr-4" showInteractive={false} />
        </ReactFlow>

        {/* FAB for adding nodes */}
        <button 
          onClick={() => setShowPalette(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all z-10"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Node Palette Bottom Sheet */}
      {showPalette && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm" onClick={() => setShowPalette(false)}>
          <div className="bg-white w-full rounded-t-3xl p-4 pb-8 shadow-2xl transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Node</h3>
              <button onClick={() => setShowPalette(false)} className="p-2 bg-neutral-100 rounded-full text-neutral-500">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {COMMON_NODES.map(node => (
                <button 
                  key={node.type}
                  onClick={() => handleAddNode(node)}
                  className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Settings2 size={16} />
                  </div>
                  <span className="font-medium text-sm text-neutral-800">{node.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Node Bottom Sheet */}
      {selectedNodeId && editNodeData && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelectedNodeId(null)}>
          <div className="bg-white w-full rounded-t-3xl p-4 pb-8 shadow-2xl transform transition-transform flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg font-bold">Edit Node</h3>
              <div className="flex gap-2">
                <button onClick={handleDeleteNode} className="p-2 bg-red-50 rounded-full text-red-500">
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setSelectedNodeId(null)} className="p-2 bg-neutral-100 rounded-full text-neutral-500">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-4 pr-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Node Name</label>
                <input 
                  type="text" 
                  value={editNodeData.name}
                  onChange={e => setEditNodeData({...editNodeData, name: e.target.value})}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Parameters (JSON)</label>
                <textarea 
                  value={editNodeData.parameters}
                  onChange={e => setEditNodeData({...editNodeData, parameters: e.target.value})}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono text-xs h-48"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100 shrink-0">
              <button 
                onClick={handleUpdateNode}
                className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
