import { Chart } from '@antv/g2';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import * as op from 'rxjs/operators';
import { IColumn, IRow } from './interfaces';
import { colorcat20, tableau10 } from './scheme';
import * as Utils from './utils';

export { Utils }

interface IChartSpec {
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
    constructor (container: HTMLDivElement, width: number, height: number) {
        this.chart = new Chart({
            container,
            width,
            height,
            padding: [20, 20, 20, 20]
        })
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
        this.resetColorMap();
    }
    public resetColorMap () {
        this.colorMap = new Map();
        this.colorMap.set(GREY_CAT_VALUE, 'grey')
    }
    public specify (props: IChartSpec) {
        const { x$, y$, color$ = new BehaviorSubject([]), viewRawData$ } = props;
        this.chart.point().position(["x", "y"]).color("color", (c) => {
            return this.colorMap.get(c)  || tableau10[0];
        }).shape('circle');
        color$.subscribe(colors => {
            colors.forEach(c => {
                if (!this.colorMap.has(c)) {
                    this.colorMap.set(c, tableau10[this.colorMap.size % tableau10.length])
                }
            })
        })
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
