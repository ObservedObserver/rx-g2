import { Chart } from '@antv/g2';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import * as op from 'rxjs/operators';
import { IColumn, IRow } from './interfaces';
import { colorcat20, tableau10 } from './scheme';
import * as Utils from './utils';

export { Utils }

export type IGeomType = "interval" | "point" | "line" | "area";

interface IChartSpec {
    geomType: IGeomType;
    x$: Observable<any[]>;
    y$: Observable<any[]>;
    viewRawData$: Observable<IRow[]>
    color$?: Observable<any[]>;
}

export const GREY_CAT_VALUE = '__not_focus__';

export class ObservableChart {
    public chart: Chart;
    public selection$: BehaviorSubject<any[]>;
    private colorMap: Map<any, string>;
    private geomType: IGeomType;
    private pos$: [Observable<any[]>, Observable<any[]>] | null;
    private color$: Observable<any[]> | null;
    private rawData$: Observable<IRow[]>;
    constructor(container: HTMLDivElement, width: number, height: number) {
        this.chart = new Chart({
            container,
            width,
            height,
            padding: [20, 20, 20, 20],
        });
        this.selection$ = new BehaviorSubject([] as any[]);

        this.chart.on("element:mouseover", (e: any) => {
            const ele = e.target.get("element");
            const model = ele.getModel();
            if (model) {
                const data = model.data;
                this.selection$.next([data]);
            }
        });
        this.colorMap = new Map();
        this.geomType = 'point';
        this.resetColorMap();
        this.pos$ = null;
        this.color$ = null;
        this.rawData$ = new BehaviorSubject([]);
    }
    public resetColorMap() {
        this.colorMap = new Map();
        this.colorMap.set(GREY_CAT_VALUE, "grey");
    }
    public geom(geomType: IGeomType) {
        this.geomType = geomType;
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
        const geom = this.chart[this.geomType]();
        if (this.pos$) {
            const [x$, y$] = this.pos$;
            const color$ = this.color$ ? this.color$ : new BehaviorSubject([]);
            const rawData$ = this.rawData$;
            geom.position(["x", "y"]);
            const viewData$ = combineLatest([
                x$,
                y$,
                color$,
                rawData$,
            ]).pipe(
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
        if (this.color$) {
            geom.color("color", (c) => {
                return this.colorMap.get(c) || tableau10[0];
            });
            this.color$.subscribe((colors) => {
                colors.forEach((c) => {
                    if (!this.colorMap.has(c)) {
                        this.colorMap.set(
                            c,
                            tableau10[this.colorMap.size % tableau10.length]
                        );
                    }
                });
            });
        }
    }
    public specify(props: IChartSpec) {
        const {
            x$,
            y$,
            color$ = new BehaviorSubject([]),
            viewRawData$,
            geomType
        } = props;
        this.chart[geomType]()
            .position(["x", "y"])
            .color("color", (c) => {
                return this.colorMap.get(c) || tableau10[0];
            })
            .shape("circle");
        color$.subscribe((colors) => {
            colors.forEach((c) => {
                if (!this.colorMap.has(c)) {
                    this.colorMap.set(
                        c,
                        tableau10[this.colorMap.size % tableau10.length]
                    );
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
