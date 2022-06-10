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
import { XcDataSource } from '@zeta/xc';
import { XcGraphData, XcGraphSlice, XcTimeInterval } from '@zeta/xc/xc-graph/xc-graph-data-source';
import { XoGraphInfo } from '@zeta/xc/xc-graph/xc-remote-graph-data-source';

import { LiveReportingTimeAxisDimension, LiveReportingTimeAxisDimensionHelper } from './live-reporting-time-helper';


export class LiveReportingGraphDataSource extends XcDataSource<XcGraphData> {

    graphInfo: XoGraphInfo;

    private _graphDataList: XcGraphData[] = [];
    private _graphTimeSlices: XcGraphSlice[] = [];


    get resolution(): number {
        return this.graphInfo ? this.graphInfo.resolution : null;
    }

    private _timeAxisDimension: LiveReportingTimeAxisDimension = LiveReportingTimeAxisDimension.R1K;

    get timeAxisDimension(): LiveReportingTimeAxisDimension {
        return this._timeAxisDimension;
    }

    name = '';
    unit = '';

    private _timeInterval: XcTimeInterval;
    get timeInterval(): XcTimeInterval {
        return this._timeInterval;
    }

    set timeInterval(value: XcTimeInterval) {
        this._timeInterval = value;
    }

    present(graphInfo: XoGraphInfo, graphData: XcGraphData) {

        this.unit = graphInfo.yAxisUnit ? graphInfo.yAxisUnit : '';
        this.graphInfo = graphInfo;
        this.timeInterval = graphInfo.intervals.data[0];

        this._timeAxisDimension = LiveReportingTimeAxisDimensionHelper.getTimeAxisDimension(this.timeInterval);

        const liveReportingGenerateSlice = (interval: XcTimeInterval, resolution: number): number[] => {
            const n = Math.ceil((interval.timeTo - interval.timeAt) / resolution);
            const vals: number[] = [];
            for (let i = 0; i < n; i++) {
                vals.push(interval.timeAt + (resolution * i));
            }
            vals[n - 1] = interval.timeTo;
            return vals;
        };

        const slice: XcGraphSlice = {
            time: this.timeInterval.timeAt,
            values: liveReportingGenerateSlice(this.timeInterval, graphInfo.resolution)
        };

        this._graphTimeSlices[0] = slice;
        this._graphDataList[0] = graphData;

        this.data = this._graphDataList;

    }

}
