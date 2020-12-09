import { BehaviorSubject, Observable } from 'rxjs'
import * as op from 'rxjs/operators';
import { IRow } from './interfaces'

export function createVariable(dataSource: Observable<IRow[]>, field: string): Observable<any[]> {
    return dataSource.pipe(op.map(ds => {
        return ds.map(r => r[field]);
    }))
}
