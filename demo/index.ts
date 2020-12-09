import { createVariable } from '../src/dataSource';
import { createChart } from '../src/index';

const root = document.querySelector('#root');

if (root) {
    const chartContainer: HTMLDivElement = document.createElement("div");
    chartContainer.setAttribute('style', 'width: 400px; height: 300px;')
    root.appendChild(chartContainer);

    fetch("/cars.json")
        .then((res) => res.json())
        .then((res) => {
            const origin$ = createVariable(res, "Origin");
            const horsepower$ = createVariable(res, "Horsepower");
            createChart({
                container: chartContainer,
                x$: origin$,
                y$: horsepower$,
            });
        });
} else {
    console.error('root node not exists.')
}
