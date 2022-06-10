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
import { XoObjectClass, XoArrayClass, XoProperty, XoObject, XoArray, XoEnumerated } from '@zeta/api';


@XoObjectClass(null, 'xmcp.processmonitor.resources', 'SortCriterion')
export class XoSortCriterion extends XoObject {

    @XoProperty()
    @XoEnumerated(['ORDER_ID', 'NAME', 'WAITING_ORDERS_COUNT'])
    field: string;
}

@XoArrayClass(XoSortCriterion)
export class XoSortCriterionArray extends XoArray<XoSortCriterion> {}
