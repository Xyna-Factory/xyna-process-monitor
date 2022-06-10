/*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Copyright 2022 GIP SmartMercial GmbH, Germany
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector } from '@angular/core';

import { ApiService, Xo, XoPropertyBinding } from '@zeta/api';
import { I18nService } from '@zeta/i18n';
import { XcAutocompleteDataWrapper } from '@zeta/xc';
import { ResourceDataSource } from '../resource-data-source';
import { ResourceOverviewComponent } from '../resource-overview.component';
import { XoSortCriterion } from '../xo/sort-criterion.model';
import { XoVeto, XoVetoArray } from '../xo/veto.model';



@Component({
    selector: 'xfm-mon-vetoes',
    templateUrl: './vetoes.component.html',
    styleUrls: ['./vetoes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VetoesComponent extends ResourceOverviewComponent<XoVeto> {

    dataSource: ResourceDataSource<XoVeto>;
    private sortCriterion: XoSortCriterion;
    sorting: XcAutocompleteDataWrapper;


    constructor(
        injector: Injector,
        i18n: I18nService,
        api: ApiService,
        cdr: ChangeDetectorRef
    ) {
        super(injector, i18n, api, cdr);

        this.sorting = XcAutocompleteDataWrapper.fromXoEnumeratedPropertyBinding(
            XoPropertyBinding(this.sortCriterion, s => s.field),
            false,
            { options: options => options.forEach(item => item.name = this.i18n.translate(item.value)) }
        );
        this.sorting.update();
    }


    getDataSource(): ResourceDataSource<XoVeto> {
        if (!this.dataSource) {
            this.dataSource = new ResourceDataSource<XoVeto>(this.api, this.i18n, 'xmcp.processmonitor.resources.GetVetoes', undefined, XoVetoArray, 'xmcp.processmonitor.resources.GetVeto');
        }
        return this.dataSource;
    }


    getAdditionalInputs(): Xo[] {
        if (!this.sortCriterion) {
            this.sortCriterion = new XoSortCriterion();
            this.sortCriterion.field = 'ORDER_ID';
        }
        return super.getAdditionalInputs().concat(this.sortCriterion);
    }
}
