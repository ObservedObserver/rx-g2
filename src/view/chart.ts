import { Chart, registerGeometry, View } from '@antv/g2';
import { combineLatest, Observable, Subject } from 'rxjs';
import * as op from 'rxjs/operators'
import { RxGeometry } from '../geometry/base';
import { RxPoint } from '../geometry/point';
import { IRow } from '../interfaces';

registerGeometry('rxPoint', RxPoint);

export class RxChart extends Chart {
    // TODO: GeomClass as constructor.
    private data$: Observable<IRow[]> = new Subject();
    public geom<G extends RxGeometry>(GeomClass: any, config?: any): G {
        const props = {
            /** 图形容器 */
            container: this.middleGroup.addGroup(),
            labelsContainer: this.foregroundGroup.addGroup(),
            ...config,
        };

        const geometry = new GeomClass(props);
        this.geometries.push(geometry);
        return geometry;
    }

    public stream (dataSource: Observable<IRow[]>) {
        this.data$ = dataSource;
        return this;
    }

    public render() {
        const unionMap: Map<string, Observable<any>> = new Map();
        // TODO: 考虑多view嵌套
        for (let geom of this.geometries) {
            if (geom instanceof RxGeometry) {
                const rxMap = geom.rxVarsCollection;
                for (let [rxKey, rxVar] of rxMap) {
                    unionMap.set(rxKey, rxVar);
                }
            }
        }

        const data$ = this.data$;

        const rxVarEntries: [string, Observable<any[]>][] = [...unionMap.entries()];

        const viewData$ = combineLatest([data$, ...rxVarEntries.map(r => r[1])]).pipe(
            op.map(flow => {
                const [data, ...rxVars] = flow;
                const viewData = data.map((row, rIndex) => {
                    const viewRow: IRow = { ...row };
                    rxVars.forEach((rxVar, rxIndex) => {
                        viewRow[rxVarEntries[rxIndex][0]] = rxVar[rIndex];
                    })
                    return viewRow;
                })
                return viewData;
            })
        )
        console.log('render')
        viewData$.subscribe(viewData => {
            console.log(viewData)
            this.data(viewData);
            super.render();
        })
    }
}

