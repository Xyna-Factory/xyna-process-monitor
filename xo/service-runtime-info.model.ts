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
import { Xo, XoArray, XoArrayClass, XoObjectClass, XoProperty } from '@zeta/api';
import { boxedNumberToString, isNumber } from '@zeta/base';

import { XoCatchableRuntimeInfo } from './catchable-runtime-info.model';


@XoObjectClass(XoCatchableRuntimeInfo, 'xmcp.processmonitor.datatypes', 'ServiceRuntimeInfo')
export class XoServiceRuntimeInfo extends XoCatchableRuntimeInfo {

    @XoProperty()
    orderId: string;


    protected afterDecode() {
        super.afterDecode();

        // FIXME remove this as soon as backend consequently returns strings for Order ID
        if (isNumber(this.orderId)) {
            this.orderId = boxedNumberToString(<number><unknown> this.orderId);
        }
    }


    getInput(): Xo[] {
        return this.inputObjects.data;
    }
}


@XoArrayClass(XoServiceRuntimeInfo)
export class XoServiceRuntimeInfoArray extends XoArray<XoServiceRuntimeInfo> {
}
