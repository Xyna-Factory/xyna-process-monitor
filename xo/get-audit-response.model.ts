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
import { XoConnectionArray } from '@pmod/xo/connection.model';
import { XoRepairEntryArray } from '@pmod/xo/repair-entry.model';
import { XoResponse } from '@pmod/xo/response.model';
import { XoRuntimeInfoArray } from '@pmod/xo/runtime-info.model';
import { XoWorkflow } from '@pmod/xo/workflow.model';
import { XoObjectClass, XoProperty, XoXPRCRuntimeContext } from '@zeta/api';

import { XoCustomFieldArray } from './custom-field.model';
import { XoErrorArray } from './error.model';
import { XoRollbackStep } from './rollback-step.model';
import { XoWorkflowRuntimeInfo } from './workflow-runtime-info.model';


@XoObjectClass(XoResponse, 'xmcp.processmonitor.datatypes.response', 'GetAuditResponse')
export class XoGetAuditResponse extends XoResponse {

    @XoProperty()
    orderId: string;

    @XoProperty()
    parentOrderId: string;

    @XoProperty(XoRuntimeInfoArray)
    info: XoRuntimeInfoArray;

    @XoProperty(XoXPRCRuntimeContext)
    rootRtc: XoXPRCRuntimeContext;

    @XoProperty(XoRollbackStep)
    rollback: XoRollbackStep;

    @XoProperty(XoWorkflow)
    workflow: XoWorkflow;

    @XoProperty(XoConnectionArray)
    dataflow: XoConnectionArray;

    @XoProperty(XoCustomFieldArray)
    customFields: XoCustomFieldArray;

    @XoProperty(XoErrorArray)
    errors: XoErrorArray;

    @XoProperty(XoRepairEntryArray)
    repairResult: XoRepairEntryArray;

    @XoProperty()
    lazyLoadingLimit: number;


    protected afterDecode() {
        super.afterDecode();

        this.info = this.info || new XoRuntimeInfoArray();

        if (this.parentOrderId === '0') {
            this.parentOrderId = null;
        }

        // set OrderId of enclosing Workflow-Runtime Info, because the backend data type doesn't set this data
        const workflowRuntimeInfo = this.info.data.find(info => info instanceof XoWorkflowRuntimeInfo);
        if (workflowRuntimeInfo) {
            (workflowRuntimeInfo as XoWorkflowRuntimeInfo).orderId = this.orderId;
        }
    }
}
