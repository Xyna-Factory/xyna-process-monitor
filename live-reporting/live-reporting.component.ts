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
import { Component, Injector } from '@angular/core';

import { ApiService } from '@zeta/api';
import { I18nService, LocaleService } from '@zeta/i18n';
import { XcDialogService, XcRemoteTableDataSource, XcTabBarItem, XcTabComponent, XoTableInfo } from '@zeta/xc';

import { RTC } from '../const';
import { LiveReportingDetailsComponent } from '../live-reporting-details/live-reporting-details.component';
import { ProcessmonitorSettingsService } from '../processmonitor-settings.service';
import { DateTimeConverter } from '../xo/util/date-time-converter';
import { WF_GET_FREQUENCY_CONTROLLED_TASK_DETAILS, WF_GET_LIVE_REPORTING_ENTRIES } from './live-reporting.consts';
import { liveReportingTranslations_deDE } from './locale/live-reporting-translations.de-DE';
import { liveReportingTranslations_enUS } from './locale/live-reporting-translations.en-US';
import { XoFrequencyControlledTaskDetails, XoFrequencyControlledTaskDetailsArray } from './xo/xo-frequency-controlled-task-details.model';
import { XoTaskId } from './xo/xo-task-id.model';


class DateTimeTableInfo extends XoTableInfo {

    protected beforeEncode() {
        super.beforeEncode();

        if (this.columns) {
            const startTimeColumn = this.columns.data.find(column => column.path === XoFrequencyControlledTaskDetails.getAccessorMap().startTimeString);
            const stopTimeColumn = this.columns.data.find(column => column.path === XoFrequencyControlledTaskDetails.getAccessorMap().stopTimeString);

            if (startTimeColumn && stopTimeColumn) {
                if (startTimeColumn.filter) {
                    startTimeColumn.filter = DateTimeConverter.encodeDateTimeFilter(startTimeColumn.filter);
                }
                if (stopTimeColumn.filter) {
                    stopTimeColumn.filter = DateTimeConverter.encodeDateTimeFilter(stopTimeColumn.filter);
                }

                startTimeColumn.path = XoFrequencyControlledTaskDetails.getAccessorMap().startTime;
                stopTimeColumn.path = XoFrequencyControlledTaskDetails.getAccessorMap().stopTime;
            }
        }
    }


    protected afterDecode() {
        super.afterDecode();

        if (this.columns) {
            const startTimeColumn = this.columns.data.find(column => column.path === XoFrequencyControlledTaskDetails.getAccessorMap().startTime);
            const stopTimeColumn = this.columns.data.find(column => column.path === XoFrequencyControlledTaskDetails.getAccessorMap().stopTime);

            if (startTimeColumn.filter) {
                startTimeColumn.filter = DateTimeConverter.decodeDateTimeFilter(startTimeColumn.filter);
            }
            if (stopTimeColumn.filter) {
                stopTimeColumn.filter = DateTimeConverter.decodeDateTimeFilter(stopTimeColumn.filter);
            }

            startTimeColumn.path = XoFrequencyControlledTaskDetails.getAccessorMap().startTimeString;
            stopTimeColumn.path = XoFrequencyControlledTaskDetails.getAccessorMap().stopTimeString;

            const date = new Date();
            const time = date.getTime();
            const dateString0 = DateTimeConverter.timestampToDateTime(time - 54321);
            const dateString1 = DateTimeConverter.timestampToDateTime(time);
            startTimeColumn.filterTooltip = `e. g. >${dateString0}<${dateString1}`;
            stopTimeColumn.filterTooltip = `e. g. >${dateString0}<${dateString1}`;
        }
    }
}

@Component({
    selector: 'xfm-mon-live-reporting',
    templateUrl: './live-reporting.component.html',
    styleUrls: ['./live-reporting.component.scss']
})
export class LiveReportingComponent extends XcTabComponent<string> {

    dataSource: XcRemoteTableDataSource<XoFrequencyControlledTaskDetails>;

    constructor(
        injector: Injector,
        settings: ProcessmonitorSettingsService,
        private readonly apiService: ApiService,
        private readonly dialogService: XcDialogService,
        private readonly i18nService: I18nService
    ) {
        super(injector);

        i18nService.setTranslations(LocaleService.EN_US, liveReportingTranslations_enUS);
        i18nService.setTranslations(LocaleService.DE_DE, liveReportingTranslations_deDE);

        this.dataSource = new XcRemoteTableDataSource(apiService, i18nService, RTC, WF_GET_LIVE_REPORTING_ENTRIES);
        this.dataSource.output = XoFrequencyControlledTaskDetailsArray;
        this.dataSource.tableInfoClass = DateTimeTableInfo;
        /*this.dataSource.tableInfoClass = XoRemappingTableInfoClass(
            XoTableInfo,
            XoFrequencyControlledTaskDetails,
            { src: t => t.startTime, dst: t => t.startTimeString },
            { src: t => t.stopTime,  dst: t => t.stopTimeString }
        );*/
        this.refresh();

        this.dataSource.selectionModel.selectionChangeForUnchangedSelection = true;
        this.dataSource.selectionModel.activatedChange.subscribe(() => this.showDetails());
        this.dataSource.refreshOnFilterChange = settings.tableRefreshOnFilterChange;
    }

    showDetails() {
        const selection = this.dataSource.selectionModel.selection[0];

        this.apiService.startOrder(
            RTC, WF_GET_FREQUENCY_CONTROLLED_TASK_DETAILS,
            new XoTaskId(undefined, selection.taskId.id),
            XoFrequencyControlledTaskDetails
        ).subscribe(res => {
            if (res && !res.errorMessage) {
                const task = res.output[0] as XoFrequencyControlledTaskDetails;

                const item: XcTabBarItem<XoFrequencyControlledTaskDetails> = {
                    name: String(this.i18nService.translate('Task') + ' ' + task.taskId.id),
                    component: LiveReportingDetailsComponent,
                    closable: true,
                    data: task
                };
                this.openPeer(item).subscribe();
            } else {
                this.dialogService.error(res.errorMessage);
            }
        });
    }

    refresh() {
        this.dataSource.refresh();
    }

}
