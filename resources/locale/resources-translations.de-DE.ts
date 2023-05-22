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

export const resourcesTranslations_deDE: I18nTranslation[] = [
    // general
    {
        key: 'filter-placeholder',
        value: 'Suche'
    },
    {
        key: 'order-by',
        value: 'Sortierung'
    },
    {
        key: 'tooltip-refresh',
        value: 'Aktualisieren'
    },
    {
        key: 'button-kill',
        value: 'Auftrag abbrechen'
    },
    {
        key: 'show-details',
        value: 'Details anzeigen'
    },
    {
        key: 'STATUS_RUNNING',
        value: 'Laufend'
    },
    {
        key: 'STATUS_WAITING',
        value: 'Wartend'
    },
    {
        key: 'tooltip-open-audit',
        value: 'Details anzeigen'
    },
    {
        key: 'tooltip-waiting-orders',
        value: 'Anzahl der Aufträge, die auf diese Ressource warten'
    },
    {
        key: 'tooltip-resource-progress',
        value: '$0 von $1 Einheiten dieser Ressource sind belegt'
    },
    {
        key: 'ORDER_ID',
        value: 'Auftrags-ID'
    },
    {
        key: 'NAME',
        value: 'Name'
    },
    {
        key: 'WAITING_ORDERS_COUNT',
        value: 'Anzahl wartender Aufträge'
    },

    // Capacities
    {
        key: 'pmon.capacities.header-label',
        value: 'Kapazitäten'
    },
    {
        key: 'configure-capacity',
        value: 'Kapazität konfigurieren'
    },
    {
        key: 'pmon.capacities.show-unused',
        value: 'Ungenutzte anzeigen'
    },
    {
        key: 'pmon.capacities.tooltip-show-unused',
        value: 'Zusätzlich Kapazitäten, die aktuell nicht verwendet werden, in der Liste anzeigen'
    },
    {
        key: 'pmon.capacities.resource-inactive',
        value: '(inaktiv)'
    },
    {
        key: 'pmon.capacities.no-capacities',
        value: 'Keine Kapazitäten vorhanden oder genutzt'
    },

    // Vetoes
    {
        key: 'pmon.vetoes.header-label',
        value: 'Vetos'
    },
    {
        key: 'pmon.vetoes.no-vetoes',
        value: 'Keine Vetos gesetzt'
    }
];
