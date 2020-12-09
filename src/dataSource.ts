import { BehaviorSubject } from 'rxjs'
import { IRow } from './interfaces'

export function createVariable(dataSource: IRow[], field: string) {
    return new BehaviorSubject(dataSource.map(r => r[field]))
}
