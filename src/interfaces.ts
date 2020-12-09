export interface IRow {
    [key: string]: any
}

export interface IColumn {
    id: string
}

export type IFilter = {
    field: string;
    type: 'in',
    domain: any[]
} | {
    field: string;
    type: 'inRange';
    domain: [number, number]
}