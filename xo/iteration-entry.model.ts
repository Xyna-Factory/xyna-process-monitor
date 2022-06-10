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
import { XoRuntimeInfo } from '@pmod/xo/runtime-info.model';
import { XoArray, XoArrayClass, XoObject, XoObjectClass, XoProperty } from '@zeta/api';


@XoObjectClass(null, 'xmcp.processmonitor.datatypes', 'IterationEntry')
export class XoIterationEntry extends XoObject {

    @XoProperty(XoRuntimeInfo)
    runtimeInfo: XoRuntimeInfo;

    @XoProperty()
    index: number;
}


@XoArrayClass(XoIterationEntry)
export class XoIterationEntryArray extends XoArray<XoIterationEntry> {}
