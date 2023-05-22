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
import { XoArray, XoArrayClass, XoI18n, XoObject, XoObjectClass, XoProperty, XoUnique } from '@zeta/api';

import { XoManualInteractionId } from './mi-id.model';


@XoObjectClass(null, 'xmcp.processmonitor.datatypes', 'ManualInteractionEntry')
export class XoManualInteractionEntry extends XoObject {

    @XoProperty(XoManualInteractionId)
    @XoUnique()
    id: XoManualInteractionId = new XoManualInteractionId();

    @XoProperty()
    @XoI18n()
    reason: string;

    @XoProperty()
    type: string;

    @XoProperty()
    userGroup: string;

    @XoProperty()
    @XoI18n()
    todo: string;

    @XoProperty()
    priority: number;

    @XoProperty()
    monitoringCode: number;

    @XoProperty()
    orderType: string;

    @XoProperty()
    sessionId: string;

    @XoProperty()
    parentId: number;

    @XoProperty()
    application: string;

    @XoProperty()
    version: string;

    @XoProperty()
    workspace: string;

    @XoProperty()
    allowContinue: boolean;

    @XoProperty()
    allowRetry: boolean;

    @XoProperty()
    allowAbort: boolean;

    @XoProperty()
    startTime: number;

    @XoProperty()
    lastUpdate: number;
}


@XoArrayClass(XoManualInteractionEntry)
export class XoManualInteractionEntryArray extends XoArray<XoManualInteractionEntry> {
}
