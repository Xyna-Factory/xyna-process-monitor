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
import { XoObject, XoObjectClass, XoProperty, XoTransient } from '@zeta/api';

import { DateTimeConverter } from './util/date-time-converter';


@XoObjectClass(null, 'xmcp.processmonitor.datatypes', 'RunningTime')
export class XoRunningTime extends XoObject {

    @XoProperty()
    start: number;

    @XoProperty()
    lastUpdate: number;


    @XoProperty()
    @XoTransient()
    startDateTime: string;

    @XoProperty()
    @XoTransient()
    startDateTimeUTC: string;


    @XoProperty()
    @XoTransient()
    lastUpdateDateTime: string;

    @XoProperty()
    @XoTransient()
    lastUpdateDateTimeUTC: string;


    @XoProperty()
    @XoTransient()
    duration: string;


    protected afterDecode() {
        super.afterDecode();

        // convert timestamps to readable local and UTC format
        const localFlagBackup = DateTimeConverter.localTime;

        DateTimeConverter.localTime = true;
        this.startDateTime = this.start > 0 ? DateTimeConverter.timestampToDateTime(this.start) : '';
        this.lastUpdateDateTime = this.lastUpdate > 0 ? DateTimeConverter.timestampToDateTime(this.lastUpdate) : '';

        DateTimeConverter.localTime = false;
        this.startDateTimeUTC = this.start > 0 ? DateTimeConverter.timestampToDateTime(this.start) : '';
        this.lastUpdateDateTimeUTC = this.lastUpdate > 0 ? DateTimeConverter.timestampToDateTime(this.lastUpdate) : '';

        DateTimeConverter.localTime = localFlagBackup;

        // calculate duration
        if (this.start > 0 && this.lastUpdate > 0) {
            this.duration = DateTimeConverter.durationString(DateTimeConverter.duration(this.lastUpdate - this.start));
        }
    }
}
