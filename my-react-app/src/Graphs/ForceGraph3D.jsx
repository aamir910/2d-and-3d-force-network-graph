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
    // Fetch the JSON data
    fetch('/data.json') // Note: starts from the public folder
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data
      })
      .then((jsonData) => {
        setData(jsonData); // Save the data in state
        const nodes = [];
        const links = [];
    
        const lastObjectIndex = jsonData.objects.length - 1;
    
        // Add object nodes with fixed positions for hierarchy
        jsonData.objects.forEach((obj, i) => {
          nodes.push({
            id: `obj-${i}`,
            name: obj,
            group: "object",
            fx: i === 0 ? 0 : i === lastObjectIndex ? 0 : null, // Fix x position for `obj-0` and the last object
            fy: i === 0 ? 450 : i === lastObjectIndex ? -450 : null, // Fix y position for `obj-0` and the last object
            fz: i === 250 || i === lastObjectIndex ? -250 : null, // Fix z position for `obj-0`
          });
        });
    
        // Add property nodes with flexible positions
        jsonData.properties.forEach((prop, i) => {
          nodes.push({
            id: `prop-${i}`,
            name: prop,
            group: "property",
            y: -200,
          });
        });
    
        // Add links between objects and properties based on context array
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
  }, []); // Empty dependency array means this runs once when the component mounts






  const resetNodePositions = () => {
    const nodes = [];
    const links = [];

    const lastObjectIndex = data.objects.length - 1;

    // Add object nodes with fixed positions for hierarchy
    data.objects.forEach((obj, i) => {
      nodes.push({
        id: `obj-${i}`,
        name: obj,
        group: "object",
        fx: i === 0 ? 0 : i === lastObjectIndex ? 0 : null, // Fix x position for `obj-0` and the last object
        fy: i === 0 ? 450 : i === lastObjectIndex ? -450 : null, // Fix y position for `obj-0` and the last object
        fz: i === 250 || i === lastObjectIndex ? -250 : null, // Fix z position for `obj-0`
      });
    });

    // Add property nodes with flexible positions
    data.properties.forEach((prop, i) => {
      nodes.push({
        id: `prop-${i}`,
        name: prop,
        group: "property",
        y: -200,
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
  };

  useEffect(() => {
   
  }, []);

  const lockYAxisRotation = () => {
    if (fgRef.current) {
      const controls = fgRef.current.controls();
      controls.minPolarAngle = Math.PI / 2; // Lock to horizontal view
      controls.maxPolarAngle = Math.PI / 2; // Lock to horizontal view
      controls.enablePan = true; // Disable panning
      controls.enableRotate = false;
    }
  };

  useEffect(() => {
    lockYAxisRotation(); // Call the function to lock rotation when the component mounts
  }, []); // Run only once on component mount

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
    // Prevent dragging if the node is red or purple
    if (
      node.id === "obj-0" ||
      node.id === `obj-${graphData.objects.length - 1}`
    ) {
      return false; // Prevent drag for red and purple nodes
    }
  };
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("link").distance(190); // Set link distance
      fgRef.current.d3Force("charge").strength(-550);
    }
  }, [graphData]);
  return (
    <div>
      <Button onClick={resetNodePositions} style={{ marginBottom: "10px" }}>
        Reset Nodes
      </Button>
      <Legend />
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={26} // Increase this value to make nodes larger
        nodeAutoColorBy="group"
        nodeLabel={(node) => {
          return `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`;
        }}
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={(d) => d.value * 0.001}
        backgroundColor="white"
        nodeColor={(node) => {
          if (node.id === "obj-0") return "red";
          if (node.id === `obj-${data.objects.length - 1}`) return "purple";
          return highlightNodes.has(node.id) ? "red" : "darkblue";
        }}
        linkColor={(link) => (highlightLinks.has(link) ? "red" : "grey")}
        linkWidth={(link) => (highlightLinks.has(link) ?11 : 10)}
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        backgroundColor: "white",
        marginBottom: "10px",
      }}>
      <div
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "red",
          borderRadius: "50%",
          marginRight: "8px",
        }}></div>
      <span>Starting Node</span>
      <div
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "purple",
          borderRadius: "50%",
          margin: "0 8px",
        }}></div>
      <span>Ending Node</span>
    </div>
  );
}
