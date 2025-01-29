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
import { ChangeDetectorRef, Component, Injector, OnDestroy } from '@angular/core';
import { ApiService, Xo } from '@zeta/api';
import { I18nService, LocaleService } from '@zeta/i18n';
import { XcTabComponent } from '@zeta/xc';
import { Subscription } from 'rxjs';
import { resourcesTranslations_deDE } from './locale/resources-translations.de-DE';
import { resourcesTranslations_enUS } from './locale/resources-translations.en-US';
import { ResourceDataSource } from './resource-data-source';
import { XoFilter } from './xo/filter.model';
import { XoResource } from './xo/resource.model';



@Component({
    template: '',
    standalone: false
})
export class ResourceOverviewComponent<T extends XoResource> extends XcTabComponent<string> implements OnDestroy {

    protected readonly subscriptions: Subscription[] = [];
    filter = new XoFilter();


    constructor(
        injector: Injector,
        readonly i18n: I18nService,
        readonly api: ApiService,
        readonly cdr: ChangeDetectorRef
    ) {
        super(injector);

        i18n.setTranslations(LocaleService.EN_US, resourcesTranslations_enUS);
        i18n.setTranslations(LocaleService.DE_DE, resourcesTranslations_deDE);
        i18n.contextDismantlingSearch = true;

        this.subscriptions.push(this.getDataSource().dataChange.subscribe(() =>
            cdr.markForCheck()
        ));
        this.refresh();
    }


    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.getDataSource().cleanup();
    }


    getDataSource(): ResourceDataSource<T> {
        return null;
    }


    getAdditionalInputs(): Xo[] {
        return [this.filter];
    }


    refresh() {
        this.getDataSource().listInput = this.getAdditionalInputs();
        this.getDataSource().refresh();
    }
}
