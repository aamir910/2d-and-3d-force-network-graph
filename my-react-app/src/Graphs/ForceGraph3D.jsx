import React, { useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { Button } from "antd";

const data = {
  objects: ["1sg", "1pl", "2sg", "2pl", "3sg", "3pl"],
  properties: ["+1", "-1", "+2", "-2", "+3", "-3", "+sg", "+pl", "-sg", "-pl"],
  context: [
    [0, 3, 5, 6, 9],
    [0, 3, 5, 7, 8],
    [1, 2, 5, 6, 9],
    [1, 2, 5, 7, 8],
    [1, 3, 4, 6, 9],
    [1, 3, 4, 7, 8]
  ],
  lattice: [
    [[], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 5, 6], []],
    [[0], [0, 3, 5, 6, 9], [7, 8, 9], [0]],
    [[1], [0, 3, 5, 7, 8], [7, 10, 11], [0]],
    [[2], [1, 2, 5, 6, 9], [8, 12, 13], [0]],
    [[3], [1, 2, 5, 7, 8], [10, 12, 14], [0]],
    [[4], [1, 3, 4, 6, 9], [9, 13, 15], [0]],
    [[5], [1, 3, 4, 7, 8], [11, 14, 15], [0]],
    [[0, 1], [0, 3, 5], [18, 19], [1, 2]],
    [[0, 2], [5, 6, 9], [16, 18], [1, 3]],
    [[0, 4], [3, 6, 9], [16, 19], [1, 5]],
    [[1, 3], [5, 7, 8], [17, 18], [2, 4]],
    [[1, 5], [3, 7, 8], [17, 19], [2, 6]],
    [[2, 3], [1, 2, 5], [18, 20], [3, 4]],
    [[2, 4], [1, 6, 9], [16, 20], [3, 5]],
    [[3, 5], [1, 7, 8], [17, 20], [4, 6]],
    [[4, 5], [1, 3, 4], [19, 20], [5, 6]],
    [[0, 2, 4], [6, 9], [21], [8, 9, 13]],
    [[1, 3, 5], [7, 8], [21], [10, 11, 14]],
    [[0, 1, 2, 3], [5], [21], [7, 8, 10, 12]],
    [[0, 1, 4, 5], [3], [21], [7, 9, 11, 15]],
    [[2, 3, 4, 5], [1], [21], [12, 13, 14, 15]],
    [[0, 1, 2, 3, 4, 5], [], [], [18, 19, 20, 16, 17]]
  ]
};

const ForceNetworkGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const fgRef = useRef();

  const resetNodePositions = () => {
    graphData.nodes.forEach((node) => {
      node.fx = null; // Free the x-axis position
      node.fy = null; // Free the y-axis position
      node.fz = null; // Free the z-axis position (for 3D)
    });

    if (fgRef.current) {
      fgRef.current.d3ReheatSimulation();
    }
  };

  useEffect(() => {
    const nodes = [];
    const links = [];

    // Add object nodes with fixed positions for hierarchy
    data.objects.forEach((obj, i) => {
      nodes.push({
        id: `obj-${i}`,
        name: obj,
        group: "object",
        y: i === 0 ? 200 : 0 // Top node positioned higher
      });
    });

    // Add property nodes with flexible positions
    data.properties.forEach((prop, i) => {
      nodes.push({
        id: `prop-${i}`,
        name: prop,
        group: "property",
        y: -100
      });
    });

    // Add links between objects and properties based on context array
    data.context.forEach((contextArray, objIndex) => {
      contextArray.forEach((propIndex) => {
        links.push({
          source: `obj-${objIndex}`,
          target: `prop-${propIndex}`,
        });
      });
    });

    setGraphData({ nodes, links });
    
  }, []);

  const handleNodeHover = (node) => {
    const connectedLinks = new Set();
    const connectedNodes = new Set();

    if (node) {
      graphData.links.forEach((link) => {
        if (link.source.id === node.id || link.target.id === node.id) {
          connectedLinks.add(link);
          connectedNodes.add(link.source.id);
          connectedNodes.add(link.target.id);
        }
      });
    }

    setHighlightLinks(connectedLinks);
    setHighlightNodes(connectedNodes);
  };

  const handlePointerMove = (e) => {
    if (fgRef.current) {
      const { clientX, clientY } = e;
      const { camera } = fgRef.current;

      // Rotate camera around the Y-axis
      const deltaX = clientX - window.innerWidth / 2;
      const rotationSpeed = 0.005; // Adjust this value for rotation speed
      camera.rotation.y += deltaX * rotationSpeed;
      fgRef.current.camera.position.set(0, 0, 300); // Set fixed distance from the graph
      fgRef.current.camera.lookAt(0, 0, 0); // Always look at the center
    }
  };

  return (
    <div>
      <Button onClick={resetNodePositions} style={{ marginBottom: "10px" }}>
        Reset Nodes
      </Button>
      <div
        onPointerMove={handlePointerMove}
        style={{ width: "100%", height: "500px", position: "relative" }}
      >
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          nodeAutoColorBy="group"
          nodeLabel={(node) => {
            return `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`;
          }}
          linkDirectionalParticles={3}
          linkDirectionalParticleSpeed={(d) => d.value * 0.001}
          backgroundColor="white"
          nodeColor={(node) => (highlightNodes.has(node.id) ? "red" : "darkblue")}
          linkColor={(link) => (highlightLinks.has(link) ? "red" : "grey")}
          linkWidth={(link) => (highlightLinks.has(link) ? 3 : 2)}
          onNodeHover={handleNodeHover}
          onNodeDragEnd={(node) => {
            // Fix the position after dragging
            node.fx = node.x;  // Fix X position
            node.fy = node.__initialY || node.y; // Keep Y fixed
            node.fz = node.z;  // Fix Z position if desired
          }}
          onNodeDrag={(node) => {
            // Lock the Y position
            node.y = node.__initialY || node.y; // Ensure Y remains fixed
            // Allow movement in X and Z directions
            node.fx = node.x; // Allow moving along X axis
            node.fz = node.z; // Optionally allow movement along Z axis
          }}
        />
      </div>
    </div>
  );
};

export default ForceNetworkGraph;
