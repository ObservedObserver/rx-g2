import { IFilter, IRow } from "./interfaces";

export function createFilter (field: string, type: IFilter['type'], rows: IRow[]): IFilter {
    const values = rows.map(r => r[field]);
    if (type === 'in') return {
        field,
        type: 'in',
        domain: values
    }
    const safeValues: number[] = values.filter(v => typeof v === 'number')
    return {
        field,
        type: 'inRange',
        domain: [
            Math.min(...safeValues),
            Math.max(...safeValues)
        ]
    }
}

export function rowFilteredOut (row: IRow, filters: IFilter[]): boolean {
    return !filters.every(f => {
        if (f.type === 'in') return f.domain.includes(row[f.field])
        return f.domain[0] <= row[f.field] && row[f.field] < f.domain[1]
    })
}

export function applyFilter (rows: IRow[], filters: IFilter[]): IRow[] {
    return rows.filter(row => {
        return !rowFilteredOut(row, filters)
    })
}