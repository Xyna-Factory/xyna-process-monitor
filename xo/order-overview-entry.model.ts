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
import { XoArray, XoArrayClass, XoI18n, XoObject, XoObjectClass, XoProperty, XoTransient, XoUnique } from '@zeta/api';
import { boxedNumberToString, isNumber } from '@zeta/base';

import { XoTimeSpan } from './time-span.model';


@XoObjectClass(null, 'xmcp.processmonitor.datatypes', 'OrderOverviewEntry')
export class XoOrderOverviewEntry extends XoObject {

    @XoProperty()
    @XoUnique()
    id: string;

    @XoProperty()
    priority: number;

    @XoProperty()
    @XoI18n()
    status: string;

    @XoProperty(XoTimeSpan)
    runTime: XoTimeSpan;

    @XoProperty()
    typeName: string;

    @XoProperty()
    monitoringLevel: number;

    @XoProperty()
    @XoTransient()
    imported = false;

    @XoProperty()
    @XoTransient()
    parentId: string;


    constructor(_ident?: string, id?: string, parentId?: string) {
        super(_ident);
        this.id = id;
        this.parentId = parentId;
    }


    protected afterDecode() {
        super.afterDecode();

        // FIXME remove this as soon as backend consequently returns strings for Order ID
        if (isNumber(this.id)) {
            this.id = boxedNumberToString(<number><unknown> this.id);
        }
    }


    get isKillable(): boolean {
        return this.status !== 'Finished' &&
               // status of failed orders
               this.status !== 'Error' &&
               this.status !== 'Canceled' &&
               this.status !== 'XynaException' &&
               this.status !== 'RuntimeException' &&
               this.status !== 'Scheduling timeout' &&
               this.status !== 'Failed';
    }
}


@XoArrayClass(XoOrderOverviewEntry)
export class XoOrderOverviewEntryArray extends XoArray<XoOrderOverviewEntry> {
}
