import { MappingDatum, ShapeInfo } from "@antv/g2/lib/interface";
import { RxGeometry } from "./base";

export class RxPoint extends RxGeometry {
    public readonly type: string = 'point';
    public readonly shapeType: string = 'point';
    protected generatePoints: boolean = true;

    /**
     * 获取一个点的绘制信息。
     * @param mappingDatum
     * @returns draw cfg
     */
    protected getDrawCfg(mappingDatum: MappingDatum): ShapeInfo {
        const shapeCfg = super.getDrawCfg(mappingDatum);

        return {
            ...shapeCfg,
            isStack: !!this.getAdjust('stack'), // 层叠点图
        };
    }
}