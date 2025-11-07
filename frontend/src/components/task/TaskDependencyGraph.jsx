import React, { useEffect, useRef } from 'react';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';

const TaskDependencyGraph = ({ nodes, edges }) => {
    const networkRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create nodes dataset
        const nodesDataset = new DataSet(nodes.map(node => ({
            id: node.id,
            label: node.name,
            color: {
                background: '#9ecbff',
                border: '#007bff',
                highlight: {
                    background: '#007bff',
                    border: '#0056b3'
                }
            }
        })));

        // Create edges dataset
        const edgesDataset = new DataSet(edges.map(edge => ({
            from: edge.from,
            to: edge.to,
            arrows: 'to',
            color: {
                color: '#6c757d',
                highlight: '#007bff'
            }
        })));

        // Create network
        const data = {
            nodes: nodesDataset,
            edges: edgesDataset
        };

        const options = {
            physics: {
                enabled: true,
                stabilization: {
                    iterations: 100
                }
            },
            nodes: {
                shape: 'box',
                font: {
                    size: 14,
                    face: 'Arial'
                }
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.8
                    }
                }
            },
            interaction: {
                dragNodes: true,
                dragView: true,
                zoomView: true
            }
        };

        networkRef.current = new Network(containerRef.current, data, options);

        // Cleanup
        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
            }
        };
    }, [nodes, edges]);

    return (
        <div>
            <h4>Task Dependencies</h4>
            <div 
                ref={containerRef} 
                style={{ 
                    width: '100%', 
                    height: '400px', 
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                }}
            />
        </div>
    );
};

export default TaskDependencyGraph;