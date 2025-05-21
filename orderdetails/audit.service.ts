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
import { Injectable } from '@angular/core';

import { IterationInfo, IterationInfoController } from '@pmod/xo/runtime-info.model';

import { BehaviorSubject, Observable } from 'rxjs';

import { XoStepRuntimeInfo } from '../xo/step-runtime-info.model';


@Injectable({
    providedIn: 'root'
})
export class AuditService implements IterationInfoController {

    /** currently selected Step Runtime Info */
    private readonly _runtimeInfoSubject = new BehaviorSubject<XoStepRuntimeInfo>(null);

    /** currently selected iteration */
    private readonly _iterationInfoSubject = new BehaviorSubject<IterationInfo>(null);


    get runtimeInfoChange(): Observable<XoStepRuntimeInfo> {
        return this._runtimeInfoSubject.asObservable();
    }


    setRuntimeInfo(runtimeInfo: XoStepRuntimeInfo) {
        this._runtimeInfoSubject.next(runtimeInfo);
    }


    get iterationInfoChange(): Observable<IterationInfo> {
        return this._iterationInfoSubject.asObservable();
    }


    setIterationInfo(iterationInfo: IterationInfo) {
        this._iterationInfoSubject.next(iterationInfo);
    }
}
