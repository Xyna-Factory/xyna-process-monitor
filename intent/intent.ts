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
import { ApiService, RuntimeContext } from '@zeta/api';

import { XoXynaProperty, XoXynaPropertyKey } from '@zeta/auth/xo/xyna-property.model';
import { map, Observable, of, switchMap } from 'rxjs';


const PROPERTY_ORDER = 'xmcp.factorymanager.xynaproperties.GetXynaPropertyDetails';
const PROPERTY_KEY_INTENT_APPLICATION = 'xmcp.processmonitor.intent.Application';
const PROPERTY_KEY_INTENT_WORKSPACE = 'xmcp.processmonitor.intent.Workspace';

const PROPERTY_INTENT_APPLICATION = XoXynaPropertyKey.withKey(PROPERTY_KEY_INTENT_APPLICATION);
const PROPERTY_INTENT_WORKSPACE = XoXynaPropertyKey.withKey(PROPERTY_KEY_INTENT_WORKSPACE);


export function getIntentRuntimeContext(apiService: ApiService): Observable<RuntimeContext> {
    const application = apiService.startOrderAssert<XoXynaProperty>(
        RuntimeContext.guiHttpApplication,
        PROPERTY_ORDER,
        PROPERTY_INTENT_APPLICATION,
        XoXynaProperty
    ).pipe(
        map(property => RuntimeContext.fromApplication(property.value))
    );
    const workspace = apiService.startOrderAssert<XoXynaProperty>(
        RuntimeContext.guiHttpApplication,
        PROPERTY_ORDER,
        PROPERTY_INTENT_WORKSPACE,
        XoXynaProperty
    ).pipe(
        map(property => RuntimeContext.fromWorkspace(property.value))
    );
    return application.pipe(switchMap(rtc => rtc.av.application ? of(rtc) : workspace));
}
