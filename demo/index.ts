import { from, Observable } from 'rxjs';
import { createVariable } from '../src/dataSource';
import { GREY_CAT_VALUE, ObservableChart, Utils } from '../src/index';
import * as op from "rxjs/operators";
import { IFilter, IRow, RGEventStreamTarget } from '../src/interfaces';

const root = document.querySelector('#root');

if (root) {
    const chartContainer: HTMLDivElement = document.createElement("div");
    chartContainer.setAttribute('style', 'width: 400px; height: 300px;')
    root.appendChild(chartContainer);

    const dataSource$: Observable<IRow[]> = from(fetch("/cars.json").then((res) => res.json())).pipe(
        op.startWith([])
    );

    const xVar$ = createVariable(dataSource$, "Miles_per_Gallon");
    const yVar$ = createVariable(dataSource$, "Horsepower");
    const colorVar$ = createVariable(dataSource$, 'Origin')

    const rxChart = new ObservableChart({ 
        container: chartContainer,
        width: 600,
        height: 400,
        padding: [40, 40, 40, 40]
    });
    
    const selection$ = rxChart.useSelection({
        target: 'element',
        type: 'single',
        on: 'click'
    });

    const predicates$: Observable<IFilter[]> = selection$.pipe(
        op.map(x => {
            console.log('init-x',x)
            return x;
        }),
        op.map(rows => [Utils.createFilter('Origin', 'in', rows.filter(row => row !== null) as IRow[])])
    )
    const color$ = predicates$.pipe(
        op.withLatestFrom(colorVar$, dataSource$),
        op.map(([predicates, origin, dataSource]) => {
            console.log('init', predicates)
            return dataSource.map((row, rIndex) => {
                if (Utils.rowFilteredOut(row, predicates)) return GREY_CAT_VALUE;
                return origin[rIndex]
            })
        })
    )
    
    rxChart.geom('point').position([xVar$, yVar$])
        .color(color$);
    
    rxChart.data(dataSource$);
    
    rxChart.render();
    // obChart.specify({
    //     x$: xVar$,
    //     y$: yVar$,
    //     color$,
    //     viewRawData$: dataSource$
    // })

} else {
    console.error('root node not exists.')
}
