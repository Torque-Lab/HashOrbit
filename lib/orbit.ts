import crypto from "crypto";

class ConsistentHashRing {
    ring: Map<string, string>;
    sortedKeys: string[];
    virtualNodes: number;
    constructor(nodes: string[], virtualNodes = 100) {
        this.ring = new Map();
        this.sortedKeys = [];
        this.virtualNodes = virtualNodes;

        nodes.forEach((node) => {
            for (let i = 0; i < virtualNodes; i++) {
                const vNodeName = `${node}#${i}`;
                const hash = this.convertToHash(vNodeName);
                this.ring.set(hash, node);
                this.sortedKeys.push(hash);
            }
        });

        this.sortedKeys.sort((a, b) => a.localeCompare(b));
    }

    convertToHash(key: string) {
        return crypto.createHash("md5").update(key).digest("hex");
    }

    getNode(key: string) {
        const keyHash = this.convertToHash(key);
        let low = 0;
        let high = this.sortedKeys.length - 1;
        let resultIndex = -1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midHash = this.sortedKeys[mid] || "";

            if (keyHash < midHash) {
                resultIndex = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        const targetHash =
            resultIndex === -1
                ? this.sortedKeys[0]
                : this.sortedKeys[resultIndex];

        return this.ring.get(targetHash!);
    }

    getKeyDistribution(keys: string[] = []) {
        const countMap = new Map();

        for (const key of keys) {
            const node = this.getNode(key);
            countMap.set(node, (countMap.get(node) || 0) + 1);
        }

        const total = keys.length;
        const distribution: Record<string, { count: number; percent: string }> = {};

        for (const [node, count] of countMap.entries()) {
            distribution[node] = {
                count,
                percent: ((count / total) * 100).toFixed(2) + "%"
            };
        }

        return distribution;
    }
}

const ring = new ConsistentHashRing(
    ["shard1", "shard2", "shard3", "shard4", "shard5", "shard6", "shard7", "shard8", "shard9", "shard10"],
    100
);

const keys: string[] = [];
for (let i = 0; i < 100000; i++) {
    keys.push(`user${i}`);
}

const distribution = ring.getKeyDistribution(keys);

console.log("Shard Distribution (based on 100,000 keys):\n");
for (const [shard, stats] of Object.entries(distribution)) {
    console.log(`${shard}: ${stats.count} keys (${stats.percent})`);
}
