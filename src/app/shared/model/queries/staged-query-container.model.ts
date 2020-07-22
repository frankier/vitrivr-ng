import {QueryContainerInterface} from './interfaces/query-container.interface';
import {QueryTermInterface} from './interfaces/query-term.interface';
import {ImageQueryTerm} from './image-query-term.model';
import {AudioQueryTerm} from './audio-query-term.model';
import {M3DQueryTerm} from './m3d-query-term.model';
import {QueryTermType} from './interfaces/query-term-type.interface';
import {BoolQueryTerm} from './bool-query-term.model';
import {MotionQueryTerm} from './motion-query-term.model';
import {TextQueryTerm} from './text-query-term.model';
import {TagQueryTerm} from './tag-query-term.model';
import {PoseQueryTerm} from './pose-query-term.model';
import {SemanticQueryTerm} from './semantic/semantic-query-term.model';
import {QueryStage} from './query-stage.model';

export class StagedQueryContainer implements QueryContainerInterface {

  /**
   * List of all stages within this staged query. If you do not wish to use staged querying, simply put all queryterms within one stage.
   */
  public readonly stages: QueryStage[] = [];

  /**
   * Internal cache for the queryterms. Since each queryterm can only occur once in the current implementation of vitrivr-ng, this is enough.
   */
  private _cache: Map<QueryTermType, QueryTermInterface> = new Map();


  public constructor() {
    this.stages.push(new QueryStage());
  }

  public addTerm(type: QueryTermType): boolean {
    if (this._cache.has(type)) {
      return false;
    }
    switch (type) {
      case 'IMAGE':
        this._cache.set(type, new ImageQueryTerm());
        break;
      case 'AUDIO':
        this._cache.set(type, new AudioQueryTerm());
        break;
      case 'MODEL3D':
        this._cache.set(type, new M3DQueryTerm());
        break;
      case 'MOTION':
        this._cache.set(type, new MotionQueryTerm());
        break;
      case 'TEXT':
        this._cache.set(type, new TextQueryTerm());
        break;
      case 'TAG':
        this._cache.set(type, new TagQueryTerm());
        break;
      case 'POSE':
        this._cache.set(type, new PoseQueryTerm());
        break;
      case 'SEMANTIC':
        this._cache.set(type, new SemanticQueryTerm());
        break;
      case 'BOOLEAN':
        this._cache.set(type, new BoolQueryTerm());
        break;
      default:
        return false;
    }
    if (this.stages.length === 0) {
      this.stages.push(new QueryStage());
    }
    /* We insert new queryterms at the lowest levels. */
    this.stages[this.stages.length - 1].terms.push(this._cache.get(type));
    return true;
  }

  public removeTerm(type: QueryTermType): boolean {
    if (this._cache.has(type)) {
      this.stages.forEach(stage => {
        if (stage.terms.indexOf(this._cache.get(type)) > -1) {
          stage.terms.splice(stage.terms.indexOf(this._cache.get(type)), 1);
          /* if stage is now empty, clear it*/
          if (stage.terms.length === 0) {
            this.stages.splice(this.stages.indexOf(stage), 1);
          }
        }
      });
      return this._cache.delete(type)
    }
  }

  public hasTerm(type: QueryTermType): boolean {
    return this._cache.has(type);
  }

  public getTerm(type: QueryTermType): QueryTermInterface {
    return this._cache.get(type)
  }
}
