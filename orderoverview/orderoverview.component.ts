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
import { Component, Injector } from '@angular/core';

import { ApiService } from '@zeta/api';
import { I18nService, LocaleService } from '@zeta/i18n';
import { XcRemoteTableDataSource, XcTabComponent } from '@zeta/xc';

import { RTC } from '../const';
import { DocumentService } from '../document.service';
import { XoOrderOverviewEntry, XoOrderOverviewEntryArray } from '../xo/order-overview-entry.model';
import { XoIncludeInternalOrders, XoSearchFlagArray, XoShowOnlyMyOwnOrders, XoShowOnlyRootOrders } from '../xo/search-flag.model';
import { DateTimeConverter } from '../xo/util/date-time-converter';
import { orderoverviewTranslations_deDE } from './locale/orderoverview-translations.de-DE';
import { orderoverviewTranslations_enUS } from './locale/orderoverview-translations.en-US';



@Component({
    selector: 'xfm-mon-orderoverview',
    templateUrl: './orderoverview.component.html',
    styleUrls: ['./orderoverview.component.scss']
})
export class OrderoverviewComponent extends XcTabComponent<string> {

    dataSource: XcRemoteTableDataSource<XoOrderOverviewEntry>;

    private onlyRootOrders = false;
    private onlyMyOwnOrders = false;
    private includeInternalOrders = false;


    constructor(
        injector: Injector,
        i18nService: I18nService,
        private readonly apiService: ApiService,
        private readonly documentService: DocumentService
    ) {
        super(injector);

        i18nService.setTranslations(LocaleService.EN_US, orderoverviewTranslations_enUS);
        i18nService.setTranslations(LocaleService.DE_DE, orderoverviewTranslations_deDE);

        const orderType = 'xmcp.processmonitor.GetOrderOverview';
        this.dataSource = new XcRemoteTableDataSource(apiService, i18nService, RTC, orderType);
        this.dataSource.output = XoOrderOverviewEntryArray;
        // this.dataSource.tableInfoClass = DateTimeTableInfo;
        this.refresh();

        this.dataSource.selectionModel.selectionChangeForUnchangedSelection = true;
        this.dataSource.selectionModel.activatedChange.subscribe(() => this.details());
        this.dataSource.refreshOnFilterChange = false;  // settings.tableRefreshOnFilterChange;   PMON-186

        DateTimeConverter.localTime = true;
    }


    get selectedOrderOverviewEntry(): XoOrderOverviewEntry {
        return this.dataSource.selectionModel.selection[0];
    }


    get killButtonDisabled(): boolean {
        return !this.selectedOrderOverviewEntry || !this.selectedOrderOverviewEntry.isKillable;
    }


    get orderId(): string {
        return this.selectedOrderOverviewEntry && this.selectedOrderOverviewEntry.id;
    }


    get detailsButtonDisabled(): boolean {
        return !this.selectedOrderOverviewEntry;
    }


    details() {
        this.documentService.openDocument(this.selectedOrderOverviewEntry);
    }


    refresh() {
        const flags = new XoSearchFlagArray();
        if (this.onlyRootOrders) {
            flags.append(new XoShowOnlyRootOrders());
        }
        if (this.onlyMyOwnOrders) {
            flags.append(new XoShowOnlyMyOwnOrders());
        }
        if (this.includeInternalOrders) {
            flags.append(new XoIncludeInternalOrders());
        }
        this.dataSource.input = flags;
        this.dataSource.refresh();
    }


    clearFilters() {
        this.dataSource.resetFilters();
    }


    onlyRootOrdersChanged(value: boolean) {
        this.onlyRootOrders = value;
        this.refresh();
    }


    onlyMyOwnOrdersChanged(value: boolean) {
        this.onlyMyOwnOrders = value;
        this.refresh();
    }


    includeInternalOrdersChanged(value: boolean) {
        this.includeInternalOrders = value;
        this.refresh();
    }


    // utcTimeChanged(value: boolean) {
    //     DateTimeConverter.localTime = !value;
    //     this.refresh();
    // }


    importAudit() {
        const timeout = 1000 * 60 * 5;
        this.apiService.browse(timeout).subscribe(file =>
            this.apiService.upload(file).subscribe(fileId => {
                const entry = new XoOrderOverviewEntry(undefined, fileId.iD);
                entry.imported = true;
                this.documentService.openDocument(entry);
            })
        );
    }
}
