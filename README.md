# rx-g2
响应式G2(RxG2)，是使用rxjs封装的响应式的antv/g2的可视化扩展。它使你可以使用类似vega的形式，编写响应式的可视化图表。这也为G2拓展了交互式图形语法的可能（针对数据可视化，G2目前的交互语法其实更像是G层面的交互语法，其更关注图形的基础交互行为，而非可视化层面）。

基于rxjs的流对异步交互行为的抽象使你在实现复杂可视化交互逻辑时可以不需要花费过多的经历维护交互相关的状态。

## 案例
实现下图的交互效果

![demo image](./imgs/rx-g2-single-selection-demo.gif)

使用rx-g2的写法

```ts
import { GREY_CAT_VALUE, ObservableChart, Utils } from 'rx-g2';
import * as op from "rxjs/operators";

// 声明变量
const xVar$ = createVariable(dataSource$, "Miles_per_Gallon");
const yVar$ = createVariable(dataSource$, "Horsepower");
const colorVar$ = createVariable(dataSource$, 'Origin')
// 初始化图表
const obChart = new ObservableChart(chartContainer, 600, 400);
// 定义图表交互事件产生的predicates,vega中的概念，类似对selection的特征描述，由一堆筛选器构成。
const predicates$: Observable<IFilter[]> = obChart.selection$.pipe(
    op.map(rows => [Utils.createFilter('Origin', 'in', rows)])
)
// 定义颜色为一个随交互行为变化的变量,
// rx-g2允许你对任何映射到视觉通道上的字段可以升级为一个更为动态变量，而不是写死于一个数据集中已有的常量字段
const color$ = predicates$.pipe(
    op.withLatestFrom(colorVar$, dataSource$),
    op.map(([predicates, origin, dataSource]) => {
        return dataSource.map((row, rIndex) => {
            if (Utils.rowFilteredOut(row, predicates)) return GREY_CAT_VALUE;
            return origin[rIndex]
        })
    })
)
// 配置图标
obChart.specify({
    x$: xVar$,
    y$: yVar$,
    color$,
    viewRawData$: dataSource$
})
```