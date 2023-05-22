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
import { IterationInfoController, XoRuntimeInfo } from '@pmod/xo/runtime-info.model';
import { Xo, XoArray, XoArrayClass, XoClassInterfaceFrom, XoJson, XoObjectClass, XoProperty, XoTransient } from '@zeta/api';
import { pack } from '@zeta/base';

import { XoError, XoErrorArray } from './error.model';
import { XoRunningTime } from './running-time.model';


@XoObjectClass(XoRuntimeInfo, 'xmcp.processmonitor.datatypes', 'StepRuntimeInfo')
export class XoStepRuntimeInfo extends XoRuntimeInfo {

    @XoProperty()
    status: string;

    @XoProperty()
    inputs: string[];

    @XoProperty()
    outputs: string[];

    @XoProperty(XoError)
    error: XoError;

    @XoProperty(XoRunningTime)
    runningTime: XoRunningTime;

    @XoProperty()
    originalRTC: string;

    @XoProperty()
    executionRTC: string;

    @XoProperty(XoArray)
    @XoTransient()
    inputObjects = new XoArray();

    @XoProperty(XoArray)
    @XoTransient()
    outputObjects = new XoArray();

    @XoProperty(XoArray)
    @XoTransient()
    errorObjects = new XoArray();


    setIterationInfoController(value: IterationInfoController) {
        super.setIterationInfoController(value);

        this.iterationInfoController.iterationInfoChange.subscribe(iterationInfo => {
            if (this.iterationInfo && iterationInfo && this.iterationInfo.iterationContainerKey === iterationInfo.iterationContainerKey) {
                // this is part of the chosen iteration
                this.setInactive(iterationInfo.iterationIndex !== this.iterationInfo.iterationIndex);
            } else {
                // any other Step is not related
                this.setInactive(false);
            }
        });
    }


    protected readonly transform = (value: string): Xo => {
        // try parsing value as json
        let json: XoJson;
        try {
            json = JSON.parse(value);
        } catch (error) {
            console.warn('invalid JSON:', value);
            return undefined;
        }
        // decode xo object
        const clazz = XoClassInterfaceFrom(json);
        if (!clazz) {
            console.warn('invalid XoJSON:', value);
            return undefined;
        }
        const xo = new clazz().decode(json);
        // manually add keys prefixed with $ (except $meta), since they were filtered out
        Object.keys(json)
            .filter(key => key[0] === '$' && key !== '$meta')
            .forEach(key => xo.data[key] = json[key]);
        return xo;
    };


    protected afterDecode() {
        super.afterDecode();

        this.inputObjects.append(...(this.inputs || []).map(this.transform).filter(entry => entry));
        this.outputObjects.append(...(this.outputs || []).map(this.transform).filter(entry => entry));
        this.errorObjects.append(...pack(this.error));
    }


    hasError(): boolean {
        return this.errorObjects.length > 0;
    }


    setErrors(errors: XoErrorArray) {
        this.errorObjects.clear().append(...errors.data);
    }


    static empty(): XoStepRuntimeInfo {
        return new XoStepRuntimeInfo();
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


@XoArrayClass(XoStepRuntimeInfo)
export class XoStepRuntimeInfoArray extends XoArray<XoStepRuntimeInfo> {
}
