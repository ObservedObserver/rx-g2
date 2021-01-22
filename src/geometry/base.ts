import { Geometry } from '@antv/g2';
import { AttributeOption, ColorAttrCallback } from '@antv/g2/lib/interface';
import { Observable } from 'rxjs';
import { Unique } from '../unique';

export class RxGeometry extends Geometry {
    public rxVarsCollection: Map<string, Observable<any[]>>;
    constructor(props: any) {
        super(props);
        this.rxVarsCollection = new Map();
    }
    public position(fields: [Observable<any[]>, Observable<any[]>] | string | string[] | AttributeOption): RxGeometry {
        // TODO: 支持只需要任意一个是observable的场景
        if (fields instanceof Array && fields[0] instanceof Observable) {
            const unique = new Unique();
            const rxKeyX = unique.getUniqueId('geom-x');
            const rxKeyY = unique.getUniqueId('geom-y');
            this.rxVarsCollection.set(rxKeyX, fields[0] as Observable<any[]>);
            this.rxVarsCollection.set(rxKeyY, fields[1] as Observable<any[]>);
            super.position([rxKeyX, rxKeyY]);
        } else {
            super.position(fields as string | string[] | AttributeOption);
        }
        return this;
    }

    public color(field: AttributeOption | string | Observable<any[]>, cfg?: string | string[] | ColorAttrCallback): RxGeometry {
        if (field instanceof Observable) {
            const unique = new Unique();
            const rxColorKey = unique.getUniqueId('geom-color');
            this.rxVarsCollection.set(rxColorKey, field);
            super.color(rxColorKey);
        } else {
            super.color(field as string, cfg);
        }
        return this;
    }
}
