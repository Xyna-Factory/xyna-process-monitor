/*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Copyright 2023 Xyna GmbH, Germany
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
import { Router } from '@angular/router';

import { ApiService, Xo } from '@zeta/api';
import { I18nService, LocaleService } from '@zeta/i18n';
import { XoIncludeUnused, XoSearchFlagArray } from '../../xo/search-flag.model';
import { resourcesTranslations_deDE } from '../locale/resources-translations.de-DE';
import { resourcesTranslations_enUS } from '../locale/resources-translations.en-US';
import { ResourceDataSource } from '../resource-data-source';
import { ResourceOverviewComponent } from '../resource-overview.component';
import { XoCapacity, XoCapacityArray } from '../xo/capacity.model';



@Component({
    selector: 'xfm-mon-capacities',
    templateUrl: './capacities.component.html',
    styleUrls: ['./capacities.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapacitiesComponent extends ResourceOverviewComponent<XoCapacity> {

    dataSource: ResourceDataSource<XoCapacity>;

    _showUnused: boolean;
    get showUnused(): boolean {
        return this._showUnused !== undefined ? this._showUnused : true;
    }
    set showUnused(value: boolean) {
        this._showUnused = value;
        this.refresh();
    }


    constructor(
        injector: Injector,
        i18n: I18nService,
        api: ApiService,
        cdr: ChangeDetectorRef,
        private readonly router: Router
    ) {
        super(injector, i18n, api, cdr);

        i18n.setTranslations(LocaleService.EN_US, resourcesTranslations_enUS);
        i18n.setTranslations(LocaleService.DE_DE, resourcesTranslations_deDE);

        this.subscriptions.push(this.dataSource.dataChange.subscribe(() =>
            cdr.markForCheck()
        ));
    }


    getDataSource(): ResourceDataSource<XoCapacity> {
        if (!this.dataSource) {
            this.dataSource = new ResourceDataSource<XoCapacity>(this.api, this.i18n, 'xmcp.processmonitor.resources.GetCapacities', undefined, XoCapacityArray, 'xmcp.processmonitor.resources.GetCapacity');
        }
        return this.dataSource;
    }


    getAdditionalInputs(): Xo[] {
        const flags = new XoSearchFlagArray();
        if (this.showUnused) {
            flags.append(new XoIncludeUnused());
        }
        return super.getAdditionalInputs().concat(flags);
    }


    openCapacity(name: string) {
        void this.router.navigate(['xfm/Factory-Manager/capacities'], {
            queryParams: {'name': name}
        });
    }
}
