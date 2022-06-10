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
import { Component, Injector, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { WorkflowTesterData, WorkflowTesterDialogComponent } from '@fman/workflow-tester/workflow-tester-dialog.component';
import { DocumentService as PMODDocumentService } from '@pmod/document/document.service';
import { DocumentItem, DocumentModel } from '@pmod/document/model/document.model';
import { WorkflowDocumentModel } from '@pmod/document/model/workflow-document.model';
import { SelectionService } from '@pmod/document/selection.service';
import { WorkflowDetailLevelService } from '@pmod/document/workflow-detail-level.service';
import { XoConnectionArray } from '@pmod/xo/connection.model';
import { XoInvocation } from '@pmod/xo/invocation.model';
import { XoItem } from '@pmod/xo/item.model';
import { XoApplication as PMODApplication, XoWorkspace as PMODWorkspace } from '@pmod/xo/runtime-context.model';
import { XoRuntimeInfo } from '@pmod/xo/runtime-info.model';
import { XoService } from '@pmod/xo/service.model';
import { XoWorkflow } from '@pmod/xo/workflow.model';
import { XoXmomItem } from '@pmod/xo/xmom-item.model';
import { FullQualifiedName, XoWorkspace } from '@zeta/api';
import { XoXPRCApplication } from '@zeta/api/xo/runtime-context.model';
import { templateClassType } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcDialogService, XcMenuItem, XcTabComponent } from '@zeta/xc';

import { Observable, of, Subscription } from 'rxjs/';
import { finalize, map } from 'rxjs/operators';

import { DocumentService } from '../document.service';
import { XoOrderOverviewEntry } from '../xo/order-overview-entry.model';
import { XoRetryIterationContainer } from '../xo/retry-iteration-container.model';
import { XoServiceRuntimeInfo } from '../xo/service-runtime-info.model';
import { XoStepRuntimeInfo } from '../xo/step-runtime-info.model';
import { XoWorkflowRuntimeInfo } from '../xo/workflow-runtime-info.model';
import { OpenAuditData } from './audit-details/audit-details.component';
import { AuditService } from './audit.service';
import { orderdetailsTranslations_deDE } from './locale/orderdetails-translations.de-DE';
import { orderdetailsTranslations_enUS } from './locale/orderdetails-translations.en-US';


@Component({
    selector: 'xfm-mon-orderdetails',
    templateUrl: './orderdetails.component.html',
    styleUrls: ['./orderdetails.component.scss'],
    providers: [SelectionService, AuditService, WorkflowDetailLevelService]
})
export class OrderdetailsComponent extends XcTabComponent<void, XoOrderOverviewEntry> {

    readonly XoServiceRuntimeInfo = templateClassType<XoServiceRuntimeInfo>(XoServiceRuntimeInfo);
    readonly XoXmomItem = templateClassType<XoXmomItem>(XoXmomItem);

    pending: boolean;

    workflow: XoWorkflow;
    dataflow: XoConnectionArray;
    selection: XoItem;
    parentOrderId: string;
    workflowFqn: string;
    detailsExpanded = false;
    dataflowReady = false;

    private readonly selectionChangeSubscription: Subscription;
    private readonly doubleClickObjectSubscription: Subscription;

    runtimeInfo: XoRuntimeInfo;
    lazyLoadingLimit: number;
    readonly menuItems: XcMenuItem[] = [];

    document: DocumentModel<DocumentItem>;


