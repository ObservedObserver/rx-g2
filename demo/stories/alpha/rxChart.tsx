import { FC, useEffect, useRef } from "react";
import { Observable, from, interval } from "rxjs";
import { createVariable } from "../../../src/dataSource";
import { RxGeometry } from "../../../src/geometry/base";
import { RxPoint } from "../../../src/geometry/point";
import { IRow } from "../../../src/interfaces";
import { RxChart } from "../../../src/view/chart";
import * as op from 'rxjs/operators';


const ReactRxChart: FC = props => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (container.current) {
            const dataSource$: Observable<IRow[]> = from(fetch('/cars.json').then((res) => res.json()))
                .pipe(
                    op.startWith([]),
                    op.map((data: IRow[]) => 
                        interval(3000).pipe(
                            op.map(d => {
                                return data.slice(0, Math.round(Math.random() * 100))
                            }),
                            
                        ),
                        
                    ),
                    op.switchAll(),
                    op.share()
                );

            const xVar$ = createVariable(dataSource$, 'Miles_per_Gallon');
            const yVar$ = createVariable(dataSource$, 'Horsepower');
            const colorVar$ = createVariable(dataSource$, 'Origin');
            
            const rxChart = new RxChart({
                container: container.current,
                width: 400,
                height: 300,
            });
            rxChart.geom<RxGeometry>(RxPoint).position([xVar$, yVar$])
                .color(colorVar$);
            
            rxChart.stream(dataSource$);
            rxChart.render();
            
        }
    }, [])
    return <div ref={container}></div>
}

export default ReactRxChart;
