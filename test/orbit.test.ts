import ConsistentHashRing from "../lib/orbit";

describe("ConsistentHashRing Key Distribution", () => {
    const ring = new ConsistentHashRing(
        [
            "shard1", "shard2", "shard3", "shard4", "shard5",
            "shard6", "shard7", "shard8", "shard9", "shard10",
            "shard11", "shard12", "shard13", "shard14", "shard15",
            "shard16", "shard17", "shard18", "shard19", "shard20"
        ],
        135,
        "sha256"
    );

    const keys: string[] = [];
    for (let i = 0; i < 1_000_000; i++) {
        keys.push(`user${i}`);
    }

    const distribution = ring.getKeyDistribution(keys);

    it("should distribute keys roughly evenly across all shards", () => {
        const shardCount = 20;
        const idealPerShard = keys.length / shardCount;
        const tolerance = idealPerShard * 0.15;
        for (const [shard, stats] of Object.entries(distribution)) {
            const count = stats.count;
            expect(count).toBeGreaterThanOrEqual(idealPerShard - tolerance);
            expect(count).toBeLessThanOrEqual(idealPerShard + tolerance);
        }
    });

    it("should include all shards in the distribution", () => {
        expect(Object.keys(distribution).length).toBe(20);
    });

    it("should return 100% total distribution", () => {
        const totalPercent = Object.values(distribution)
            .reduce((sum, stat) => sum + parseFloat(stat.percent), 0);
        expect(totalPercent).toBeGreaterThanOrEqual(99.9);
        expect(totalPercent).toBeLessThanOrEqual(100.1);
    });

    // Optional: Log distribution (for visual review)
    // it("log shard distribution (manual review)", () => {
    //     console.log("\nShard Distribution (based on 1,000,000 keys):\n");
    //     for (const [shard, stats] of Object.entries(distribution)) {
    //         console.log(`${shard}: ${stats.count} keys (${stats.percent})`);
    //     }
    // });
    function generateKeys(count: number) {
        const keys: string[] = [];
        for (let i = 0; i < count; i++) {
            keys.push(`user${i}`);
        }
        return keys;
    }

    it("should track key movement on node addition", () => {
        const node = "shard21";
        const keys = generateKeys(500000);
        const result = ring.trackKeyMovementOnAddNode(node, keys);
        console.log(result.percentMoved)
        expect(result.percentMoved).toBeLessThanOrEqual(8);
    });

    it("should track key movement on node removal", () => {
        const node = "shard1";
        const keys = generateKeys(500000);
        const result = ring.trackKeyMovementOnRemoveNode(node, keys);
        console.log(result.percentMoved)
        expect(result.percentMoved).toBeLessThanOrEqual(8);
    });
});
