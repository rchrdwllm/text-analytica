"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  fetchAuthorNetwork,
  fetchFullGraph,
  BackendNode,
  BackendLink,
} from "@/lib/author-network";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "../ui/button";
import { RotateCw } from "lucide-react";
import { Input } from "../ui/input";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: number;
  papers: number;
  citations: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

// Demo generator removed — visualization relies on backend graph data now.

const SocialNetwork = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const [researchAreas, setResearchAreas] = useState<string[]>([]);
  const [network, setNetwork] = useState<{
    nodes: BackendNode[];
    links: BackendLink[];
  } | null>(null);
  const [authorQuery, setAuthorQuery] = useState("");
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Map backend group strings to a numeric group index for color scale
  const groupIndex = (g: any) => {
    if (typeof g === "number") return g;
    if (!g) return 0;
    const s = String(g).toLowerCase();
    if (s === "author") return 0;
    if (s === "co-author") return 1;
    if (s === "paper") return 2;
    return 3;
  };

  async function loadGraphForAuthor(author: string) {
    setLoadingNetwork(true);
    setNetworkError(null);
    try {
      const json = await fetchAuthorNetwork(author);
      setNetwork({ nodes: json.nodes ?? [], links: json.links ?? [] });
    } catch (err: any) {
      setNetworkError(String(err?.message ?? err));
      setNetwork(null);
    } finally {
      setLoadingNetwork(false);
    }
  }

  async function loadFullGraph() {
    setLoadingNetwork(true);
    setNetworkError(null);
    try {
      const json = await fetchFullGraph();
      setNetwork({ nodes: json.nodes ?? [], links: json.links ?? [] });
    } catch (err: any) {
      setNetworkError(String(err?.message ?? err));
      setNetwork(null);
    } finally {
      setLoadingNetwork(false);
    }
  }

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    // Only render when we have backend data. Clear SVG and show nothing while loading.
    if (
      !network ||
      !Array.isArray(network.nodes) ||
      !Array.isArray(network.links)
    ) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const nodesData: Node[] = network.nodes.map(
      (n) =>
        ({
          id: n.id,
          name: (n.name as string) ?? n.id,
          group: groupIndex(n.group),
          papers: Number(n.paper_count ?? 0),
          citations: Number(n.citations ?? 0),
        } as Node)
    );

    let linksData: Link[] = network.links.map(
      (l) =>
        ({
          source: String(l.source),
          target: String(l.target),
          value: Number(l.value ?? 1),
        } as Link)
    );

    // keep current research area labels (backend doesn't provide them)
    setResearchAreas(researchAreas);

    // Sanitize links: remove any links that reference missing node ids (avoids d3 "node not found" errors)
    const nodeIdSet = new Set(nodesData.map((n) => n.id));
    linksData = linksData.filter(
      (l) => nodeIdSet.has(String(l.source)) && nodeIdSet.has(String(l.target))
    );

    // Ensure nodes have initial x/y positions so drag/zoom won't create NaN positions
    // (some backend subgraphs may come without x/y set and d3 drag will then set fx/fy to undefined)
    nodesData.forEach((n, i) => {
      if (n.x == null || Number.isNaN(n.x as number)) {
        // small jitter so nodes don't start exactly on top of each other
        n.x = dimensions.width / 2 + (Math.random() - 0.5) * 50;
      }
      if (n.y == null || Number.isNaN(n.y as number)) {
        n.y = dimensions.height / 2 + (Math.random() - 0.5) * 50;
      }
    });

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height]);

    // Create color scale for different research areas
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the simulation
    const simulation = d3
      .forceSimulation(nodesData)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(linksData)
          .id((d) => d.id)
          .distance(50)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
      )
      .force("collision", d3.forceCollide().radius(20));

    // Create container for zoom
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create links
    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll<SVGLineElement, Link>("line")
      .data(linksData)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt((d as any).value));

    // Create nodes
    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, Node>("circle")
      .data(nodesData)
      .join("circle")
      .attr("r", (d: any) => Math.sqrt((d as any).papers) + 3)
      .attr("fill", (d: any) => color(String((d as any).group)))
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as unknown as any
      );

    // Add labels
    const label = g
      .append("g")
      .attr("class", "labels")
      .selectAll<SVGTextElement, Node>("text")
      .data(nodesData)
      .join("text")
      .text(
        (d: any) =>
          ((d.name || d.id) as string).split(" ")[1] ?? (d.name || d.id)
      ) // Show last name only when available
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .style("pointer-events", "none")
      .attr("fill", "currentColor");

    // Add tooltips
    node
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
        setSelectedNode(d as Node);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1.5);
      })
      .on("click", function (event, d) {
        setSelectedNode(d as Node);
      });

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as any as Node).x!)
        .attr("y1", (d: any) => (d.source as any as Node).y!)
        .attr("x2", (d: any) => (d.target as any as Node).x!)
        .attr("y2", (d: any) => (d.target as any as Node).y!);

      node
        .attr("cx", (d: any) => (d as any).x!)
        .attr("cy", (d: any) => (d as any).y!);

      label
        .attr("x", (d: any) => (d as any).x!)
        .attr("y", (d: any) => (d as any).y!);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      // If the node has no x/y yet, fall back to the pointer coordinates so
      // fx/fy are numeric (avoids NaN positions which make the graph disappear).
      // Use == null to catch both null and undefined.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - event.subject may be typed loosely by d3, we just need numeric coords
      event.subject.fx =
        event.subject.x == null
          ? (event.x as number)
          : (event.subject.x as number);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.subject.fy =
        event.subject.y == null
          ? (event.y as number)
          : (event.subject.y as number);
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [dimensions, network]);

  // load full graph when component mounts
  useEffect(() => {
    loadFullGraph();
  }, []);

  return (
    <article className="flex flex-col bg-card p-4 rounded-lg h-full">
      <div className="mb-4">
        <h2 className="font-medium text-lg">Social Network of Authors</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Node size represents number of papers
        </p>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Author name (exact)"
            value={authorQuery}
            onChange={(e) => setAuthorQuery(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => loadGraphForAuthor(authorQuery)}
            disabled={loadingNetwork}
          >
            {loadingNetwork ? (
              "Loading..."
            ) : (
              <>
                <RotateCw /> Load graph for author
              </>
            )}
          </Button>
          <Button onClick={() => loadFullGraph()} disabled={loadingNetwork}>
            <RotateCw /> Refresh full graph
          </Button>
          {networkError && (
            <div className="ml-2 text-red-500 text-xs">{networkError}</div>
          )}
        </div>
      </div>
      <div className="relative flex-1" ref={containerRef}>
        <svg ref={svgRef} className="w-full h-full" />
        {loadingNetwork && (
          <div className="z-10 absolute inset-0 flex justify-center items-center">
            <Spinner className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </div>
      {selectedNode && (
        <div className="bg-muted mt-4 p-3 rounded-md text-sm">
          <div className="font-semibold">{selectedNode.name}</div>
          <div className="mt-1 text-muted-foreground">
            Papers: {selectedNode.papers}
          </div>
        </div>
      )}
      <div className="mt-4 text-muted-foreground text-xs">
        <p>💡 Drag nodes to rearrange | Scroll to zoom | Hover for details</p>
      </div>
    </article>
  );
};

export default SocialNetwork;
