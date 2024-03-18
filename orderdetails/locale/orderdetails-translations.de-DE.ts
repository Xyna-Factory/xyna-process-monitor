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


export const orderdetailsTranslations_deDE: I18nTranslation[] = [
    // OrderdetailsComponent
    // html
    {
        key: 'pmon.orderdetails.label-no-data',
        value: 'Keine Auditdaten verfügbar'
    },
    {
        key: 'pmon.orderdetails.tooltip-expand-shrink-details',
        value: 'Details erweitern / verkleinern'
    },
    {
        key: 'pmon.orderdetails.header-details',
        value: 'Details'
    },

    // Workflow
    // html
    {
        key: 'pmon.orderdetails.tooltip-complete-sub-types',
        value: 'Vollständige Untertypen'
    },
    {
        key: 'pmon.orderdetails.tooltip-detach',
        value: 'Ablösen'
    },
    {
        key: 'pmon.orderdetails.header-handled-exceptions',
        value: 'Behandelte Ausnahmen'
    },
    {
        key: 'pmon.orderdetails.header-unhandled-exceptions',
        value: 'Unbehandelte Ausnahmen'
    },
    {
        key: 'pmon.orderdetails.button-add-all',
        value: 'Alle Hinzufügen'
    },
    {
        key: 'pmon.orderdetails.tooltip-open-close-exception-area',
        value: 'Ausnahmebereich öffnen / schließen'
    },
    {
        key: 'pmon.orderdetails.tooltip-open-close-compensation-area',
        value: 'Kompensationsbereich öffnen / schließen'
    },
    {
        key: 'pmon.orderdetails.label-order-input-source',
        value: 'Order Input Source'
    },
    {
        key: 'pmon.orderdetails.label-no-order-input-sources',
        value: 'Keine passenden Order Input Sources verfügbar'
    },
    {
        key: 'pmon.orderdetails.header-filter-criteria',
        value: 'Filterkriterien'
    },
    {
        key: 'pmon.orderdetails.header-selection-masks',
        value: 'Auswahlmasken'
    },
    {
        key: 'pmon.orderdetails.header-sortings',
        value: 'Sortierungen'
    },
    {
        key: 'pmon.orderdetails.label-limit-results',
        value: 'Ergebnisse begrenzen'
    },
    {
        key: 'pmon.orderdetails.label-query-history',
        value: 'Verlauf abfragen'
    },
    {
        key: 'pmon.orderdetails.label-remote-destination',
        value: 'Remote-Ziel'
    },
    {
        key: 'pmon.orderdetails.header-compensation',
        value: 'Kompensation'
    },
    {
        key: 'pmon.orderdetails.button-override-internal-compensation',
        value: 'Interne Kompensation überschreiben'
    },
    {
        key: 'pmon.orderdetails.button-delete-overridden-compensation',
        value: 'Überschriebene Kompensation löschen'
    },
    {
        key: 'pmon.orderdetails.tooltip-delete-compensation',
        value: 'Überschrieben Kompensation verwenden und die interne verwenden'
    },

    // AuditDetailsComponent
    // html
    {
        key: 'pmon.orderdetails.audit-details.label-start-time',
        value: 'Startzeit'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-step-id',
        value: 'Schritt ID'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-execution-rtc',
        value: 'Ausführung RTC'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-order-id',
        value: 'Auftragsnummer'
    },
    {
        key: 'pmon.orderdetails.audit-details.tooltip-open',
        value: 'Öffnen'
    },
    {
        key: 'pmon.orderdetails.audit-details.tooltip-open-in-process-modeller',
        value: 'Im Process Modeller öffnen'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-end-time',
        value: 'Endzeit'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-status',
        value: 'Status'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-origin-rtc',
        value: 'Herkunft RTC'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-parent-order-id',
        value: 'Übergeordneter Auftrag'
    },
    {
        key: 'pmon.orderdetails.audit-details.label-duration',
        value: 'Dauer'
    },
    {
        key: 'pmon.orderdetails.audit-details.button-export-audit',
        value: 'Audit exportieren'
    },

    // KillOrderButtonComponent
    {
        key: 'pmon.orderdetails.audit-details.kill-order-button.button-kill',
        value: 'Kill'
    },

    //RuntimeInfoComponent
    {
        key: 'pmon.orderdetails.runtime-info.label-no-runtime',
        value: 'Keine Laufzeitinformationen verfügbar'
    },

    // StepRuntimeInfoComponent
    {
        key: 'pmon.orderdetails.runtime-info.step-runtime.header-input',
        value: 'Eingabe'
    },
    {
        key: 'pmon.orderdetails.runtime-info.step-runtime.button-copy-to-clipboard',
        value: 'In die Zwischenablage kopieren'
    },
    {
        key: 'pmon.orderdetails.runtime-info.step-runtime.header-output',
        value: 'Ausgabe'
    },
    {
        key: 'pmon.orderdetails.runtime-info.step-runtime.header-error',
        value: 'Fehler'
    },
    {
        key: 'pmon.orderdetails.runtime-info.step-runtime.no-input',
        value: 'Keine Eingabe-, Ausgabe- oder Fehlerdaten verfügbar'
    }
];
