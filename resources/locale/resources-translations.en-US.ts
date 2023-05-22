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
import { I18nTranslation } from '@zeta/i18n';


export const resourcesTranslations_enUS: I18nTranslation[] = [
    // general
    {
        key: 'filter-placeholder',
        value: 'Search'
    },
    {
        key: 'order-by',
        value: 'Order by'
    },
    {
        key: 'tooltip-refresh',
        value: 'Refresh'
    },
    {
        key: 'button-kill',
        value: 'Kill Order'
    },
    {
        key: 'show-details',
        value: 'Show Details'
    },
    {
        key: 'STATUS_RUNNING',
        value: 'Running'
    },
    {
        key: 'STATUS_WAITING',
        value: 'Waiting'
    },
    {
        key: 'tooltip-open-audit',
        value: 'Show Details'
    },
    {
        key: 'tooltip-waiting-orders',
        value: 'Number of orders waiting for this resource'
    },
    {
        key: 'tooltip-resource-progress',
        value: '$0 of $1 of this Resource\'s units are in use'
    },
    {
        key: 'ORDER_ID',
        value: 'Order ID'
    },
    {
        key: 'NAME',
        value: 'Name'
    },
    {
        key: 'WAITING_ORDERS_COUNT',
        value: 'Number of Waiting Orders'
    },

    // Capacities
    {
        key: 'pmon.capacities.header-label',
        value: 'Capacities'
    },
    {
        key: 'configure-capacity',
        value: 'Configure Capacity'
    },
    {
        key: 'pmon.capacities.show-unused',
        value: 'Include unused'
    },
    {
        key: 'pmon.capacities.tooltip-show-unused',
        value: 'Include Capacities with usage 0'
    },
    {
        key: 'pmon.capacities.resource-inactive',
        value: '(disabled)'
    },
    {
        key: 'pmon.capacities.no-capacities',
        value: 'There aren\'t any Capacities to show'
    },

    // Vetoes
    {
        key: 'pmon.vetoes.header-label',
        value: 'Vetoes'
    },
    {
        key: 'pmon.vetoes.no-vetoes',
        value: 'There aren\'t any Vetoes set'
    }
];
