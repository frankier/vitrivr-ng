import {Observable} from "rxjs";
import {InteractionEventType} from "../../shared/model/events/interaction-event-type.model";
import {InteractionEvent} from "../../shared/model/events/interaction-event.model";
import {WeightedFeatureCategory} from "../../shared/model/results/weighted-feature-category.model";
import {catchError, filter, map} from "rxjs/operators";
import {Submission, SubmissionType} from "../../shared/model/vbs/interfaces/submission.model";
import {SubmittedEvent} from "../../shared/model/vbs/interfaces/event.model";
import {AtomicEvent} from "../../shared/model/vbs/interfaces/atomic-event.model";
import {InteractionEventComponent} from "../../shared/model/events/interaction-event-component.model";
import {CompositEvent} from "../../shared/model/vbs/interfaces/composit-event.model";

export class VbsSubmission implements Submission {

    /** Timestam of the VbsSubmission. */
    public readonly timestamp: number = Date.now();

    /** Type of the VbsSubmission. */
    public readonly type: SubmissionType = 'submission';

    /** List of submitted events. */
    public readonly events: SubmittedEvent[] = [];

    /**
     *
     * @param teamId
     * @param memberId
     */
    constructor(public readonly teamId: string, public readonly memberId: number) {}

    /**
     * This method maps the events emitted on the Vitrivr NG EventBusService to VbsActions.
     *
     * @param {Observable<InteractionEvent>} stream The observable of the InteractionEvents as exposed by the EventBusService
     */
    public static mapEventStream(stream: Observable<InteractionEvent>): Observable<SubmittedEvent> {
        return stream.pipe(
            map(e => {
                if (e.components.length > 1) {
                    let composit = <CompositEvent>{timestamp: e.timestamp, actions: []};
                    e.components.forEach(c => composit.actions.push(VbsSubmission.mapAtomicEvent(c, e.timestamp)));
                    return composit;
                } else if (e.components.length === 1) {
                    return VbsSubmission.mapAtomicEvent(e.components[0], e.timestamp);
                }
            }),
            catchError((e,o) => {
                console.log("An error occurred when mapping an event from the event stream to a VbsSubmission: " +  e.message);
                return o;
            }),
            filter(e => e != null)
        );
    }

    /**
     * Maps a single InteractionEventComponent to an AtomicEvent.
     *
     * @param component InteractionEventComponent
     * @param timestamp Timestamp of the event.
     */
    private static mapAtomicEvent(component: InteractionEventComponent, timestamp: number): AtomicEvent {
        switch (component.type) {
            case InteractionEventType.QUERY_MOTION:
                return <AtomicEvent>{category: "Sketch", type: ['motion'], timestamp: timestamp};
            case InteractionEventType.QUERY_SEMANTIC:
                return <AtomicEvent>{category: "Sketch", type: ['semanticSegmentation'], timestamp: timestamp};
            case InteractionEventType.MLT:
                return <AtomicEvent>{category: "Image", type: ['globalFeatures'], attributes: 'mlt', timestamp: timestamp};
            case InteractionEventType.QUERY_TAG:
                return <AtomicEvent>{category: "Text", type: ['concept'], value: component.context.get("q:value"), timestamp: timestamp};
            case InteractionEventType.QUERY_FULLTEXT: {
                const event = <AtomicEvent>{category: "Text", type: [], value: component.context.get("q:value"), timestamp: timestamp};
                const c = component.context.get("q:categories");
                if (c.indexOf('ocr') > -1) event.type.push('ocr');
                if (c.indexOf('asr') > -1) event.type.push('asr');
                if (c.indexOf('meta') > -1) event.type.push('metadata');
                if (c.indexOf('tagsft') > -1) event.type.push('concept');
                if (c.indexOf('captioning') > -1) event.type.push('caption');
                if (c.indexOf('audio') > -1) event.type.push('custom');
                return event;
            }
            case InteractionEventType.QUERY_IMAGE: {
                const c = component.context.get("q:categories");
                const event = <AtomicEvent>{category: "Sketch", type: [], timestamp: timestamp};
                if ((c.indexOf("localfeatures") === -1)) {
                    if (c.indexOf("globalcolor") > -1 || c.context.get("q:categories").indexOf("localcolor") > -1) event.type.push("color");
                    if (c.indexOf("edge") > -1) event.type.push("edge");
                } else {
                    event.category = "Image";
                    event.type.push("localFeatures", "globalFeatures");
                }
                return event;
            }
            case InteractionEventType.FILTER:
                return <AtomicEvent>{category: "Filter", type: [component.context.get("f:type")], value: component.context.get("f:value"), timestamp: timestamp};
            case InteractionEventType.EXPAND:
                return <AtomicEvent>{category: "Browsing", type: ['temporalContext'], timestamp: timestamp};
            case InteractionEventType.REFINE:
                let weights = component.context.get("w:weights").map((v: WeightedFeatureCategory) => v.name + ":" + v.weight / 100).join(",");
                return <AtomicEvent>{category: "Browsing", type: ['explicitSort'], attributes: "adjust weights," + weights, timestamp: timestamp};
            case InteractionEventType.EXAMINE:
                return <AtomicEvent>{category: "Browsing", type: ['videoPlayer'], value: component.context.get("i:mediasegment"), timestamp: timestamp};
            case InteractionEventType.SCROLL:
                return <AtomicEvent>{category: "Browsing", type: ['rankedList'], timestamp: timestamp};
            case InteractionEventType.CLEAR:
                return <AtomicEvent>{category: "Browsing", type: ['resetAll'], timestamp: timestamp};
            default:
                break;
        }
    }
}
