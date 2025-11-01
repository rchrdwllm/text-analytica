"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

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

// Simulated arXiv author network data
const generateAuthorNetwork = () => {
  // Research areas/groups
  const researchAreas = [
    "Machine Learning",
    "Quantum Physics",
    "Astrophysics",
    "Computer Vision",
    "Natural Language Processing",
    "Cryptography",
    "Condensed Matter",
    "High Energy Physics",
  ];

  // Generate realistic author names
  const firstNames = [
    "Alice",
    "Bob",
    "Carol",
    "David",
    "Emma",
    "Frank",
    "Grace",
    "Henry",
    "Isabel",
    "Jack",
    "Karen",
    "Leo",
    "Maria",
    "Nathan",
    "Olivia",
    "Peter",
    "Quinn",
    "Rachel",
    "Sam",
    "Tina",
    "Uma",
    "Victor",
    "Wendy",
    "Xavier",
    "Yuki",
    "Zoe",
    "Alex",
    "Ben",
    "Claire",
    "Dan",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Thompson",
    "White",
    "Harris",
    "Clark",
    "Lewis",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "King",
  ];

  const nodes: Node[] = [];
  const links: Link[] = [];

  // Generate 50 authors
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    nodes.push({
      id: `author${i}`,
      name: `${firstName} ${lastName}`,
      group: Math.floor(Math.random() * researchAreas.length),
      papers: Math.floor(Math.random() * 50) + 5,
      citations: Math.floor(Math.random() * 1000) + 10,
    });
  }

  // Generate collaboration links (co-authorship)
  // Authors in the same research area are more likely to collaborate
  for (let i = 0; i < nodes.length; i++) {
    const numCollaborations = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < numCollaborations; j++) {
      let targetIndex;
      // 70% chance to collaborate with someone in the same group
      if (Math.random() < 0.7) {
        const sameGroupAuthors = nodes.filter(
          (n, idx) => n.group === nodes[i].group && idx !== i
        );
        if (sameGroupAuthors.length > 0) {
          targetIndex = nodes.indexOf(
            sameGroupAuthors[
              Math.floor(Math.random() * sameGroupAuthors.length)
            ]
          );
        } else {
          targetIndex = Math.floor(Math.random() * nodes.length);
        }
      } else {
        targetIndex = Math.floor(Math.random() * nodes.length);
      }

      if (
        targetIndex !== i &&
        !links.some(
          (l) =>
            (l.source === nodes[i].id && l.target === nodes[targetIndex].id) ||
            (l.source === nodes[targetIndex].id && l.target === nodes[i].id)
        )
      ) {
        links.push({
          source: nodes[i].id,
          target: nodes[targetIndex].id,
          value: Math.floor(Math.random() * 5) + 1, // number of co-authored papers
        });
      }
    }
  }

  return { nodes, links, researchAreas };
};

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

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    const { nodes, links, researchAreas: areas } = generateAuthorNetwork();
    setResearchAreas(areas);

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
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
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
      .scaleExtent([0.5, 5])
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
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Create nodes
    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, Node>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => Math.sqrt(d.papers) + 3)
      .attr("fill", (d) => color(d.group.toString()))
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGCircleElement, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Add labels
    const label = g
      .append("g")
      .attr("class", "labels")
      .selectAll<SVGTextElement, Node>("text")
      .data(nodes)
      .join("text")
      .text((d) => d.name.split(" ")[1]) // Show last name only
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .style("pointer-events", "none")
      .attr("fill", "currentColor");

    // Add tooltips
    node
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
        setSelectedNode(d);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1.5);
      })
      .on("click", function (event, d) {
        setSelectedNode(d);
      });

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

      label.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
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
  }, [dimensions]);

  return (
    <article className="flex flex-col bg-card p-4 rounded-lg h-full">
      <div className="mb-4">
        <h2 className="font-medium text-lg">Social Network of Authors</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Node size represents number of papers, colors represent research
          areas.
        </p>
      </div>
      <div className="relative flex-1" ref={containerRef}>
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      {selectedNode && (
        <div className="bg-muted mt-4 p-3 rounded-md text-sm">
          <div className="font-semibold">{selectedNode.name}</div>
          <div className="mt-1 text-muted-foreground">
            Research Area: {researchAreas[selectedNode.group]}
          </div>
          <div className="mt-1 text-muted-foreground">
            Papers: {selectedNode.papers} | Citations: {selectedNode.citations}
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
