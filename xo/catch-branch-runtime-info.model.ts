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
import { XoArray, XoArrayClass, XoObjectClass, XoProperty } from '@zeta/api';

import { XoBranchRuntimeInfo } from './branch-runtime-info.model';
import { XoError } from './error.model';


@XoObjectClass(XoBranchRuntimeInfo, 'xmcp.processmonitor.datatypes', 'CatchBranchRuntimeInfo')
export class XoCatchBranchRuntimeInfo extends XoBranchRuntimeInfo {

    @XoProperty(XoError)
    caughtException: XoError;


    protected afterDecode() {
        super.afterDecode();

        if (this.caughtException) {
            this.inputObjects.data.push(this.caughtException);
        }
    }
}


@XoArrayClass(XoCatchBranchRuntimeInfo)
export class XoCatchBranchRuntimeInfoArray extends XoArray<XoCatchBranchRuntimeInfo> {}
