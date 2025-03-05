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
import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';

import { ApiService } from '@zeta/api';
import { I18nService, LocaleService } from '@zeta/i18n';
import { XcDialogService, XcTabComponent } from '@zeta/xc';
import { XoGraphDataArray, XoGraphInfo, XoTimeInterval, XoTimeIntervalArray } from '@zeta/xc/xc-graph/xc-remote-graph-data-source';
import { XcPlotDataSource } from '@zeta/xc/xc-plot/xc-plot-data-source';

import { RTC } from '../const';
import { WF_CANCEL_TASK, WF_GET_FREQUENCY_CONTROLLED_TASK_DETAILS, WF_GET_GRAPH_DATA } from '../live-reporting/live-reporting.consts';
import { XoFrequencyControlledTaskDetails } from '../live-reporting/xo/xo-frequency-controlled-task-details.model';
import { XoGraphDatasource } from '../live-reporting/xo/xo-graph-data-source.model';
import { LiveReportingDataSourceName, LiveReportingDataSourceServerType, LiveReportingTimeAxisDimensionHelper } from './classes/live-reporting-time-helper';
import { GraphInfoDataToPlotDataSourceConverter } from './components/graph-info-data-to-plot-data-source.converter';
import { LiveReportingPlotComponent } from './components/live-reporting-plot.component';
import { liveReportingDetailsTranslations_deDE } from './locale/live-reporting-details-translations.de-DE';
import { liveReportingDetailsTranslations_enUS } from './locale/live-reporting-details-translations.en-US';


@Component({
    selector: 'xfm-mon-live-reporting-details',
    templateUrl: './live-reporting-details.component.html',
    styleUrls: ['./live-reporting-details.component.scss'],
    standalone: false
})
export class LiveReportingDetailsComponent extends XcTabComponent<void, XoFrequencyControlledTaskDetails> implements OnInit {

    task: XoFrequencyControlledTaskDetails;
    // enum access in the view
    LiveReportingDataSourceName = LiveReportingDataSourceName;


