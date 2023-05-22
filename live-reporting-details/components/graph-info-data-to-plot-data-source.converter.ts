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
import { isString } from '@zeta/base';
import { XoGraphDataArray, XoGraphInfo } from '@zeta/xc';
import { XcPlotDataInfo, XcPlotDataPair, XcPlotDataSource } from '@zeta/xc/xc-plot/xc-plot-data-source';


export class GraphInfoDataToPlotDataSourceConverter {

    static convert(graphInfo: XoGraphInfo, graphData: XoGraphDataArray): XcPlotDataSource {

        const dataSource = new XcPlotDataSource();

        // Convert Info
        const info = new XcPlotDataInfo();

        info.xUnitLabel = graphInfo.xAxisName || 'Time';
        info.xUnit = graphInfo.xAxisUnit;

        const firstTimeInterval = graphInfo.intervals.data[0];
        info.xMin = isString(firstTimeInterval.timeAt) ? parseInt(firstTimeInterval.timeAt, 10) : firstTimeInterval.timeAt;
        info.xMax = isString(firstTimeInterval.timeTo) ? parseInt(firstTimeInterval.timeTo, 10) : firstTimeInterval.timeTo;

        info.yUnitLabel = graphInfo.yAxisName;
        info.yUnit = graphInfo.yAxisUnit;
        info.yMin = isString(graphInfo.minValue) ? parseInt(graphInfo.minValue, 10) : graphInfo.minValue;
        info.yMax = isString(graphInfo.maxValue) ? parseInt(graphInfo.maxValue, 10) : graphInfo.maxValue;

        dataSource.plotDataInfo = info;

        // Convert Data

        const resolution = isString(graphInfo.resolution) ? parseInt(graphInfo.resolution, 10) : graphInfo.resolution;
        const firstSlice = graphData.data[0].slices.data[0];
        const dataArray: XcPlotDataPair[] = [];
        let x = isString(firstSlice.time) ? parseInt(firstSlice.time, 10) : firstSlice.time;
        let y: number;
        for (y of firstSlice.values) {
            x += resolution;
            dataArray.push(XcPlotDataPair.build(x, y));
        }

        dataSource.addPairs(dataArray);

        dataSource.setDefaultTimeTransformationFunction('x');
        return dataSource;
    }

}