    constructor(@Optional() injector: Injector,
        router: Router,
        pmodDocumentService: PMODDocumentService,
        detailLevelService: WorkflowDetailLevelService,
        private readonly auditService: AuditService,
        private readonly documentService: DocumentService,
        private readonly selectionService: SelectionService,
        private readonly dialogService: XcDialogService,
        private readonly i18n: I18nService
    ) {
        super(injector);

        i18n.setTranslations(I18nService.EN_US, orderdetailsTranslations_enUS);
        i18n.setTranslations(I18nService.DE_DE, orderdetailsTranslations_deDE);

        this.menuItems.push(
            <XcMenuItem>{
                name: 'Open in new Tab', translate: true,
                visible: () => true,
                click: () => {
                    pmodDocumentService.loadWorkflow(this.workflow.toRtc(), this.workflow.toFqn());
                    void router.navigate(['xfm/Process-Modeller/']);
                }
            },
            <XcMenuItem>{
                name: 'Test Workflow...', translate: true,
                visible: () => true,
                click: () => {
                    const fqn = this.workflow.toFqn();
                    const rtc = (this.workflow.$rtc ?? this.workflow.evaluatedRtc).runtimeContext();
                    this.dialogService.custom(
                        WorkflowTesterDialogComponent,
                        <WorkflowTesterData>{
                            runtimeContext: rtc,
                            orderType: fqn.encode(),
                            input: this.workflow.runtimeInfo?.getInput()
                        }
                    ).afterDismiss().subscribe();
                }
            },
            <XcMenuItem>{
                name: 'Show/Hide Paths inside Workflow', translate: true,
                visible: () => true,
                click: () => detailLevelService.setShowFQN(!detailLevelService.showFQN)
            }
        );

        // set selection and display the selected object's runtime info
        this.selectionChangeSubscription = this.selectionService.selectionChange.subscribe(modellingObject =>
            // selecting nothing selects the Workflow itself
            this.select(modellingObject
                ? modellingObject.modellingItem
                : this.workflow
            )
        );

        // double click of a service or workflow invocation switches to its audit
        this.doubleClickObjectSubscription = this.selectionService.doubleClickObject.pipe(
            map(modellingObject => modellingObject.modellingItem.runtimeInfo)
        ).subscribe(runtimeInfo => {
            if ((runtimeInfo instanceof XoWorkflowRuntimeInfo || runtimeInfo instanceof XoServiceRuntimeInfo) && runtimeInfo.orderId !== '0') {
                this.openAudit({ sameTab: true, orderId: runtimeInfo.orderId, parentOrderId: this.parentOrderId });
            }
        });

        this.loadAudit(this.injectedData.id, this.injectedData.imported);
    }


    workflowInitialized(_: XoWorkflow) {
        // @fixme: Ugly ugly ugly! Fix smelling code
        setTimeout(() => this.dataflowReady = true);
    }


    private select(selection: XoItem) {
        if (selection) {
            this.selection = selection;
            this.runtimeInfo = selection.runtimeInfo;
            // set input / output names
            if ((selection instanceof XoInvocation || selection instanceof XoService) && selection.runtimeInfo instanceof XoStepRuntimeInfo) {
                selection.runtimeInfo.inputObjects.data.forEach((xo, idx) => (<any>xo)._ident = selection.inputArea?.variables[idx].label);
                selection.runtimeInfo.outputObjects.data.forEach((xo, idx) => (<any>xo)._ident = selection.outputArea?.variables[idx].label);
            }
            // audit service won't be notified from step runtime info compoment if runtime info is undefined
            // that's why, we do notify it from here instead
            if (!this.runtimeInfo) {
                this.auditService.setRuntimeInfo(undefined);
            }
        }
    }