    @ViewChild('executionResponseTimePlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _executionResponseTimePlot: LiveReportingPlotComponent;
    private _executionResponseTimePlotFlag = false;
    get executionResponseTimePlotFlag() {
        return this._executionResponseTimePlotFlag;
    }
    set executionResponseTimePlotFlag(value) {
        this._executionResponseTimePlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.ExecutionResponseTime, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    @ViewChild('failedPlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _failedPlot: LiveReportingPlotComponent;
    private _failedPlotFlag = false;
    get failedPlotFlag() {
        return this._failedPlotFlag;
    }
    set failedPlotFlag(value) {
        this._failedPlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.Failed, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    @ViewChild('failedRatePlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _failedRatePlot: LiveReportingPlotComponent;
    private _failedRatePlotFlag = false;
    get failedRatePlotFlag() {
        return this._failedRatePlotFlag;
    }
    set failedRatePlotFlag(value) {
        this._failedRatePlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.FailedRate, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    @ViewChild('finishedPlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _finishedPlot: LiveReportingPlotComponent;
    private _finishedPlotFlag = false;
    get finishedPlotFlag() {
        return this._finishedPlotFlag;
    }
    set finishedPlotFlag(value) {
        this._finishedPlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.Finished, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    @ViewChild('finishedRatePlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _finishedRatePlot: LiveReportingPlotComponent;
    private _finishedRatePlotFlag = false;
    get finishedRatePlotFlag() {
        return this._finishedRatePlotFlag;
    }
    set finishedRatePlotFlag(value) {
        this._finishedRatePlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.FinishedRate, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    @ViewChild('overallResponseTimePlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _overallResponseTimePlot: LiveReportingPlotComponent;
    private _overallResponseTimePlotFlag = false;
    get overallResponseTimePlotFlag() {
        return this._overallResponseTimePlotFlag;
    }
    set overallResponseTimePlotFlag(value) {
        this._overallResponseTimePlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.OverallResponseTime, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    @ViewChild('runningPlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _runningPlot: LiveReportingPlotComponent;
    private _runningPlotFlag = false;
    get runningPlotFlag() {
        return this._runningPlotFlag;
    }
    set runningPlotFlag(value) {
        this._runningPlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.Running, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    @ViewChild('waitingPlot', { read: LiveReportingPlotComponent, static: false })
    private readonly _waitingPlot: LiveReportingPlotComponent;
    private _waitingPlotFlag = false;
    get waitingPlotFlag() {
        return this._waitingPlotFlag;
    }
    set waitingPlotFlag(value) {
        this._waitingPlotFlag = value;
        this._graphFlagsChanged(LiveReportingDataSourceName.Waiting, value);
        if (!value) {
            this.cdr.detectChanges();
        }
    }

    get allDataSourcesSelected(): boolean {
        return this.executionResponseTimePlotFlag &&
            this.failedPlotFlag &&
            this.failedRatePlotFlag &&
            this.finishedPlotFlag &&
            this.finishedRatePlotFlag &&
            this.overallResponseTimePlotFlag &&
            this.runningPlotFlag &&
            this.waitingPlotFlag;
    }

    get noDataSourcesSelected(): boolean {
        return !this.executionResponseTimePlotFlag &&
            !this.failedPlotFlag &&
            !this.failedRatePlotFlag &&
            !this.finishedPlotFlag &&
            !this.finishedRatePlotFlag &&
            !this.overallResponseTimePlotFlag &&
            !this.runningPlotFlag &&
            !this.waitingPlotFlag;
    }

    private readonly _progressString: string;
    get progressString(): string {
        return this._progressString
            .replace('${started}', '' + this.task.eventCount)
            .replace('${total}', '' + this.task.maxEvents);
    }

    constructor(@Optional() injector: Injector,
        private readonly apiService: ApiService,
        private readonly dialogService: XcDialogService,
        private readonly i18nService: I18nService,
        private readonly cdr: ChangeDetectorRef
    ) {
        super(injector);

        i18nService.setTranslations(LocaleService.EN_US, liveReportingDetailsTranslations_enUS);
        i18nService.setTranslations(LocaleService.DE_DE, liveReportingDetailsTranslations_deDE);

        this.task = this.injectedData.data as XoFrequencyControlledTaskDetails;
        this._progressString = this.i18nService.translate('${started} of ${total} started'); // let's replace params by the components to save unnecessesary calculations
    }

    ngOnInit() {
        this.executionResponseTimePlotFlag = true;
    }

    setAllDataSources(to: boolean) {
        this.executionResponseTimePlotFlag = to;
        this.overallResponseTimePlotFlag = to;
        this.failedPlotFlag = to;
        this.failedRatePlotFlag = to;
        this.finishedPlotFlag = to;
        this.finishedRatePlotFlag = to;
        this.runningPlotFlag = to;
        this.waitingPlotFlag = to;
    }

    private _graphFlagsChanged(which: LiveReportingDataSourceName, value: boolean) {

        if (value) {
            const info = new XoGraphInfo();
            let dsType: XoGraphDatasource;

            switch (which) {
                case LiveReportingDataSourceName.ExecutionResponseTime: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.ExecutionResponseTime === ds.type);
                } break;

                case LiveReportingDataSourceName.Failed: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.Failed === ds.type);
                } break;

                case LiveReportingDataSourceName.FailedRate: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.FailedRate === ds.type);
                } break;

                case LiveReportingDataSourceName.Finished: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.Finished === ds.type);
                } break;

                case LiveReportingDataSourceName.FinishedRate: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.FinishedRate === ds.type);
                } break;

                case LiveReportingDataSourceName.OverallResponseTime: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.OverallResponseTime === ds.type);
                } break;

                case LiveReportingDataSourceName.Running: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.Running === ds.type);
                } break;

                case LiveReportingDataSourceName.Waiting: {
                    dsType = this.task.datasources.data.find(ds => LiveReportingDataSourceServerType.Waiting === ds.type);
                } break;
            }

            if (dsType) {
                info.intervals = new XoTimeIntervalArray();
                const timeInterval = new XoTimeInterval();
                info.intervals.data.push(timeInterval);

                timeInterval.timeAt = this.task.startTime;
                if (this.task.stopTime >= 0) {
                    timeInterval.timeTo = this.task.stopTime;
                } else {
                    timeInterval.timeTo = new Date().getTime();
                }

                const duration = timeInterval.timeTo - timeInterval.timeAt;
                const resolution = LiveReportingTimeAxisDimensionHelper.recommendResolution(duration);
                info.resolution = resolution;

                this.apiService.startOrder(RTC, WF_GET_GRAPH_DATA, [info, dsType, this.task.taskId], [XoGraphInfo, XoGraphDataArray]).subscribe(res => {
                    if (res && !res.errorMessage) {
                        const graphInfo = res.output[0] as XoGraphInfo;
                        const dataArray = res.output[1] as XoGraphDataArray;

                        const dataSource = GraphInfoDataToPlotDataSourceConverter.convert(graphInfo, dataArray);

                        this.presentData(which, dataSource);
                    } else {
                        this.dialogService.error(res.errorMessage);
                    }
                });
            }
        }

    }

