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
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { XcAutocompleteDataWrapper } from '@zeta/xc';
import { XcPlotDataChangeBehavior, XcPlotDataSource } from '@zeta/xc/xc-plot/xc-plot-data-source';

import { DataSourceUpdateInterval, LiveReportingDataSourceName } from '../classes/live-reporting-time-helper';


@Component({
    selector: 'live-reporting-plot',
    templateUrl: './live-reporting-plot.component.html',
    styleUrls: ['./live-reporting-plot.component.scss']
})
export class LiveReportingPlotComponent {

    intervalHandler: number;
    updateInterval: string = DataSourceUpdateInterval.Manual;

    @Input()
    name: LiveReportingDataSourceName;

    @Output()
    readonly requestDataChange = new EventEmitter<LiveReportingDataSourceName>();

    dataSourceUpdateIntervalDataWrapper = new XcAutocompleteDataWrapper(
        () => this.updateInterval,
        (value: DataSourceUpdateInterval) => {
            this.updateInterval = value;
            this.updateRequestInterval(value);
        }
    );

    plotDataSource: XcPlotDataSource;

    private updateRequestInterval(value: DataSourceUpdateInterval) {

        if (this.intervalHandler) {
            window.clearInterval(this.intervalHandler);
        }

        let interval = 0;

        switch (value) {
            case DataSourceUpdateInterval.Auto1: interval = 1000; break;
            case DataSourceUpdateInterval.Auto4: interval = 4000; break;
            case DataSourceUpdateInterval.Auto30: interval = 30000; break;
        }

        if (interval) {
            this.intervalHandler = window.setInterval(() => this.requestDataChange.emit(this.name), interval);
        }

    }

    refresh() {
        this.requestDataChange.emit(this.name);
    }

    constructor() {
        this.dataSourceUpdateIntervalDataWrapper.values = Object.keys(DataSourceUpdateInterval)
            .map(key => ({name: DataSourceUpdateInterval[key], value: DataSourceUpdateInterval[key]}));

        this.plotDataSource = new XcPlotDataSource();
        // set to null in order to find out if the data requesting function needs to set it or not
        this.plotDataSource.plotDataInfo.bootstrap = true;
        this.plotDataSource.dataChangeBehavior = XcPlotDataChangeBehavior.OptimizeViewport;
        this.plotDataSource.setDefaultTimeTransformationFunction('x');
        this.plotDataSource.zoomOptimization = true;
        this.plotDataSource.showGeneratedPopup = true;
    }

}
