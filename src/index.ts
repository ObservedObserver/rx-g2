import { Chart } from '@antv/g2';
import { combineLatest, Observable } from 'rxjs';
import * as op from 'rxjs/operators';
import { IColumn, IRow } from './interfaces';

interface CreateChartProps {
    container: HTMLDivElement;
    x$: Observable<any[]>;
    y$: Observable<any[]>;
}
export function createChart (props: CreateChartProps) {
    const { container, x$, y$ } = props;
    const chart = new Chart({
      width: 400,
      height: 300,
      container,
    });

    const viewData$ = combineLatest([x$, y$]).pipe(
        op.map(([x, y]) => {
            const rows: IRow[] = x.map((xi, i) => {
                return {
                    x: xi,
                    y: y[i]
                }
            })
            return rows
        })
    )

    viewData$.subscribe(viewData => {
        chart.data(viewData);
        chart.render();
    })
    
}