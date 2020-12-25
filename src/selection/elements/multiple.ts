import { Event } from '@antv/g2';
import { Observable, Subject } from 'rxjs';
import * as op from 'rxjs/operators';
import { IRow } from '../../interfaces';

export function useMultipleSelection(on$: Subject<Event>, closingNotifier: Observable<null>): Observable<(IRow | null)[]> {
    const data$: Observable<IRow | null> = on$.pipe(
        op.map((ev) => {
            const ele = ev.target.get('element');
            if (ele.getModel) {
                const model = ele.getModel();
                if (model) {
                    const data = model.data as IRow;
                    return data;
                }
            }
            return null;
        }),
        op.startWith(null),
        op.merge(closingNotifier)
    );
    return data$.pipe(
        op.scan<IRow | null, Array<IRow | null>>((acc, cur) => {
            if (cur === null) return []
            return [...acc, cur];
        }, [])
    );
}
