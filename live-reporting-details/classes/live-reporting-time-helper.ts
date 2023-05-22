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
import { XcTimeInterval } from '@zeta/xc/xc-graph/xc-graph-data-source';


export enum DataSourceUpdateInterval {
    Manual = 'Manual',
    Auto1 = 'Auto (1s)',
    Auto4 = 'Auto (4s)',
    Auto30 = 'Auto (30)'
}

// can be translated
export enum LiveReportingDataSourceName {
    ExecutionResponseTime = 'Execution response time',
    Failed = 'Failed',
    FailedRate = 'Failed rate',
    Finished = 'Finished',
    FinishedRate = 'Finished rate',
    OverallResponseTime = 'Overall response time',
    Running = 'Running',
    Waiting = 'Waiting'

}

// must not be translated
export enum LiveReportingDataSourceServerType {
    ExecutionResponseTime = 'EXECUTION_RESPONSE_TIME',
    Failed = 'FAILED',
    FailedRate = 'FAILED_RATE',
    Finished = 'FINISHED',
    FinishedRate = 'FINISHED_RATE',
    OverallResponseTime = 'OVERALL_RESPONSE_TIME',
    Running = 'RUNNING',
    Waiting = 'WAITING'

}

export enum LiveReportingTimeAxisDimension {
    R10 = '10',
    R100 = '100',
    R500 = '500',
    R1K = '1000',
    R2K = '2000',
    R3K = '3000',
    R5K = '5000',
    R7HK = '7500',
    R10K = '10000',
    R15K = '15000',
    R20K = '20000',
    R40K = '40000',
    R50K = '50000',
    R100K = '100000',
    R200K = '200000',
    R500K = '500000',
    R1M = '1000000',
    R1HM = '1500000',
    R2M = '2000000',
    R4M = '4000000'
}


export class LiveReportingTimeAxisDimensionHelper {

    static getTimeAxisDimension(interval: XcTimeInterval, graphWidth = 1200): LiveReportingTimeAxisDimension {

        const barWidthMinimum = 10;
        const duration = interval.timeTo - interval.timeAt;
        let resolution = 10;

        Object.keys(LiveReportingTimeAxisDimension).some(key => {
            resolution = parseInt(LiveReportingTimeAxisDimension[key], 10);
            if (typeof resolution === 'number') {
                const relDuration = duration / resolution;
                const barWidth = graphWidth / relDuration;
                return (barWidth >= barWidthMinimum);
            }
            return false;
        });

        return ('' + resolution) as LiveReportingTimeAxisDimension;
    }


    static getResolution(dimension: LiveReportingTimeAxisDimension): number {
        return parseInt(dimension, 10);
    }

    static recommendResolution(duration: number, graphWidth = 1200): number {
        const interval: XcTimeInterval = {
            timeAt: 0, timeTo: duration
        };
        const dim = LiveReportingTimeAxisDimensionHelper.getTimeAxisDimension(interval, graphWidth);
        return LiveReportingTimeAxisDimensionHelper.getResolution(dim);
    }

}
