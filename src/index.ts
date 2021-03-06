import { Chart, Geometry } from '@antv/g2';
import { BehaviorSubject, combineLatest, from, Observable, of } from 'rxjs';
import * as op from 'rxjs/operators';
import { IColumn, IRow, RGEventStreamTarget, RGEventStreamTargetValues, RGEventStreamType, RGEventStreamTypeValues, RGSelectionProps } from './interfaces';
import { colorcat20, tableau10 } from './scheme';
import * as Utils from './utils';
import { GREY_CAT_VALUE } from './constants'
import { elementSelection } from './selection/index';
import { createEventStream, StreamPackage } from './events';

export { Utils, GREY_CAT_VALUE }

export type IGeomType = "interval" | "point" | "line" | "area";

interface IChartSpec {
    geomType: IGeomType;
    x$: Observable<any[]>;
    y$: Observable<any[]>;
    viewRawData$: Observable<IRow[]>
    color$?: Observable<any[]>;
}

interface IChartInitProps {
    container: HTMLDivElement;
    width: number;
    height: number;
    padding: [number, number, number, number]
}

export class ObservableChart {
    public chart: Chart;
    private geometry: Geometry | null;
    private colorMap: Map<any, string>;
    private geomType: IGeomType;
    private pos$: [Observable<any[]>, Observable<any[]>] | null;
    private color$: Observable<any[]> | null;
    private rawData$: Observable<IRow[]>;
    private updateCount: number;
    // private viewData$: Observable<IRow[]>;
    private eventStreams$: StreamPackage;
    constructor(props: IChartInitProps) {
        this.chart = new Chart(props);

        this.eventStreams$ = createEventStream(this.chart);

        this.colorMap = new Map();
        this.geomType = 'point';
        this.resetColorMap();
        this.pos$ = null;
        this.color$ = null;
        this.rawData$ = new BehaviorSubject([]);
        this.updateCount = 0;
        this.geometry = null;
        // this.viewData$ = new BehaviorSubject([]);
    }
    public useSelection(props: RGSelectionProps): Observable<(IRow | null)[]> {
        const { eventStreams$ } = this;
        const inverseElement$ = elementSelection.useInverseElement(eventStreams$.plot$.click$);
        const { target, type, on, closingNotifier = inverseElement$ } = props;
        if (target === RGEventStreamTarget.element) {
            const { element$ } = eventStreams$;
            const streamKey = `${on}$` as keyof typeof element$;
            if (type === 'single') {
                const cancelSelection$: Observable<IRow[]> = closingNotifier.pipe(
                    op.map(() => {
                        return [];
                    })
                );
                // return combineLatest([elementSelection.useSingleSelection(eventStreams$.element$[streamKey]), closingNotifier]);
                return elementSelection
                    .useSingleSelection(eventStreams$.element$[streamKey])
                    .pipe(op.map(s => [s]))
                    .pipe(op.merge(cancelSelection$))
                    // .pipe(op.withLatestFrom(cancelSelection$))
            }
            if (type === 'multiple') {
                const cancelSelection$: Observable<null> = closingNotifier.pipe(
                    op.map(() => null)
                );
                return elementSelection
                    .useMultipleSelection(eventStreams$.element$[streamKey], cancelSelection$)

            }
        }
        return from([])
    }
    public resetColorMap() {
        this.colorMap = new Map();
        this.colorMap.set(GREY_CAT_VALUE, 'grey');
    }
    public geom(geomType: IGeomType, adjustGeom?: (geom: Geometry | null) => void) {
        this.geomType = geomType;
        this.geometry = this.chart[geomType]();
        if (adjustGeom) {
            adjustGeom(this.geometry);
        }
        return this;
    }
    public position(pos: [Observable<any[]>, Observable<any[]>]) {
        this.pos$ = pos;
        return this;
    }
    public color(color: Observable<any[]>) {
        this.color$ = color;
    }
    public data(rawData$: Observable<IRow[]>) {
        this.rawData$ = rawData$;
    }
    render() {
        const geom = this.geometry;
        if (geom === null) {
            throw new Error('render is called before geom is set.')
        }
        if (this.pos$) {
            const [x$, y$] = this.pos$;
            const color$ = this.color$ ? this.color$ : new BehaviorSubject([]);
            const rawData$ = this.rawData$;
            geom.position(['x', 'y']);
            const viewData$ = combineLatest([x$, y$, color$, rawData$]).pipe(
                op.map(([x, y, color, viewRawData]) => {
                    color.forEach((c) => {
                        if (!this.colorMap.has(c)) {
                            this.colorMap.set(c, tableau10[(this.colorMap.size - 1 + tableau10.length) % tableau10.length]);
                        }
                    });
                    const rows: IRow[] = x.map((xi, i) => {
                        return {
                            ...viewRawData[i],
                            x: xi,
                            y: y[i],
                            color: color[i],
                        };
                    });
                    return rows;
                })
            );
            viewData$.subscribe((viewData) => {

                if (this.updateCount === 0) {
                    this.chart.data(viewData);
                    this.chart.render()
                } else {
                    this.chart.changeData(viewData);
                }
                this.updateCount++;
            });
        }
        if (this.color$) {
            geom.color('color', (c) => {
                return this.colorMap.get(c) || tableau10[0];
            });
        }
    }
    public specify(props: IChartSpec) {
        const { x$, y$, color$ = new BehaviorSubject([]), viewRawData$, geomType } = props;
        this.chart[geomType]()
            .position(['x', 'y'])
            .color('color', (c) => {
                return this.colorMap.get(c) || tableau10[0];
            })
            .shape('circle');
        color$.subscribe((colors) => {
            colors.forEach((c) => {
                if (!this.colorMap.has(c)) {
                    this.colorMap.set(c, tableau10[(this.colorMap.size - 1 + tableau10.length) % tableau10.length]);
                }
            });
        });
        const viewData$ = combineLatest([x$, y$, color$, viewRawData$]).pipe(
            op.map(([x, y, color, viewRawData]) => {
                const rows: IRow[] = x.map((xi, i) => {
                    return {
                        ...viewRawData[i],
                        x: xi,
                        y: y[i],
                        color: color[i],
                    };
                });
                return rows;
            })
        );
        viewData$.subscribe((viewData) => {
            this.chart.data(viewData);
            this.chart.render();
        });
    }
}
