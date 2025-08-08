import crypto from "crypto";

export default class ConsistentHashRing {
   private ring: Map<string, string>;
   private sortedKeys: string[];
   private virtualNodes: number;
   private algorithm: "md5" | "sha1" | "sha256" | "sha512";
    constructor(nodes: string[], virtualNodes = 135, algorithm: "md5" | "sha1" | "sha256" | "sha512" = "sha256") {
        this.ring = new Map();
        this.sortedKeys = [];
        this.virtualNodes = virtualNodes;
        this.algorithm = algorithm;

        nodes.forEach((node) => {
            for (let i = 0; i < virtualNodes; i++) {
                const vNodeName = `${node}#${i}`;
                const vHash = this.convertToHash(vNodeName);
                this.ring.set(vHash, node);
                this.sortedKeys.push(vHash);
            }
        });
        this.sortedKeys.sort((a, b)=>a.localeCompare(b));
    }

    private convertToHash(key: string) {
        return crypto.createHash(this.algorithm).update(key).digest("hex");
    }

    public get(key: string) {
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

        return this.ring.get(targetHash || "");
    }

    public getRing() {
        return this.ring;
    }
    public getSortedKeys() {
        return this.sortedKeys;
    }
    public getVirtualNodes() {
        return this.virtualNodes;
    }
    public getAlgorithm() {
        return this.algorithm;
    }
   
    public getPhysicalNodes(): string[] {
        return Array.from(new Set(this.ring.values()));
    }
    public addNode(node: string) {
        for (let i = 0; i < this.virtualNodes; i++) {
            const vNodeName = `${node}#${i}`;
            const vHash = this.convertToHash(vNodeName);
            this.ring.set(vHash, node);
            this.sortedKeys.push(vHash);
        }
        this.sortedKeys.sort((a, b)=>a.localeCompare(b));
    }

    public removeNode(node: string) {
        for (let i = 0; i < this.virtualNodes; i++) {
            const vNodeName = `${node}#${i}`;
            const vHash = this.convertToHash(vNodeName);
            this.ring.delete(vHash);
            this.sortedKeys = this.sortedKeys.filter((key) => key !== vHash);
        }
    }

    public getKeyDistribution(keys: string[] = []) {
        const countMap: Map<string, number> = new Map();

        for (const key of keys) {
            const node = this.get(key);
            countMap.set(node!, (countMap.get(node!) || 0) + 1);
        }

        const total = keys.length;
        const distribution: Record<string, { count: number; percent: string }> = {};

        for (const [node, count] of countMap.entries()) {
            distribution[node!] = {
                count,
                percent: ((count / total) * 100).toFixed(2) + "%"
            };
        }

        return distribution;
    }
    public trackKeyMovementOnAddNode(node: string, keys: string[]) {
        const oldMapping = new Map<string, string>();
        
        for (const key of keys) {
            const currentNode = this.get(key) || "";
            oldMapping.set(key, currentNode);
        }
        this.addNode(node);
        
        const changedKeys: string[] = [];
        const movement:{[key:string]:{oldNode:string ,newNode:string}}={}
        
        for (const key of keys) {
            const newNode = this.get(key) || "";
            if (oldMapping.get(key) !== newNode) {
                changedKeys.push(key);
                movement[key]={oldNode:oldMapping.get(key)!,newNode}
            }
        }
    
        const totalMovedKeys = changedKeys.length;
        const percentMoved = Number(((totalMovedKeys / keys.length) * 100).toFixed(2));

    
        return {
            movement,
            changedKeys,
            totalMovedKeys,
            percentMoved,
        };
    }
    public trackKeyMovementOnRemoveNode(node: string, keys: string[]) {
        const oldMapping=new Map<string, string>();
        for (const key of keys) {
            oldMapping.set(key, this.get(key) || "");
        }
        this.removeNode(node); 
        const changedKeys: string[] = [];
        const movement:{[key:string]:{oldNode:string ,newNode:string}}={}
        for (const key of keys) {
            const newNode = this.get(key) || "";
            if (oldMapping.get(key) !== newNode) {
                changedKeys.push(key);
                movement[key]={oldNode:oldMapping.get(key)!,newNode}
            }
        }
        const totalMovedkeys = changedKeys.length;
        const percentMoved = Number(((totalMovedkeys / keys.length) * 100).toFixed(2));
        return {movement,changedKeys,totalMovedkeys, percentMoved};
    }
    
}
