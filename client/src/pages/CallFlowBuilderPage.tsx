import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { contactCenterService } from '../services/contact-center.service';

export default function CallFlowBuilderPage() {
  const navigate = useNavigate();
  const [flowName, setFlowName] = useState('New Call Flow');
  const [description, setDescription] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);

  const initialNodes: Node[] = [
    {
      id: 'start',
      type: 'input',
      data: { label: '📞 Start' },
      position: { x: 250, y: 50 },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds)),
    [setEdges]
  );

  const nodeTypes = [
    { type: 'ivr', label: '🔢 IVR Menu', icon: '🔢' },
    { type: 'queue', label: '⏰ Queue', icon: '⏰' },
    { type: 'agent', label: '👤 Agent', icon: '👤' },
    { type: 'voicemail', label: '📧 Voicemail', icon: '📧' },
    { type: 'transfer', label: '📞 Transfer', icon: '📞' },
    { type: 'time-condition', label: '🕐 Time Condition', icon: '🕐' },
    { type: 'skill-check', label: '🎯 Skill Check', icon: '🎯' },
    { type: 'hangup', label: '❌ Hangup', icon: '❌' },
  ];

  const addNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      data: { label: `${label}` },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 150 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowNodeConfig(true);
  };

  const saveCallFlow = async () => {
    if (!flowName.trim()) {
      alert('Please enter a flow name');
      return;
    }

    const callFlow = {
      name: flowName,
      description: description || `Call flow created on ${new Date().toLocaleDateString()}`,
      isActive: false,
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type || 'default',
        label: n.data.label,
        config: {},
        position: n.position,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };

    try {
      await contactCenterService.createCallFlow(callFlow);
      alert('✅ Call flow saved successfully!');
      navigate('/contact-center');
    } catch (error) {
      console.error('Error saving call flow:', error);
      alert('Error saving call flow. Please try again.');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'transparent',
              border: 'none',
              color: 'white',
              outline: 'none',
              marginBottom: '8px',
            }}
          />
          <br />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'white',
              width: '400px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/contact-center')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveCallFlow}
            style={{
              padding: '8px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            💾 Save Flow
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Node Palette */}
        <div style={{
          width: '200px',
          borderRight: '1px solid #ddd',
          padding: '16px',
          backgroundColor: '#f9fafb',
          overflowY: 'auto',
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>📦 Components</h3>
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => addNode(nodeType.type, nodeType.label)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {nodeType.icon} {nodeType.type}
            </button>
          ))}
        </div>

        {/* Flow Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>

          {/* Instructions Overlay */}
          {nodes.length === 1 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              color: '#9ca3af',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Start Building Your Call Flow</h3>
              <p>Drag components from the left panel to build your call flow</p>
              <p>Connect nodes by dragging from one node to another</p>
            </div>
          )}
        </div>

        {/* Node Configuration Panel */}
        {showNodeConfig && selectedNode && (
          <div style={{
            width: '300px',
            borderLeft: '1px solid #ddd',
            padding: '16px',
            backgroundColor: '#f9fafb',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>⚙️ Configure Node</h3>
              <button
                onClick={() => setShowNodeConfig(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Node Label
              </label>
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, data: { ...node.data, label: e.target.value } }
                        : node
                    )
                  );
                  setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: e.target.value } });
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Node Type
              </label>
              <div style={{
                padding: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
              }}>
                {selectedNode.type || 'default'}
              </div>
            </div>

            <button
              onClick={() => {
                setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
                setShowNodeConfig(false);
                setSelectedNode(null);
              }}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '16px',
              }}
            >
              🗑️ Delete Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
