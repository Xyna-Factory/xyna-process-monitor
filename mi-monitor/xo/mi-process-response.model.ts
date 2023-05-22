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
import { XoArray, XoArrayClass, XoObject, XoObjectClass, XoProperty, XoUnique } from '@zeta/api';

import { XoManualInteractionId } from './mi-id.model';


@XoObjectClass(null, 'xmcp.processmonitor.datatypes', 'ManualInteractionProcessResponse')
export class XoManualInteractionProcessResponse extends XoObject {

    @XoProperty(XoManualInteractionId)
    @XoUnique()
    manualInteractionId: XoManualInteractionId = new XoManualInteractionId();

    @XoProperty()
    $data: string;

    @XoProperty()
    success: boolean;

    @XoProperty()
    reason: string;
}


@XoArrayClass(XoManualInteractionProcessResponse)
export class XoManualInteractionProcessResponseArray extends XoArray<XoManualInteractionProcessResponse> {
}
