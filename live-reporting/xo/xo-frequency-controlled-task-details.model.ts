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
import { XoArray, XoArrayClass, XoObject, XoObjectClass, XoProperty, XoTransient, XoUnique } from '@zeta/api';
import { DateTimeConverter } from '../../xo/util/date-time-converter';

import { XoGraphDatasourceArray } from './xo-graph-data-source.model';
import { XoTaskId } from './xo-task-id.model';


@XoObjectClass(null, 'xmcp.processmonitor.datatypes', 'FrequencyControlledTaskDetails')
export class XoFrequencyControlledTaskDetails extends XoObject {


    @XoProperty(XoTaskId)
    @XoUnique()
    taskId: XoTaskId = new XoTaskId();


    @XoProperty()
    eventCreationInfo: string;


    @XoProperty()
    label: string;


    @XoProperty()
    eventCount: number;


    @XoProperty()
    failedEvents: number;


    @XoProperty()
    finishedEvents: number;


    @XoProperty()
    eventsToLaunch: number;


    @XoProperty()
    taskStatus: string;


    @XoProperty()
    startTime: number;

    @XoProperty()
    @XoTransient()
    startTimeString: string;


    @XoProperty()
    stopTime: number;

    @XoProperty()
    @XoTransient()
    stopTimeString: string;


    @XoProperty()
    applicationName: string;


    @XoProperty()
    versionName: string;


    @XoProperty()
    workspaceName: string;


    @XoProperty()
    runningEvents: number;


    @XoProperty()
    maxEvents: number;


    @XoProperty(XoGraphDatasourceArray)
    datasources: XoGraphDatasourceArray = new XoGraphDatasourceArray();

    protected afterDecode() {
        this.startTimeString = DateTimeConverter.timestampToDateTime(this.startTime || 0);
        this.stopTimeString = this.stopTime >= 0 ? DateTimeConverter.timestampToDateTime(this.stopTime || 0) : '';
    }

}

@XoArrayClass(XoFrequencyControlledTaskDetails)
export class XoFrequencyControlledTaskDetailsArray extends XoArray<XoFrequencyControlledTaskDetails> {
}
