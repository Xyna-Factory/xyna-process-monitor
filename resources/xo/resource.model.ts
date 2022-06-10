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
import { XoArray, XoArrayClass, XoObject, XoObjectClass, XoProperty } from '@zeta/api';
import { XcComponentTemplate } from '@zeta/xc';
import { ResourceUsageTemplateComponent, ResourceUsageTemplateData } from '../resource-usage-template/resource-usage-template.component';


@XoObjectClass(null, 'xmcp.processmonitor.resources', 'Resource')
export class XoResource extends XoObject {

    @XoProperty()
    name: string;

    @XoProperty()
    runningOrders: number[];

    @XoProperty()
    waitingOrdersCount: number;

    usageTemplate: XcComponentTemplate<ResourceUsageTemplateData>;
    enabled = true;

    afterDecode() {
        super.afterDecode();

        this.usageTemplate = new XcComponentTemplate(
            ResourceUsageTemplateComponent,
            { waiting: this.waitingOrdersCount }
        );
    }
}


@XoArrayClass(XoResource)
export class XoResourceArray extends XoArray<XoResource> {}
