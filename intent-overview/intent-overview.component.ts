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
import { Component, inject, signal } from '@angular/core';

import { ApiService, RuntimeContext } from '@zeta/api';
import { I18nService, LocaleService, XcI18nContextDirective, XcI18nTranslateDirective } from '@zeta/i18n';
import { XcButtonComponent, XcIconButtonComponent, XcPanelComponent, XcRemoteTableDataSource, XcTabBarItem, XcTabComponent, XcTableComponent, XDSIconName } from '@zeta/xc';

import { IntentDetailsComponent } from '../intent-details/intent-details.component';
import { intentOverviewTranslations_deDE } from './locale/intent-overview-translations.de-DE';
import { intentOverviewTranslations_enUS } from './locale/intent-overview-translations.en-US';
import { XoIntentEntry, XoIntentEntryArray } from './xo/intent-entry.model';

import { getIntentRuntimeContext } from '../intent/intent';


const WF_GET_INTENT_OVERVIEW = 'xmcp.processmonitor.intent.GetIntentOverview';


@Component({
    selector: 'xfm-mon-intent-overview',
    templateUrl: './intent-overview.component.html',
    styleUrls: ['./intent-overview.component.scss'],
    imports: [XcButtonComponent, XcIconButtonComponent, XcPanelComponent, XcTableComponent, XcI18nContextDirective, XcI18nTranslateDirective]
})
export class IntentOverviewComponent extends XcTabComponent<string> {

    private readonly i18nService = inject(I18nService);
    private readonly apiService = inject(ApiService);

    dataSource: XcRemoteTableDataSource<XoIntentEntry>;


    constructor() {
        super();

        this.i18nService.setTranslations(LocaleService.EN_US, intentOverviewTranslations_enUS);
        this.i18nService.setTranslations(LocaleService.DE_DE, intentOverviewTranslations_deDE);

        this.dataSource = new XcRemoteTableDataSource(this.apiService, this.i18nService, RuntimeContext.undefined, WF_GET_INTENT_OVERVIEW);
        this.dataSource.output = XoIntentEntryArray;
        this.dataSource.selectionModel.selectionChangeForUnchangedSelection = true;
        this.dataSource.selectionModel.activatedChange.subscribe(() => this.details());
        this.dataSource.refreshOnFilterChange = false;

        this.refresh();
    }


    private openIntent(intentEntry: XoIntentEntry) {
        const item: XcTabBarItem<XoIntentEntry> = {
            name: signal(this.i18nService.getTranslation('intent').value + ' ' + intentEntry.id),
            component: IntentDetailsComponent,
            closable: true,
            icon: XDSIconName.INFO,
            data: intentEntry
        };
        this.openPeer(item).subscribe();
    }


    details() {
        if (this.selectedIntentEntry) {
            this.openIntent(this.selectedIntentEntry);
        }
    }


    refresh() {
        getIntentRuntimeContext(this.apiService).subscribe(rtc => {
            this.dataSource.rtc = rtc;
            this.dataSource.refresh();
        });
    }


    get selectedIntentEntry(): XoIntentEntry {
        return this.dataSource.selectionModel.selection[0];
    }


    get detailsButtonDisabled(): boolean {
        return !this.selectedIntentEntry;
    }
}
