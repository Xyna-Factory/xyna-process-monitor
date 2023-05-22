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
import { IterationInfo, IterationInfoController, XoRuntimeInfo } from '@pmod/xo/runtime-info.model';
import { XoArray, XoArrayClass, XoObjectClass, XoProperty, XoTransient } from '@zeta/api';

import { XoIterationEntryArray } from './iteration-entry.model';


@XoObjectClass(XoRuntimeInfo, 'xmcp.processmonitor.datatypes', 'IterationContainer')
export class XoIterationContainer extends XoRuntimeInfo {

    @XoProperty()
    iterationContainerKey: string;

    @XoProperty(XoIterationEntryArray)
    iterations: XoIterationEntryArray;

    @XoProperty()
    @XoTransient()
    kind: string;

    @XoProperty()
    @XoTransient()
    errorInChild: boolean;


    protected afterDecode() {
        super.afterDecode();

        // determine, if there is an error in any of the iterations
        this.errorInChild = !!this.iterations.data.find(iteration => iteration.runtimeInfo.hasError());

        // provide iterations with necessary info
        this.iterations.data.forEach(iteration =>
            iteration.runtimeInfo.iterationInfo = <IterationInfo>{
                iterationContainerKey: this.iterationContainerKey,
                iterationIndex:        iteration.index
            }
        );

        // iteration container is active if any of the iterations are active
        this.iterations.data.forEach(iteration =>
            iteration.runtimeInfo.inactiveChange.subscribe(() =>
                this.setInactive(!this.iterations.data.find(value => !value.runtimeInfo.inactive))
            )
        );
    }


    setIterationInfoController(value: IterationInfoController) {
        super.setIterationInfoController(value);

        // pass it along to each iteration
        this.iterations.data.forEach(iteration =>
            iteration.runtimeInfo.setIterationInfoController(value)
        );
    }


    hasError(): boolean {
        return this.errorInChild;
    }
}


@XoArrayClass(XoIterationContainer)
export class XoIterationContainerArray extends XoArray<XoIterationContainer> {
}
