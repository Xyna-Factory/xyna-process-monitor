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
import { IterationInfoController, XoRuntimeInfoArray } from '@pmod/xo/runtime-info.model';
import { XoArray, XoArrayClass, XoObjectClass, XoProperty } from '@zeta/api';

import { XoStepRuntimeInfo } from './step-runtime-info.model';


@XoObjectClass(XoStepRuntimeInfo, 'xmcp.processmonitor.datatypes', 'CompensationRuntimeInfo')
export class XoCompensationRuntimeInfo extends XoStepRuntimeInfo {

    @XoProperty(XoRuntimeInfoArray)
    runtimeInfos: XoRuntimeInfoArray;


    setIterationInfoController(value: IterationInfoController) {
        super.setIterationInfoController(value);

        // pass to all sub-RuntimeInfos
        if (this.runtimeInfos) {
            this.runtimeInfos.data.forEach(runtimeInfo => runtimeInfo.setIterationInfoController(value));
        }
    }
}


@XoArrayClass(XoCompensationRuntimeInfo)
export class XoCompensationRuntimeInfoArray extends XoArray<XoCompensationRuntimeInfo> {}
