import {FusionFunction} from './weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../scores/segment-score-container.model';
import {DefaultFusionFunction} from './default-fusion-function.model';


export class TemporalFusionFunction implements FusionFunction {

  /** The underlying FusionFunction to use for segments */
  private _segmentFusionFunction: FusionFunction = new DefaultFusionFunction();

  /** The current query container ids for temporal closeness */
  private _queryContainerIds: string[];

  /** The boosting factor to be used */
  private _boostFactor: number;

  /**
   * Calculates and returns the weighted score of a MediaObjectScoreContainer.
   * There is a bonus for temporal scoring here.
   *
   * @param features Feature categories to consider when calculating the score.
   * @param mediaObjectScoreContainer MediaObjectScoreContainer for which to calculate the score.
   *
   * @return Weighted score for teh MediaObjectScoreContainer given the results
   */
  scoreForObject(features: WeightedFeatureCategory[], mediaObjectScoreContainer: MediaObjectScoreContainer): number {
    let score = this._segmentFusionFunction.scoreForObject(features, mediaObjectScoreContainer);
    if (this._queryContainerIds === null || this._queryContainerIds.length === 0) {
      return score;
    } else {
      score *= this._boostFactor;
      let map = this.mapSegmentsToQueryContainer(mediaObjectScoreContainer);
      // sort map based on temporal segment position
      map = new Map(Array.from(map).sort((a, b) => a[0].startabs - b[0].startabs));
      const sortedQueryContainerIds = Array.from(map.values());
      if (sortedQueryContainerIds[0] === this._queryContainerIds[0] && sortedQueryContainerIds[sortedQueryContainerIds.length - 1] === this._queryContainerIds[this._queryContainerIds.length - 1]) {
        score *= (1 + this._boostFactor);
        score = Math.max(score, 1);
      }
      return score;
    }
  }

  /**
   * @param mediaObjectScoreContainer
   */
  private extractQueryContainerIdsPerSegmentId(mediaObjectScoreContainer: MediaObjectScoreContainer): Map<string, Array<string>> {
    const map = new Map<string, Array<string>>();
    mediaObjectScoreContainer.segments.forEach(segment => {
      let array = new Array<string>();
      if (segment.scoresPerQueryContainer !== null && segment.scoresPerQueryContainer.size > 0) {
        array = Array.from(segment.scoresPerQueryContainer.keys());
      }
      map[segment.segmentId] = array;
    });
    return map;
  }

  private mapSegmentsToQueryContainer(mediaObjectScoreContainer: MediaObjectScoreContainer): Map<SegmentScoreContainer, string> {
    const map = new Map<SegmentScoreContainer, string>();
    mediaObjectScoreContainer.segments.forEach(segment => {
      Array.from(segment.scoresPerQueryContainer.entries()).forEach(value => {
        map.set(segment, this.max(segment.scoresPerQueryContainer)[0]);
      })
    });
    return map;
  }

  private max(map: Map<string, number>): [string, number] {
    let _max = Array.from(map.entries())[0];
    map.forEach((value, key) => {
      if (_max[1] < value) {
        _max = [key, value];
      }
    });
    return _max;
  }

  /**
   * Calculates and returns the weighted score of a SegmentScoreContainer. This implementation obtains
   * the weighted mean value of the all the scores in the SegmentScoreContainer.
   *
   * @param features Feature categories to consider when calculating the score.
   * @param segmentScoreContainer SegmentScoreContainer for which to calculate the score.
   *
   * @return Weighted score for teh MediaObjectScoreContainer given the results
   */
  scoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: SegmentScoreContainer): number {
    return this._segmentFusionFunction.scoreForSegment(features, segmentScoreContainer);
  }

  /** Getter for the segment fusion function */
  public get segmentFusionFunction(): FusionFunction {
    return this._segmentFusionFunction;
  }

  /** Setter for segment fusion function */
  public set segmentFusionFunction(fn: FusionFunction) {
    this._segmentFusionFunction = fn;
  }

  /** Getter for query container ids*/
  public get queryContainerIds(): string[] {
    return this._queryContainerIds;
  }

  /** Setter for quer container ids */
  public set queryContainerIds(queryContainerIds: string[]) {
    this._queryContainerIds = queryContainerIds;
  }

  /** Getter for booster factor */
  get boostFactor(): number {
    return this._boostFactor;
  }

  /** Setter for booster factor */
  set boostFactor(value: number) {
    this._boostFactor = value;
  }
}