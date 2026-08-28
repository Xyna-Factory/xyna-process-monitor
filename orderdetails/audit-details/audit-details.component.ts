import { Observer, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { NgTemplateOutlet } from '@angular/common';
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
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, output } from '@angular/core';
import { templateClassType } from '@zeta/base';
import { XcButtonComponent, XcDialogService, XcIconButtonComponent, XcTooltipDirective } from '@zeta/xc';

import { XcI18nContextDirective, XcI18nPipe, XcI18nTranslateDirective } from '../../../../zeta/i18n';
import { DocumentService } from '../../document.service';
import { KillOrderButtonComponent } from '../../shared/kill-order-button/kill-order-button.component';
import { XoServiceRuntimeInfo } from '../../xo/service-runtime-info.model';
import { XoStepRuntimeInfo } from '../../xo/step-runtime-info.model';
import { XoWorkflowRuntimeInfo } from '../../xo/workflow-runtime-info.model';
import { AuditService } from '../audit.service';


export interface OpenAuditData {
    sameTab: boolean;
    orderId: string;
    parentOrderId: string;
}


@Component({
    selector: 'xfm-mon-audit-details',
    templateUrl: './audit-details.component.html',
    styleUrls: ['./audit-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [XcI18nContextDirective, XcI18nPipe, XcI18nTranslateDirective, XcButtonComponent, XcIconButtonComponent, XcTooltipDirective, KillOrderButtonComponent, NgTemplateOutlet]
})
export class AuditDetailsComponent implements OnDestroy, AfterViewInit {
    private readonly cdRef = inject(ChangeDetectorRef);
    private readonly dialogs = inject(XcDialogService);
    private readonly documents = inject(DocumentService);
    private readonly auditService = inject(AuditService);


    readonly XoStepRuntimeInfo = templateClassType<XoStepRuntimeInfo>(XoStepRuntimeInfo);
    readonly XoServiceRuntimeInfo = templateClassType<XoServiceRuntimeInfo>(XoServiceRuntimeInfo);
    readonly XoWorkflowRuntimeInfo = templateClassType<XoWorkflowRuntimeInfo>(XoWorkflowRuntimeInfo);

    @Input()
    fqn: string;

    @Input()
    parentOrderId: string;

    @Input()
    workflowOrderId: string;

    @Input()
    disabled: boolean;

    readonly openAudit = output<OpenAuditData>();

    readonly refreshAudit = output<void>();

    runtimeInfo: XoStepRuntimeInfo;

    private readonly subscriptions: Subscription[] = [];


    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }


    ngAfterViewInit() {
        this.subscriptions.push(this.auditService.runtimeInfoChange.pipe(
            filter(() => this.documents.selectedDocument && this.documents.selectedDocument.id === this.workflowOrderId)
        ).subscribe(info => {
            this.runtimeInfo = info;
            // @fixme: Ugly ugly ugly! Fix smelling code
            setTimeout(() => this.cdRef.markForCheck());
        }));
    }


    exportAudit() {
        this.documents.exportAudit(this.workflowOrderId, (this.fqn ? this.fqn : 'fqn_not_found')).subscribe(<Observer<void>>{
            error: error => {
                this.dialogs.error('Export Audit Error: ' + (error.toString ? error.toString() : error));
            }
        });
    }


    refresh() {
        this.refreshAudit.emit();
    }
}
