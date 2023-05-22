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
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProcessmodellerModule } from '@pmod/processmodeller.module';
import { ZetaModule } from '@zeta/zeta.module';

import { DocumentService } from './document.service';
import { LiveReportingPlotComponent } from './live-reporting-details/components/live-reporting-plot.component';
import { LiveReportingDetailsComponent } from './live-reporting-details/live-reporting-details.component';
import { LiveReportingComponent } from './live-reporting/live-reporting.component';
import { ManualInteractionMonitorComponent } from './mi-monitor/mi-monitor.component';
import { AuditDetailsComponent } from './orderdetails/audit-details/audit-details.component';
import { AuditService } from './orderdetails/audit.service';
import { OrderdetailsComponent } from './orderdetails/orderdetails.component';
import { IterationRuntimeInfoComponent } from './orderdetails/runtime-info/iteration-runtime-info/iteration-runtime-info.component';
import { RuntimeInfoComponent } from './orderdetails/runtime-info/runtime-info.component';
import { StepRuntimeInfoComponent } from './orderdetails/runtime-info/step-runtime-info/step-runtime-info.component';
import { OrderoverviewComponent } from './orderoverview/orderoverview.component';
import { ProcessmonitorSettingsService } from './processmonitor-settings.service';
import { ProcessmonitorComponent } from './processmonitor.component';
import { CapacitiesComponent } from './resources/capacities/capacities.component';
import { ResourceCardComponent } from './resources/resource-card/resource-card.component';
import { ResourceOverviewComponent } from './resources/resource-overview.component';
import { ResourceUsageTemplateComponent } from './resources/resource-usage-template/resource-usage-template.component';
import { VetoesComponent } from './resources/vetoes/vetoes.component';
import { KillOrderButtonComponent } from './shared/kill-order-button/kill-order-button.component';
import './xo/_import';


@NgModule({
    imports: [
        CommonModule,
        ZetaModule,
        ProcessmodellerModule
    ],
    declarations: [
        AuditDetailsComponent,
        CapacitiesComponent,
        ResourceUsageTemplateComponent,
        IterationRuntimeInfoComponent,
        KillOrderButtonComponent,
        LiveReportingComponent,
        LiveReportingDetailsComponent,
        LiveReportingPlotComponent,
        ManualInteractionMonitorComponent,
        OrderdetailsComponent,
        OrderoverviewComponent,
        ProcessmonitorComponent,
        ResourceCardComponent,
        ResourceOverviewComponent,
        RuntimeInfoComponent,
        StepRuntimeInfoComponent,
        VetoesComponent
    ],
    providers: [
        AuditService,
        DocumentService,
        ProcessmonitorSettingsService
    ]
})
export class ProcessmonitorModule {
}
