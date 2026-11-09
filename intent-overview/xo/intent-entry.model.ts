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
import { XoArray, XoArrayClass, XoObject, XoObjectClass, XoProperty, XoTransient, XoUnique } from '@zeta/api';
import { DateTimeConverter } from '../../xo/util/date-time-converter';


@XoObjectClass(null, 'xmcp.processmonitor.intent', 'IntentEntry')
export class XoIntentEntry extends XoObject {

    @XoProperty()
    @XoUnique()
    id: string;

    @XoProperty()
    nextIntent: string;

    @XoProperty()
    rootIntent: string;

    @XoProperty()
    startTime: number;

    @XoProperty()
    lastUpdate: number;

    @XoProperty()
    failed: string;

    @XoProperty()
    finished: string;

    @XoProperty()
    @XoTransient()
    startTimeString: string;

    @XoProperty()
    @XoTransient()
    lastUpdateString: string;


    protected afterDecode() {
        super.afterDecode();

        // convert timestamps to readable UTC format
        const localFlagBackup = DateTimeConverter.localTime;
        DateTimeConverter.localTime = false;
        this.startTimeString = this.startTime > 0 ? DateTimeConverter.timestampToDateTime(this.startTime) : '';
        this.lastUpdateString = this.lastUpdate > 0 ? DateTimeConverter.timestampToDateTime(this.lastUpdate) : '';
        DateTimeConverter.localTime = localFlagBackup;
    }
}


@XoArrayClass(XoIntentEntry)
export class XoIntentEntryArray extends XoArray<XoIntentEntry> {
}
