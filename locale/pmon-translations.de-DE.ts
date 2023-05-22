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


export const pmonTranslations_deDE: I18nTranslation[] = [
    // ProcessmonitorComponent
    // typescripz
    {
        key: 'pmon.tab-header-order-overview',
        value: 'Auftragsübersicht'
    },
    {
        key: 'pmon.tab-header-mi-monitor',
        value: 'MI-Monitor'
    },
    {
        key: 'pmon.tab-header-live-reporting',
        value: 'Live-Berichte'
    },
    {
        key: 'pmon.tab-header-capacities',
        value: 'Kapazitäten-Monitor'
    },
    {
        key: 'pmon.tab-header-vetoes',
        value: 'Veto-Monitor'
    },
    {
        key: 'pmon.task',
        value: 'Aufgabe'
    },




    { key: 'Details', value: 'Details' },
    { key: 'Expand / Shrink Details', value: 'Details ein-/ausklappen' },
    { key: 'No Audit Data available', value: 'Keine Audit-Daten verfügbar' },
    { key: 'Show/Hide Exception Area', value: 'Exception-Bereich anzeigen/ausblenden' },

    { key: 'order-overview.order-details.limiterror', value: 'Hinweis: Die Anzahl der angezeigten Einträge ist auf $0 limitiert.' },
    // orderdetails
    {
        key: 'orderdetails-hints-dialog-header',
        value: 'Hinweis'
    },
    {
        key: 'orderdetails-hints-dialog-message',
        value: 'Es fehlen %value% Importe im Audit'
    }
];
