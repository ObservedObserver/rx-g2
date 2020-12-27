import { Chart } from '@antv/g2';
import React, { useEffect, useRef } from 'react';
import { Observable, from, combineLatest } from 'rxjs';
import * as op from 'rxjs/operators'
import { createVariable } from '../../src/dataSource';
import { GREY_CAT_VALUE, ObservableChart, Utils } from '../../src/index';
import { IRow, IFilter } from '../../src/interfaces';

interface ReactRXChartProps {
    spec: (container: React.RefObject<HTMLDivElement>) => ObservableChart;
}
const ReactRXChart: React.FC<ReactRXChartProps> = props => {
    const { spec } = props;
    const container = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ObservableChart>();
    useEffect(() => {
        if (container.current) {
            const rxChart = spec(container);
        }
    }, [])
    return <div ref={container}></div>
}

export default ReactRXChart;
