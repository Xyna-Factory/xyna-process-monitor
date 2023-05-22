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
import { XcDialogService, XcRemoteTableDataSource, XcTabComponent, XDSIconName, XoRemappingTableInfoClass, XoTableInfo } from '@zeta/xc';

import { RTC } from '../const';
import { ProcessmonitorSettingsService } from '../processmonitor-settings.service';
import { miMonitorTranslations_deDE } from './locale/mi-monitor-translations.de-DE';
import { miMonitorTranslations_enUS } from './locale/mi-monitor-translations.en-US';
import { XoManualInteractionId, XoManualInteractionIdArray } from './xo/mi-id.model';
import { XoManualInteractionResponse } from './xo/mi-interaction-response.model';
import { XoManualInteractionEntry, XoManualInteractionEntryArray } from './xo/mi-monitor-entry.model';
import { XoManualInteractionProcessResponseArray } from './xo/mi-process-response.model';


enum ManualInteractionResponse {
    Continue = 'Continue',
    Retry = 'Retry',
    Abort = 'Abort'
}

const WF_GET_MI_ENTIES = 'xmcp.processmonitor.GetMIEntries';
const WF_PROCESS_MI = 'xmcp.processmonitor.ProcessMI';


@Component({
    selector: 'xfm-mon-mi-monitor',
    templateUrl: './mi-monitor.component.html',
    styleUrls: ['./mi-monitor.component.scss']
})
export class ManualInteractionMonitorComponent extends XcTabComponent<string> {

    dataSource: XcRemoteTableDataSource<XoManualInteractionEntry>;

    XDSIconName = XDSIconName;

    constructor(
        injector: Injector,
        i18nService: I18nService,
        settings: ProcessmonitorSettingsService,
        private readonly apiService: ApiService,
        private readonly dialogService: XcDialogService
    ) {
        super(injector);

        i18nService.setTranslations(LocaleService.EN_US, miMonitorTranslations_enUS);
        i18nService.setTranslations(LocaleService.DE_DE, miMonitorTranslations_deDE);

        this.dataSource = new XcRemoteTableDataSource(apiService, i18nService, RTC, WF_GET_MI_ENTIES);
        this.dataSource.output = XoManualInteractionEntryArray;
        this.dataSource.tableInfoClass = XoRemappingTableInfoClass(
            XoTableInfo,
            XoManualInteractionEntry
            // { src: t => t.runtime.start, dst: t => t.runtime.startDateTime },
            // { src: t => t.lastUpdate,  dst: t => t.lastUpdateTime  }
        );

        this.refresh();

        this.dataSource.refreshOnFilterChange = settings.tableRefreshOnFilterChange;
        this.dataSource.actionElements = [
            {
                iconName: XDSIconName.ARROWRIGHT,
                onShow: entry => entry.allowContinue,
                onAction: entry => this.continue([entry]),
                tooltip: i18nService.translate('Continue')
            },
            {
                iconName: XDSIconName.RELOAD,
                onShow: entry => entry.allowRetry,
                onAction: entry => this.retry([entry]),
                tooltip: i18nService.translate('Retry')
            },
            {
                iconName: XDSIconName.CLOSE,
                onShow: entry => entry.allowAbort,
                onAction: entry => this.cancel([entry]),
                tooltip: i18nService.translate('Cancel')
            }
        ];
    }

    refresh() {
        this.dataSource.refresh();
    }

    selectAll() {
        this.dataSource.selectionModel.suppressOperations(() => {
            this.dataSource.rows.forEach(row => this.dataSource.selectionModel.select(row));
        });
    }

    deselectAll() {
        this.dataSource.selectionModel.clear();
    }

    continue(miArr: XoManualInteractionEntry[]) {
        if (miArr) {
            const mis = new XoManualInteractionIdArray();
            miArr.forEach(mi => {
                mis.data.push(new XoManualInteractionId(undefined, mi.id.id));
            });
            const action = new XoManualInteractionResponse();
            action.response = ManualInteractionResponse.Continue;
            this.apiService.startOrder(RTC, WF_PROCESS_MI, [mis, action], XoManualInteractionProcessResponseArray).subscribe(
                result => {
                    if (result && result.errorMessage) {
                        this.dialogService.error(result.errorMessage);
                    }

                    if (result && !result.errorMessage) {
                        const output = result.output[0] as XoManualInteractionProcessResponseArray;

                        let success = true;
                        output.data.forEach(response => {
                            if (success && !response.success) {
                                success = false;
                            }
                        });

                        if (success) {
                            console.log('Action was successful');
                        } else {
                            this.dialogService.error('The continuation of at least one of the selected Manual Interactions failed');
                            console.log('Action failed');
                        }
                        this.refresh();
                    }
                },
                error => { console.error('Error: ', error); }
            );
        }
    }

    continueAllowed(): boolean {
        return !this.dataSource.selectionModel.selection.some(sel => !sel.allowContinue);
    }

    retry(miArr: XoManualInteractionEntry[]) {
        if (miArr) {
            const mis = new XoManualInteractionIdArray();
            miArr.forEach(mi => {
                mis.data.push(new XoManualInteractionId(undefined, mi.id.id));
            });
            const action = new XoManualInteractionResponse();
            action.response = ManualInteractionResponse.Retry;
            this.apiService.startOrder(RTC, WF_PROCESS_MI, [mis, action], XoManualInteractionProcessResponseArray).subscribe(
                result => {
                    if (result && result.errorMessage) {
                        this.dialogService.error(result.errorMessage);
                    }

                    if (result && !result.errorMessage) {
                        const output = result.output[0] as XoManualInteractionProcessResponseArray;

                        let success = true;
                        output.data.forEach(response => {
                            if (success && !response.success) {
                                success = false;
                            }
                        });

                        if (success) {
                            console.log('Action was successful');
                        } else {
                            this.dialogService.error('The retry of at least one of the selected Manual Interactions failed');
                            console.log('Action failed');
                        }
                        this.refresh();
                    }
                },
                error => { console.error('Error: ', error); }
            );
        }
    }

    retryAllowed(): boolean {
        return !this.dataSource.selectionModel.selection.some(sel => !sel.allowRetry);
    }

    cancel(miArr: XoManualInteractionEntry[]) {
        if (miArr) {
            const mis = new XoManualInteractionIdArray();
            miArr.forEach(mi => {
                mis.data.push(new XoManualInteractionId(undefined, mi.id.id));
            });
            // I have not idea why it is called "Response"
            const action = new XoManualInteractionResponse();
            action.response = ManualInteractionResponse.Abort;
            this.apiService.startOrder(RTC, WF_PROCESS_MI, [mis, action], XoManualInteractionProcessResponseArray).subscribe(
                result => {
                    if (result && result.errorMessage) {
                        this.dialogService.error(result.errorMessage);
                    }

                    if (result && !result.errorMessage) {
                        const output = result.output[0] as XoManualInteractionProcessResponseArray;

                        let success = true;
                        output.data.forEach(response => {
                            if (success && !response.success) {
                                success = false;
                            }
                        });

                        if (success) {
                            console.log('Action was successful');
                        } else {
                            this.dialogService.error('The cancelation of at least one of the selected Manual Interactions failed');
                            console.log('Action failed');
                        }
                        this.refresh();
                    }
                },
                error => { console.error('Error: ', error); }
            );
        }
    }

    cancelAllowed(): boolean {
        return !this.dataSource.selectionModel.selection.some(sel => !sel.allowAbort);
    }

}
