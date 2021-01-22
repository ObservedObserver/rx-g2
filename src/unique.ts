export class Unique {
    private static collection: Map<string, number> | null;
    constructor () {
        if (Unique.collection === null) {
            Unique.collection = new Map();
        }
    }
    public getUniqueId(groupKey: string): string {
        if (!Unique.collection?.has(groupKey)) {
            Unique.collection?.set(groupKey, 0)
        }
        Unique.collection?.set(groupKey, Unique.collection.get(groupKey) as number + 1);
        return `${groupKey}-${Unique.collection?.get(groupKey) || 0}`;
    }
}