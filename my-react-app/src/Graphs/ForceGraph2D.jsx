import React, { useEffect, useState } from 'react';
import {ForceGraph2D} from 'react-force-graph';

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
    [[2], [1, 2, 5, 6, 9], [6, 9], [0]],
    [[3], [1, 2, 5, 7, 8], [7, 10], [0]],
    [[4], [1, 3, 4, 6, 9], [6, 9], [0]],
    [[5], [1, 3, 4, 7, 8], [7, 10], [0]],
    [[], [], [0, 1, 2, 3, 4, 5], []]
  ]
};

const ForceNetworkGraph2D = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const nodes = [];
    const links = [];

    // Add object nodes
    data.objects.forEach((obj, i) => {
      nodes.push({ id: `obj-${i}`, name: obj, group: 'object' });
    });

    // Add property nodes
    data.properties.forEach((prop, i) => {
      nodes.push({ id: `prop-${i}`, name: prop, group: 'property' });
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

    // Optionally, lattice data can also be used to define additional links or node hierarchies.

    // Set the graph data with nodes and links
    setGraphData({ nodes, links });
  }, []);

  return (
    <div>
      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeLabel="name"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={d => d.value * 0.001}
      />
    </div>
  );
};

export default ForceNetworkGraph2D;
