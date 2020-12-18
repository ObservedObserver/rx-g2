import { Observable, Subject } from "rxjs";
import { Event } from '@antv/g2';
import * as op from 'rxjs/operators';

export function useInverseElement(on$: Subject<Event>): Observable<boolean> {
    return on$.pipe(
        op.map(ev => {
            const ele = ev.target.get('element');
            if (ele) return true;
            return false;
        }),
        op.filter(isElement => !isElement)
    )
}