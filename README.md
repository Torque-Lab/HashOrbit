# HashVector

[![npm version](https://img.shields.io/npm/v/hashvector.svg?style=flat-square)](https://www.npmjs.com/package/hashvector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Torque-Lab/HashVector/actions/workflows/ci.yml/badge.svg)](https://github.com/Torque-Lab/HashVector/actions)

A high-performance, type-safe consistent hashing library for Node.js and TypeScript. HashVector provides consistent hashing with virtual nodes, supporting multiple hashing algorithms and offering excellent key distribution across shards.

## Features

- 🚀 **High Performance**: Optimized for fast lookups and minimal memory overhead
- 🔄 **Consistent Hashing**: Evenly distributes keys across shards
- ⚡ **Virtual Nodes**: Configurable number of virtual nodes for better distribution
- 🔒 **Multiple Hash Algorithms**: Supports MD5, SHA-1, SHA-256, and SHA-512
- 📦 **TypeScript Support**: Full type definitions included
- 🎯 **Minimal Dependencies**: Lightweight with no unnecessary dependencies
- 📊 **Minimum Key Movement**: Minimizes key movement on node addition and removal by using virtual nodes
- 📊 **Key Movement Tracking**: Tracks key movement on node addition and removal

## Installation

```bash
npm install hashvector
#or
pnpm install hashvector
#or
yarn add hashvector
```

## Usage

### Basic Usage

```typescript
import ConsistentHashRing from 'hashvector';

// Create a new consistent hash ring
const ring = new ConsistentHashRing(
  ['shard1', 'shard2', 'shard3', 'shard4', 'shard5', 'shard6', 'shard7', 'shard8', 'shard9', 'shard10', 'shard11', 'shard12', 'shard13', 'shard14', 'shard15', 'shard16', 'shard17', 'shard18', 'shard19', 'shard20'], // List of shards
  160,                            // Number of virtual nodes per shard
  'sha256'                        // Hashing algorithm (optional, default: 'md5')
);

// Add a node
ring.addNode('shard21');

// Remove a node
ring.removeNode('shard1');

// Get the shard for a key
const shard = ring.get('user123');
console.log(`Key 'user123' is assigned to ${shard}`);
```

### Getting Key Distribution

```typescript
// Generate test keys
const keys: string[] = [];
for (let i = 0; i < 1_000_000; i++) {
    keys.push(`user${i}`);
}

// Get shard distribution
const distribution = ring.getKeyDistribution(keys);

console.log("Shard Distribution (based on 1,000,000 keys):\n");
for (const [shard, stats] of Object.entries(distribution)) {
    console.log(`${shard}: ${stats.count} keys (${stats.percent})`);
}
```

## API

### `new ConsistentHashRing(nodes: string[], virtualNodes = 160, algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'md5')`

Creates a new consistent hash ring.

- `nodes`: Array of node names (shards)
- `virtualNodes`: Number of virtual nodes per shard (default: 160)
- `algorithm`: Hashing algorithm to use (default: 'md5')

### Methods

#### `addNode(node: string): void`
Adds a new node to the hash ring.

#### `removeNode(node: string): void`
Removes a node from the hash ring.

#### `get(key: string): string | undefined`
Gets the node for a given key.

#### `getKeyDistribution(keys: string[] = []): Record<string, { count: number; percent: string }>`
Gets the distribution of keys across nodes.

## Performance

HashVector is designed for high performance with O(log n) lookup time, where n is the number of virtual nodes in the ring.

## License

MIT © [Mathura kumar]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