    private presentData(toWhichPlot: LiveReportingDataSourceName, plotDataSource: XcPlotDataSource) {

        void Promise.resolve().then(() => {
            switch (toWhichPlot) {
                case LiveReportingDataSourceName.ExecutionResponseTime: {
                    if (this._executionResponseTimePlot && this._executionResponseTimePlot.plotDataSource) {
                        if (this._executionResponseTimePlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._executionResponseTimePlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._executionResponseTimePlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._executionResponseTimePlot.plotDataSource.clear();
                        this._executionResponseTimePlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;

                case LiveReportingDataSourceName.Failed: {
                    if (this._failedPlot && this._failedPlot.plotDataSource) {
                        if (this._failedPlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._failedPlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._failedPlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._failedPlot.plotDataSource.clear();
                        this._failedPlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;

                case LiveReportingDataSourceName.FailedRate: {
                    if (this._failedRatePlot && this._failedRatePlot.plotDataSource) {
                        if (this._failedRatePlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._failedRatePlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._failedRatePlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._failedRatePlot.plotDataSource.clear();
                        this._failedRatePlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;

                case LiveReportingDataSourceName.Finished: {
                    if (this._finishedPlot && this._finishedPlot.plotDataSource) {
                        if (this._finishedPlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._finishedPlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._finishedPlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._finishedPlot.plotDataSource.clear();
                        this._finishedPlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;

                case LiveReportingDataSourceName.FinishedRate: {
                    if (this._finishedRatePlot && this._finishedRatePlot.plotDataSource) {
                        if (this._finishedRatePlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._finishedRatePlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._finishedRatePlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._finishedRatePlot.plotDataSource.clear();
                        this._finishedRatePlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;

                case LiveReportingDataSourceName.OverallResponseTime: {
                    if (this._overallResponseTimePlot && this._overallResponseTimePlot.plotDataSource) {
                        if (this._overallResponseTimePlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._overallResponseTimePlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._overallResponseTimePlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._overallResponseTimePlot.plotDataSource.clear();
                        this._overallResponseTimePlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;

                case LiveReportingDataSourceName.Running: {
                    if (this._runningPlot && this._runningPlot.plotDataSource) {
                        if (this._runningPlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._runningPlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._runningPlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._runningPlot.plotDataSource.clear();
                        this._runningPlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;

                case LiveReportingDataSourceName.Waiting: {
                    if (this._waitingPlot && this._waitingPlot.plotDataSource) {
                        if (this._waitingPlot.plotDataSource.plotDataInfo.bootstrap) {
                            this._waitingPlot.plotDataSource.plotDataInfo = plotDataSource.plotDataInfo;
                            this._waitingPlot.plotDataSource.plotDataInfo.bootstrap = false;
                        }
                        this._waitingPlot.plotDataSource.clear();
                        this._waitingPlot.plotDataSource.addPairs(plotDataSource.pairs);
                    }
                } break;
            }
        });
    }

    cancel() {

        this.apiService.startOrder(RTC, WF_CANCEL_TASK, this.task.taskId).subscribe(res => {
            if (res && !res.errorMessage) {
                this.dismiss();
            } else {
                this.dialogService.error(res.errorMessage);
            }
        }, err => this.dialogService.error(err));
    }

    requestData(name: LiveReportingDataSourceName) {
        this._graphFlagsChanged(name, true);
    }

    refresh() {
        // TODO
        this.apiService.startOrder(RTC, WF_GET_FREQUENCY_CONTROLLED_TASK_DETAILS, this.task.taskId, XoFrequencyControlledTaskDetails).subscribe(res => {
            if (res && !res.errorMessage) {
                const task = res.output[0] as XoFrequencyControlledTaskDetails;
                this.task = task;
            } else {
                this.dialogService.error(res.errorMessage);
            }
        });
    }

    getPlotClass(): string[] {
        const numberOfPlots =
            (this.executionResponseTimePlotFlag ? 1 : 0)
            + (this.failedPlotFlag ? 1 : 0)
            + (this.failedRatePlotFlag ? 1 : 0)
            + (this.finishedPlotFlag ? 1 : 0)
            + (this.finishedRatePlotFlag ? 1 : 0)
            + (this.overallResponseTimePlotFlag ? 1 : 0)
            + (this.runningPlotFlag ? 1 : 0)
            + (this.waitingPlotFlag ? 1 : 0);

        const classes: string[] = [];
        classes.push('plot-grid');
        if (numberOfPlots === 1) {
            classes.push('single-plot');
        } else {
            classes.push('multi-plots');
        }
        return classes;
    }

}
