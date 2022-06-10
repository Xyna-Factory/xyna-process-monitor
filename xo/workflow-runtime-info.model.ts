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
import { Xo, XoArray, XoArrayClass, XoObjectClass, XoProperty, XoTransient } from '@zeta/api';

import { XoCatchableRuntimeInfo } from './catchable-runtime-info.model';


@XoObjectClass(XoCatchableRuntimeInfo, 'xmcp.processmonitor.datatypes', 'WorkflowRuntimeInfo')
export class XoWorkflowRuntimeInfo extends XoCatchableRuntimeInfo {

    @XoProperty()
    @XoTransient()
    orderId: string;


    getInput(): Xo[] {
        return this.inputObjects.data;
    }
}


@XoArrayClass(XoWorkflowRuntimeInfo)
export class XoWorkflowRuntimeInfoArray extends XoArray<XoWorkflowRuntimeInfo> {
}
