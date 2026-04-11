import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { InputNode } from './flow-nodes/InputNode';
import { MetaNode } from './flow-nodes/MetaNode';
import { SeoNode } from './flow-nodes/SeoNode';
import { ContentNode } from './flow-nodes/ContentNode';
import { CtaNode } from './flow-nodes/CtaNode';
import { LinksNode } from './flow-nodes/LinksNode';
import { ValidationNode } from './flow-nodes/ValidationNode';
import type { GeneratedGuideData } from './GuideFlowPreview';
import type { GuideFlowInputs } from './GuideFlowForm';

const nodeTypes: NodeTypes = {
  inputNode: InputNode,
  metaNode: MetaNode,
  seoNode: SeoNode,
  contentNode: ContentNode,
  ctaNode: CtaNode,
  linksNode: LinksNode,
  validationNode: ValidationNode,
};

// ─── Layout ───
const NODE_W = 320;
const GAP_X = 80;
const GAP_Y = 60;
const START_X = 60;
const START_Y = 60;

function buildInitialNodes(): Node[] {
  return [
    {
      id: 'input',
      type: 'inputNode',
      position: { x: START_X + 200, y: START_Y + 120 },
      data: {},
    },
  ];
}

function buildInitialEdges(): Edge[] {
  return [];
}

export function buildGeneratedLayout(data: GeneratedGuideData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let col = 0;
  let row = 0;

  const addNode = (id: string, type: string, nodeData: any, c?: number, r?: number) => {
    const x = START_X + (c ?? col) * (NODE_W + GAP_X);
    const y = START_Y + (r ?? row) * (280 + GAP_Y);
    nodes.push({ id, type, position: { x, y }, data: nodeData });
  };

  // Column 0: Meta + SEO
  addNode('meta', 'metaNode', {
    title: data.title,
    slug: data.slug,
    category: data.category,
    author_name: data.author_name,
    short_description: data.short_description,
  }, 0, 0);

  addNode('seo', 'seoNode', {
    seo_title: data.seo_title,
    seo_description: data.seo_description,
  }, 0, 1);

  // Column 1: Content sections
  const lines = data.content_markdown.split('\n');
  const sections: { title: string; content: string }[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  const flush = () => {
    const text = currentLines.join('\n').trim();
    if (text) {
      sections.push({ title: currentTitle || 'Introdução', content: text });
    }
    currentLines = [];
  };

  for (const line of lines) {
    if (/^## /.test(line)) {
      flush();
      currentTitle = line.replace(/^##\s*\*?\*?/, '').replace(/\*?\*?\s*$/, '').trim();
      currentLines.push(line);
    } else {
      currentLines.push(line);
    }
  }
  flush();

  sections.forEach((sec, i) => {
    const secId = `section-${i}`;
    addNode(secId, 'contentNode', {
      label: sec.title,
      content: sec.content,
      sectionIndex: i,
    }, 1, i);
  });

  // Column 2: CTAs
  let ctaRow = 0;
  if (data.cta_top) {
    addNode('cta_top', 'ctaNode', { ...data.cta_top, ctaType: 'Superior' }, 2, ctaRow++);
  }
  if (data.cta_middle) {
    addNode('cta_middle', 'ctaNode', { ...data.cta_middle, ctaType: 'Intermediária' }, 2, ctaRow++);
  }
  if (data.cta_final) {
    addNode('cta_final', 'ctaNode', { ...data.cta_final, ctaType: 'Final' }, 2, ctaRow++);
  }

  // Column 2 (below CTAs): Links
  if (data.internal_links.length > 0) {
    addNode('links', 'linksNode', { links: data.internal_links }, 2, ctaRow++);
  }

  // Column 3: Validation
  addNode('validation', 'validationNode', { guideData: data }, 3, 0);

  // ─── Edges ───
  edges.push({ id: 'e-meta-seo', source: 'meta', target: 'seo', animated: true, style: { stroke: 'hsl(var(--primary))' } });

  if (sections.length > 0) {
    edges.push({ id: 'e-meta-s0', source: 'meta', target: 'section-0', animated: true, style: { stroke: 'hsl(var(--primary))' } });
    for (let i = 0; i < sections.length - 1; i++) {
      edges.push({ id: `e-s${i}-s${i + 1}`, source: `section-${i}`, target: `section-${i + 1}`, style: { stroke: 'hsl(var(--primary) / 0.4)' } });
    }
  }

  // CTAs connected to content
  if (data.cta_top && sections.length > 0) {
    edges.push({ id: 'e-s0-ctatop', source: 'section-0', target: 'cta_top', style: { stroke: 'hsl(var(--accent-foreground) / 0.3)' } });
  }
  const midSection = Math.floor(sections.length / 2);
  if (data.cta_middle && sections.length > midSection) {
    edges.push({ id: 'e-smid-ctamid', source: `section-${midSection}`, target: 'cta_middle', style: { stroke: 'hsl(var(--accent-foreground) / 0.3)' } });
  }
  if (data.cta_final && sections.length > 0) {
    edges.push({ id: 'e-slast-ctafinal', source: `section-${sections.length - 1}`, target: 'cta_final', style: { stroke: 'hsl(var(--accent-foreground) / 0.3)' } });
  }

  // Links connected to last CTA or last section
  if (data.internal_links.length > 0) {
    const lastCta = data.cta_final ? 'cta_final' : data.cta_middle ? 'cta_middle' : data.cta_top ? 'cta_top' : null;
    if (lastCta) {
      edges.push({ id: 'e-cta-links', source: lastCta, target: 'links', style: { stroke: 'hsl(var(--accent-foreground) / 0.3)' } });
    }
  }

  // Validation connected to meta
  edges.push({ id: 'e-meta-validation', source: 'meta', target: 'validation', animated: true, style: { stroke: 'hsl(var(--primary) / 0.2)', strokeDasharray: '5 5' } });

  return { nodes, edges };
}

interface FlowCanvasProps {
  guideData: GeneratedGuideData | null;
  isGenerating: boolean;
  onGenerate: (inputs: GuideFlowInputs) => void;
  onGuideDataChange: (data: GeneratedGuideData) => void;
}

export function FlowCanvas({ guideData, isGenerating, onGenerate, onGuideDataChange }: FlowCanvasProps) {
  const initial = useMemo(() => {
    if (!guideData || !guideData.title) {
      return { nodes: buildInitialNodes(), edges: buildInitialEdges() };
    }
    return buildGeneratedLayout(guideData);
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // When guideData changes after generation, rebuild layout
  useEffect(() => {
    if (guideData && guideData.title) {
      const layout = buildGeneratedLayout(guideData);
      setNodes(layout.nodes);
      setEdges(layout.edges);
    }
  }, [guideData?.title]); // Only rebuild on new generation (title change)

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // Pass callbacks through node data
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => {
      if (node.type === 'inputNode') {
        return { ...node, data: { ...node.data, onGenerate, isGenerating } };
      }
      return node;
    });
  }, [nodes, onGenerate, isGenerating]);

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-[var(--admin-radius)] overflow-hidden border border-border/50 bg-background/50">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="guide-flow-canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-muted/30" />
        <Controls
          className="!bg-card !border-border !rounded-[var(--admin-radius)] !shadow-card [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-card !border-border !rounded-[var(--admin-radius)] !shadow-card"
          nodeColor="hsl(var(--primary) / 0.3)"
          maskColor="hsl(var(--background) / 0.7)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
