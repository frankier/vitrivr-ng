import {Component, Input} from "@angular/core";
import {WeightedFeatureCategory} from "../../shared/model/results/weighted-feature-category.model";
@Component({
    moduleId: module.id,
    selector: 'weight-distribution',
    template: `
        <div class="weight-distribution">
            <div *ngFor="let feature of features" [style.width]="getWidth(feature)" [style.height]="'10px'"
                 [style.background-color]="feature.displayColor"></div>
        </div>
    `
    
})

/**
 * This component gives a visual representation of the content.
 */
export class WeightDistributionComponent {
    /**
     * List of refinement that are currently displayed.
     *
     * @type {Map<any, any>}
     */
    @Input() features: WeightedFeatureCategory[] = [];

    /**
     * Returns the total weight of all refinement currently known
     * to the component.
     *
     * @returns {number} Total weight of all refinement.
     */
    public getTotal(): number {
        return this.features
            .map(f => f.weight)
            .reduce((a,b) => a+b);
    }

    /**
     * Returns the width (in percent) of an individual feature.
     *
     * @param feature Feature for which the widht should be calculated.
     * @returns {number} Width in percent.
     */
    public getWidth(feature: WeightedFeatureCategory) {
       return (feature.weight/this.getTotal()) * 100 + '%';
    }
}