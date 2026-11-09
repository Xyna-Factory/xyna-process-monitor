// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
import { XoArray, XoArrayClass, XoObject, XoObjectClass, XoProperty, XoUnique } from '@zeta/api';
import { XoNodeStyle } from './node-style.model';


@XoObjectClass(null, 'xmcp.processmonitor.intent', 'Node')
export class XoNode extends XoObject {

    @XoProperty()
    @XoUnique()
    id: string;

    @XoProperty()
    label: string;

    @XoProperty()
    state: string;

    @XoProperty(XoNodeStyle)
    style: XoNodeStyle;

    @XoProperty()
    orderId: string;

    @XoProperty()
    orderStatus: string;
}


@XoArrayClass(XoNode)
export class XoNodeArray extends XoArray<XoNode> {
}
