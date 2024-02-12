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
import { RouterModule } from '@angular/router';

import { XynaRoutes } from '@zeta/nav';
import { rightGuardCanActivate } from '@zeta/nav/right.guard';
import { RIGHT_PROCESS_MONITOR } from './const';
import { ProcessmonitorComponent } from './processmonitor.component';
import { ProcessmonitorModule } from './processmonitor.module';


const root = 'Process-Monitor';

export const ProcessmonitorRoutes: XynaRoutes = [
    {
        path: '',
        redirectTo: root,
        pathMatch: 'full'
    },
    {
        path: root,
        component: ProcessmonitorComponent,
        canActivate: [rightGuardCanActivate],
        data: {
            right: RIGHT_PROCESS_MONITOR,
            reuse: root,
            title: root
        }
    }
];

export const ProcessmonitorRoutingModules = [
    RouterModule.forChild(ProcessmonitorRoutes),
    ProcessmonitorModule
];

export const ProcessmonitorRoutingProviders = [
];
