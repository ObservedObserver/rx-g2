import { Observable, from, combineLatest } from 'rxjs';
import { ObservableChart, Utils, GREY_CAT_VALUE } from '../../../src';
import { createVariable } from '../../../src/dataSource';
import { IRow, IFilter } from '../../../src/interfaces';
import * as op from 'rxjs/operators';

export const singleSelectionSpec = (container: React.RefObject<HTMLDivElement>) => {
    if (container.current) {
        const dataSource$: Observable<IRow[]> = from(fetch('/cars.json').then((res) => res.json())).pipe(op.startWith([]), op.share());

        const xVar$ = createVariable(dataSource$, 'Miles_per_Gallon');
        const yVar$ = createVariable(dataSource$, 'Horsepower');
        const colorVar$ = createVariable(dataSource$, 'Origin');

        const rxChart = new ObservableChart({
            container: container.current,
            width: 600,
            height: 400,
            padding: [40, 40, 40, 40],
        });

        const selection$ = rxChart.useSelection({
            target: 'element',
            type: 'single',
            on: 'mouseover',
        });
        const predicates$: Observable<IFilter[]> = selection$.pipe(
            op.map((rows) => [Utils.createFilter('Cylinders', 'in', rows.filter((row) => row !== null) as IRow[])])
        );
        const color$ = combineLatest([predicates$, colorVar$, dataSource$]).pipe(
            op.map(([predicates, origin, dataSource]) => {
                return dataSource.map((row, rIndex) => {
                    if (Utils.rowFilteredOut(row, predicates)) return GREY_CAT_VALUE;
                    return origin[rIndex];
                });
            })
        );

        rxChart
            .geom('point', (geo) => geo?.shape('circle').style({ stroke: null }))
            .position([xVar$, yVar$])
            .color(color$);

        rxChart.data(dataSource$);

        rxChart.render();
        return rxChart;
    }
};
