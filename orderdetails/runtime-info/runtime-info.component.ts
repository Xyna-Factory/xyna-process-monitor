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
import { Component, Input } from '@angular/core';

import { XoRuntimeInfo } from '@pmod/xo/runtime-info.model';
import { templateClassType } from '@zeta/base';

import { XoIterationContainer } from '../../xo/iteration-container.model';
import { XoStepRuntimeInfo } from '../../xo/step-runtime-info.model';
import { IterationRuntimeInfoComponent } from './iteration-runtime-info/iteration-runtime-info.component';
import { StepRuntimeInfoComponent } from './step-runtime-info/step-runtime-info.component';
import { I18nModule } from '../../../../zeta/i18n/i18n.module';


@Component({
    selector: 'xfm-mon-runtime-info',
    templateUrl: './runtime-info.component.html',
    styleUrls: ['./runtime-info.component.scss'],
    imports: [IterationRuntimeInfoComponent, StepRuntimeInfoComponent, I18nModule]
})
export class RuntimeInfoComponent {

    readonly XoStepRuntimeInfo    = templateClassType<XoStepRuntimeInfo>(XoStepRuntimeInfo);
    readonly XoIterationContainer = templateClassType<XoIterationContainer>(XoIterationContainer);

    @Input()
    runtimeInfo: XoRuntimeInfo;

    @Input()
    lazyLoadingLimit: number;

    @Input()
    iterationDepth: number;
}
