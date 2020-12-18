import { Observable } from "rxjs";

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

export const RGEventStreamType = {
    click: 'click',
    mouseover: 'mouseover',
    mouseenter: 'mouseenter',
    mouseleave: 'mouseleave'
} as const;

export type RGEventStreamTypeValues = typeof RGEventStreamType[keyof typeof RGEventStreamType]

export const RGEventStreamTarget = {
    element: 'element',
    plot: 'plot'
} as const;

export type RGEventStreamTargetValues = typeof RGEventStreamTarget[keyof typeof RGEventStreamTarget];

export interface RGSelectionProps {
    target: RGEventStreamTargetValues;
    type: 'single' | 'multiple';
    on: RGEventStreamTypeValues;
    closingNotifier?: Observable<any>;
}