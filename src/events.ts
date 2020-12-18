import { Chart, Event } from "@antv/g2";
import { Observable, Subject } from "rxjs";
import { RGEventStreamTarget, RGEventStreamType } from './interfaces';
export interface EventPackage {
    click$: Subject<Event>;
    mouseover$: Subject<Event>;
    mouseenter$: Subject<Event>;
    mouseleave$: Subject<Event>;
}
export interface StreamPackage {
    element$: EventPackage;
    plot$: EventPackage;
}
export function createEventStream (chart: Chart): StreamPackage {

    const streams$: StreamPackage = {
        element$: {
            click$: new Subject(),
            mouseenter$: new Subject(),
            mouseleave$: new Subject(),
            mouseover$: new Subject(),
        },
        plot$: {
            click$: new Subject(),
            mouseenter$: new Subject(),
            mouseleave$: new Subject(),
            mouseover$: new Subject(),
        },
    };
    Object.values(RGEventStreamTarget).forEach(target => {
        Object.values(RGEventStreamType).forEach(type => {
            const targetStreamKey = `${target}$` as keyof StreamPackage;
            const typeStreamKey = `${type}$` as keyof EventPackage;
            chart.on(`${target}:${type}`, (ev: Event) => {
                streams$[targetStreamKey][typeStreamKey].next(ev);
            })
        })
    })
    return streams$;
}