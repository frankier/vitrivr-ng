import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {HttpClient} from "@angular/common/http";
import {QueryService} from "../core/queries/query.service";
import {QueryContainer} from "../shared/model/queries/query-container.model";
import {first} from "rxjs/operators";
import {ImageQueryTerm} from "../shared/model/queries/image-query-term.model";

@Component({
    moduleId: module.id,
    selector: 'imagecrop-dialog',
    templateUrl: 'imagecrop.component.html'
})
export class ImagecropComponent implements OnInit {



    private _data: any;
    private _cropperSettings: CropperSettings;

    @ViewChild("cropper")
    private cropper: ImageCropperComponent;

    public isLoaded: boolean = false;

    /**
     *
     * @param _src
     * @param _ref
     * @param _http
     * @param _query
     */
    constructor(@Inject(MAT_DIALOG_DATA) private _src : string, private _ref: MatDialogRef<ImagecropComponent>, private _http: HttpClient, private _query : QueryService) {
        this._cropperSettings = new CropperSettings();

        this._cropperSettings.canvasWidth = 800;
        this._cropperSettings.canvasHeight = 600;
        this._cropperSettings.noFileInput = true;
        this._cropperSettings.preserveSize = true;
        this._cropperSettings.keepAspect = false;

        this._cropperSettings.minWithRelativeToResolution = false;
        this._cropperSettings.minWidth = 25;
        this._cropperSettings.minHeight = 25;

        this._data = {

        };
    }

    /**
     * Lifecycle hook (onInit): Loads the image and converts it to a data URL.
     */
    public ngOnInit(): void {
        let reader = new FileReader();
        reader.addEventListener("load", () => {
            let image = new Image();

            image.onload = () => {
              this.cropper.setImage(image);
              this.isLoaded = true;
            };

            image.src = <string>reader.result;
        });
        this._http.get(this._src, {responseType: 'blob'}).pipe(first()).subscribe(data => {
            reader.readAsDataURL(data);
        });
    }

    /**
     *
     */
    public onSearchClicked() {
        let qq = new QueryContainer();
        qq.addTerm("IMAGE");
        (<ImageQueryTerm>qq.getTerm("IMAGE")).data = this._data.image;
        qq.getTerm("IMAGE").setCategories(['quantized', 'localcolor', 'localfeatures', 'edge']);
        this._query.findSimilar([qq]);
        this._ref.close(this._data.image);
    }


    get data(): any {
        return this._data;
    }

    get cropperSettings(): CropperSettings {
        return this._cropperSettings;
    }
}
