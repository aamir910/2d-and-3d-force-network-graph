import React, { useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { Button } from "antd";

const Lattice_3d = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const fgRef = useRef();
  const [data, setData] = useState(null); // State to hold the fetched data

  useEffect(() => {
    fetch('/data.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        const nodes = [];
        const links = [];
        const lastObjectIndex = jsonData.objects.length - 1;

        jsonData.objects.forEach((obj, i) => {
          nodes.push({
            id: `obj-${i}`,
            name: obj,
            group: "object",
            fx: 0,
            fy: i === 0 ? 450 : i === lastObjectIndex ? -450 : null, // Fix top and bottom nodes
            fz: 0,
            level: i, // Assign level for horizontal alignment
          });
        });

        jsonData.properties.forEach((prop, i) => {
          nodes.push({
            id: `prop-${i}`,
            name: prop,
            group: "property",
            level: Math.floor(lastObjectIndex / 2), // Position in the middle
          });
        });

        jsonData.context.forEach((contextArray, objIndex) => {
          contextArray.forEach((propIndex) => {
            links.push({
              source: `obj-${objIndex}`,
              target: `prop-${propIndex}`,
            });
          });
        });

        setGraphData({ nodes, links });
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []);

  const resetNodePositions = () => {
    const nodes = [];
    const links = [];
    const lastObjectIndex = data.objects.length - 1;

    data.objects.forEach((obj, i) => {
      nodes.push({
        id: `obj-${i}`,
        name: obj,
        group: "object",
        fx: 0,
        fy: i === 0 ? 450 : i === lastObjectIndex ? -450 : null,
        fz: 0,
        level: i,
      });
    });

    data.properties.forEach((prop, i) => {
      nodes.push({
        id: `prop-${i}`,
        name: prop,
        group: "property",
        level: Math.floor(lastObjectIndex / 2),
      });
    });

    data.context.forEach((contextArray, objIndex) => {
      contextArray.forEach((propIndex) => {
        links.push({
          source: `obj-${objIndex}`,
          target: `prop-${propIndex}`,
        });
      });
    });

    setGraphData({ nodes, links });
  };

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("link").distance(200);
      fgRef.current.d3Force("charge").strength(-400);
      fgRef.current.d3Force("center").strength(0.1); // Optimize space usage
    }
  }, [graphData]);

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

  const handleNodeDrag = (node) => {
    if (node.id === "obj-0" || node.id === `obj-${graphData.nodes.length - 1}`) {
      return false;
    }
  };

  const lockYAxisRotation = () => {
    if (fgRef.current) {
      const controls = fgRef.current.controls();
      controls.minPolarAngle = Math.PI / 2;
      controls.maxPolarAngle = Math.PI / 2;
      controls.enableRotate = false;
    }
  };

  useEffect(() => {
    lockYAxisRotation();
  }, []);

  return (
    <div>
      <Button onClick={resetNodePositions} style={{ marginBottom: "10px" }}>
        Reset Nodes
      </Button>
      <Legend />
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={26}
        nodeAutoColorBy="group"
        nodeLabel={(node) => `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`}
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={(d) => d.value * 0.001}
        backgroundColor="white"
        nodeThreeObjectExtend={true}
        nodeThreeObject={(node) => {
          const color = node.id === "obj-0" ? "red" : node.id === `obj-${data.objects.length - 1}` ? "purple" : "darkblue";
          return new THREE.Mesh(
            new THREE.SphereGeometry(15, 32, 32),
            new THREE.MeshBasicMaterial({ color })
          );
        }}
        linkColor={(link) => (highlightLinks.has(link) ? "red" : "grey")}
        linkWidth={(link) => (highlightLinks.has(link) ? 11 : 10)}
        onNodeHover={handleNodeHover}
        onNodeDrag={handleNodeDrag}
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.__initialY || node.y;
          node.fz = node.z;
        }}
      />
    </div>
  );
};

export default Lattice_3d;

function Legend() {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "white", marginBottom: "10px" }}>
      <div style={{ width: "12px", height: "12px", backgroundColor: "red", borderRadius: "50%", marginRight: "8px" }}></div>
      <span>Starting Node</span>
      <div style={{ width: "12px", height: "12px", backgroundColor: "purple", borderRadius: "50%", margin: "0 8px" }}></div>
      <span>Ending Node</span>
    </div>
  );
}