    private loadAudit(id: string, imported: boolean) {
        this.pending = true;
        (imported
            ? this.documentService.importAudit(id)
            : this.documentService.loadAudit(id)
        ).pipe(
            finalize(() => this.pending = false)
        ).subscribe(response => {
            this.workflow = response.workflow;
            this.dataflow = response.dataflow;

            // FIXME use one RTC-model-class for Modeller and Monitor !! (PMON-73)
            if (response.rootRtc instanceof XoWorkspace) {
                const ws = new PMODWorkspace();
                ws.name = response.rootRtc.name;
                if (this.workflow) {
                    this.workflow.$rtc = ws;
                }
            } else if (response.rootRtc instanceof XoXPRCApplication) {
                const av = new PMODApplication();
                av.name = response.rootRtc.name;
                av.version = response.rootRtc.version;
                if (this.workflow) {
                    this.workflow.$rtc = av;
                }
            }
            if (this.workflow) {
                this.workflow.orderId = response.orderId;

                // set workflow order id to retry iterations
                if (this.workflow.runtimeInfo instanceof XoRetryIterationContainer) {
                    this.workflow.runtimeInfo.iterations.data.forEach(iteration => {
                        if (iteration.runtimeInfo instanceof XoWorkflowRuntimeInfo) {
                            iteration.runtimeInfo.orderId = this.workflow.orderId;
                        }
                    });
                }
            }
            this.parentOrderId = response.parentOrderId;

            this.workflowFqn = this.workflow ? FullQualifiedName.decode(this.workflow.$fqn).name : null;

            // provide all RuntimeInfo objects with the AuditService to track current iteration
            response.info.data.forEach(runtimeInfo => runtimeInfo.setIterationInfoController(this.auditService));

            // An imported audit now has the file-ID as its ID to load it.
            // To work with it, update its ID to the one in the response.
            this.injectedData.id = response.orderId;

            // assemble document model with rtc information
            this.document = new WorkflowDocumentModel(this.workflow, this.workflow.$rtc.runtimeContext());

            // if there are errors in the response, show them
            if (response.errors && response.errors.length > 0) {
                const fakeStepRuntimeInfo = XoStepRuntimeInfo.empty();
                fakeStepRuntimeInfo.setErrors(response.errors);
                this.runtimeInfo = fakeStepRuntimeInfo;
            }

            // if there are hints in the response, show them
            if (response.hints?.length > 0) {
                const description = response.hints.data[0].description;

                const missingImports: string = description.slice(description.indexOf(':') + 1, description.length).replace(/,/g, ',\n');
                const missingImportsLength: string = missingImports.split('\n').length.toString();
                const header = this.i18n.translate('orderdetails-hints-dialog-header');
                const message = this.i18n.translate('orderdetails-hints-dialog-message', { key: '%value%', value: missingImportsLength });
                this.dialogService.info(header, message, null, missingImports);
            }

            // set lazy loading limit
            this.lazyLoadingLimit = response.lazyLoadingLimit;

            // initially select workflow
            this.select(this.workflow);
        });

        // const onerror = () => this.dialogService.error('An error occured while loading the audit.');
        // const options = new StartOrderOptionsBuilder().withErrorMessage().options;
        // this.pending = true;
        // this.apiService.startOrderAssertFlat<XoObject>(RTC, this.ordertype, new XoOrderOverviewEntry(undefined, orderId), XoAudit, options).subscribe(result => {
        //     this.pending = false;
        //     if (result.errorMessage) {
        //         onerror();
        //     } else {
        //         this.audit = <XoAudit>result.output[0];
        //         this.dsTreeLhs.orderId = this.audit.orderId;
        //         this.dsTreeRhs.orderId = this.audit.orderId;
        //         // this.select({step: this.audit});
        //         // update tab name
        //         this.tabBarItem.name = String(orderId);
        //     }
        // }, onerror);
    }


    openAudit(event: OpenAuditData) {
        const openingDocument = new XoOrderOverviewEntry(undefined, event.orderId, event.parentOrderId);
        const replaceDocument = new XoOrderOverviewEntry(undefined, this.workflow.orderId);
        this.documentService.openDocument(openingDocument, event.sameTab ? replaceDocument : undefined);
    }


    refreshAudit() {
        this.loadAudit(this.injectedData.id, this.injectedData.imported);
    }


    get isImportedAudit(): boolean {
        return this.injectedData.imported;
    }


    get showMenu(): boolean {
        return !!this.menuItems && this.menuItems.some(
            menuItem => !menuItem.visible || menuItem.visible(menuItem)
        );
    }


    beforeDismiss(): Observable<boolean> {
        if (this.documentService.hasDocument(this.injectedData)) {
            this.documentService.closeDocument(this.injectedData);
            this.selectionChangeSubscription?.unsubscribe();
            this.doubleClickObjectSubscription?.unsubscribe();
            return of(false);
        }
        return super.beforeDismiss();
    }
}
