import { Event } from '@antv/g2';
import { Observable, Subject } from 'rxjs';
import * as op from 'rxjs/operators';
import { useSingleSelection } from './single';
import { IRow } from '../../interfaces';

export function useMultipleSelection(on$: Subject<Event>, closingNotifier: Observable<any>): Observable<(IRow | null)[]> {
    return on$.pipe(
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
        op.buffer(closingNotifier)
    );
}
