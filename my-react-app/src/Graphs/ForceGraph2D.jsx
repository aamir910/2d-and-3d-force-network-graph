import React, { useEffect, useState, useRef } from "react";
import { ForceGraph2D } from "react-force-graph";
import { Button } from "antd";



const Lattice_2d = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [data, setData] = useState(null); // State to hold the fetched data

  const fgRef = useRef();

  const resetNodePositions = () => {
    graphData.nodes.forEach((node) => {
      if (node.id !== 'obj-0' && node.id !== `obj-${data.objects.length - 1}`) {
        node.fx = null;
        node.fy = null;
      }
    });

    if (fgRef.current) {
      fgRef.current.d3ReheatSimulation();
    }
  };
  const handleNodeDrag = (node) => {
    // Prevent dragging if the node is red or purple
    if (node.id === 'obj-0' || node.id === `obj-${graphData.objects.length - 1}`) {
      return false; // Prevent drag for red and purple nodes
    }
  };

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
            fy: i === 0 ? 100 : i === lastObjectIndex ? -100 : null, // Fix y position for `obj-0` and the last object
         // Fix z position for `obj-0`
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

  return (
    <div>
      <Button onClick={resetNodePositions} style={{ marginBottom: "2px" }}>
        Reset Nodes
      </Button>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeColor={(node) => {
          if (node.id === 'obj-0') return 'red';
          if (node.id === `obj-${data.objects.length - 1}`) return 'purple';
          return highlightNodes.has(node.id) ? 'red' : 'darkblue';
        }}
        linkColor={(link) => (highlightLinks.has(link) ? 'red' : 'grey')}
        linkWidth={(link) => (highlightLinks.has(link) ? 3 : 1.5)}
        onNodeHover={handleNodeHover}
        nodeRelSize={8} 
      onNodeDrag={handleNodeDrag} // Set the drag handler
        nodeLabel={(node) => {
          return `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`;
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleSpeed={() => 0.01}
      />
    </div>
  );
};

export default Lattice_2d;
