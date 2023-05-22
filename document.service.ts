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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { XoItem } from '@pmod/xo/item.model';
import { XoModellingItem } from '@pmod/xo/modelling-item.model';
import { XoRepairEntry } from '@pmod/xo/repair-entry.model';
import { XoRuntimeContext as PMODRuntimeContext } from '@pmod/xo/runtime-context.model';
import { XoRuntimeInfo } from '@pmod/xo/runtime-info.model';
import { downloadFile, MimeTypes } from '@zeta/base';
import { XcDialogService } from '@zeta/xc';

import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { XoCatchBranchRuntimeInfo } from './xo/catch-branch-runtime-info.model';
import { XoCatchableRuntimeInfo } from './xo/catchable-runtime-info.model';
import { XoChoiceBranchRuntimeInfo } from './xo/choice-branch-runtime-info.model';
import { XoChoiceRuntimeInfo } from './xo/choice-runtime-info.model';
import { XoCompensationRuntimeInfo } from './xo/compensation-runtime-info.model';
import { XoForeachIterationContainer } from './xo/foreach-iteration-container.model';
import { XoForeachRuntimeInfo } from './xo/foreach-runtime-info.model';
import { XoGetAuditResponse } from './xo/get-audit-response.model';
import { XoIterationRuntimeInfo } from './xo/iteration-runtime-info.model';
import { XoMappingRuntimeInfo } from './xo/mapping-runtime-info.model';
import { XoOrderOverviewEntry } from './xo/order-overview-entry.model';
import { XoParallelExecutionRuntimeInfo } from './xo/parallel-execution-runtime-info.model';
import { XoParallelismBranchRuntimeInfo } from './xo/parallelism-branch-runtime-info.model';
import { XoQueryRuntimeInfo } from './xo/query-runtime-info.model';
import { XoRetryIterationContainer } from './xo/retry-iteration-container.model';
import { XoRetryRuntimeInfo } from './xo/retry-runtime-info.model';
import { XoRollbackStep } from './xo/rollback-step.model';
import { XoServiceRuntimeInfo } from './xo/service-runtime-info.model';
import { XoTemplateRuntimeInfo } from './xo/template-runtime-info.model';
import { XoThrowRuntimeInfo } from './xo/throw-runtime-info.model';
import { XoWorkflowRuntimeInfo } from './xo/workflow-runtime-info.model';


@Injectable()
export class DocumentService {

    private readonly _documentListSubject = new BehaviorSubject<XoOrderOverviewEntry[]>([]);
    private readonly _selectionSubject = new BehaviorSubject<XoOrderOverviewEntry>(null);

    constructor(private readonly http: HttpClient, private readonly dialogs: XcDialogService) {
        // instantiate models such that they aren't pruned during a release-build
        /* eslint-disable @typescript-eslint/no-unused-vars */
        let m: XoRuntimeInfo;
        m = new XoCatchBranchRuntimeInfo();
        m = new XoCatchableRuntimeInfo();
        m = new XoChoiceRuntimeInfo();
        m = new XoChoiceBranchRuntimeInfo();
        m = new XoCompensationRuntimeInfo();
        m = new XoForeachIterationContainer();
        m = new XoForeachRuntimeInfo();
        m = new XoIterationRuntimeInfo();
        m = new XoMappingRuntimeInfo();
        m = new XoParallelExecutionRuntimeInfo();
        m = new XoParallelismBranchRuntimeInfo();
        m = new XoQueryRuntimeInfo();
        m = new XoRetryIterationContainer();
        m = new XoRetryRuntimeInfo();
        m = new XoRollbackStep();
        m = new XoServiceRuntimeInfo();
        m = new XoTemplateRuntimeInfo();
        m = new XoThrowRuntimeInfo();
        m = new XoWorkflowRuntimeInfo();
        const entry = new XoRepairEntry();
        /* eslint-enable @typescript-eslint/no-unused-vars */
    }


    private get documents(): XoOrderOverviewEntry[] {
        return this._documentListSubject.value;
    }


    get documentListChange(): Observable<XoOrderOverviewEntry[]> {
        return this._documentListSubject.asObservable();
    }


    get selectedDocument(): XoOrderOverviewEntry {
        return this._selectionSubject.value;
    }


    set selectedDocument(value: XoOrderOverviewEntry) {
        this._selectionSubject.next(value);
    }


    get selectionChange(): Observable<XoOrderOverviewEntry> {
        return this._selectionSubject.asObservable();
    }


    hasDocument(document: XoOrderOverviewEntry): boolean {
        return !!this.documents.find(value => value === document);
    }


    /**
     * Opens (if not already open) and selects a document
     * @param document Document to open
     * @param replaceDocument Optional document to replace with new one
     */
    openDocument(document: XoOrderOverviewEntry, replaceDocument?: XoOrderOverviewEntry) {
        if (document) {
            const foundDocument = this.documents.find(value => value.id === document.id);
            if (foundDocument) {
                this.selectedDocument = foundDocument;
            } else {
                let insertIndex = this.documents.length, deleteCount = 0;
                if (replaceDocument) {
                    insertIndex = this.documents.findIndex(entry => entry.id === replaceDocument.id);
                    deleteCount = 1;
                } else if (document.parentId) {
                    insertIndex = this.documents.findIndex(entry => entry.id === document.parentId);
                    if (insertIndex >= 0) {
                        insertIndex++;
                    }
                }
                this.selectedDocument = document;
                const documents = this.documents.concat();
                documents.splice(insertIndex, deleteCount, document);
                this._documentListSubject.next(documents);
            }
        }
    }


    /**
     * Removes document from internal document stack
     * @param document Document to remove
     */
    closeDocument(document: XoOrderOverviewEntry) {
        const index = this.documents.indexOf(document);
        if (index >= 0) {
            this.documents.splice(index, 1);

            const newSelectedIndex = index < this.documents.length ? index : this.documents.length - 1;
            this.selectedDocument = (newSelectedIndex >= 0) ? this.documents[newSelectedIndex] : null;

            this._documentListSubject.next(this.documents);
        }
    }


    // ======================================================================================================
    // AUDIT
    // ======================================================================================================


    loadAudit(orderId: string): Observable<XoGetAuditResponse> {
        return this.handleAudit(this.http.get('audits/' + orderId), orderId);
    }


    importAudit(fileId: string): Observable<XoGetAuditResponse> {
        return this.handleAudit(this.http.get('importedAudits/' + fileId), fileId);
    }


    exportAudit(orderId: string, orderName: string): Observable<void> {
        return this.http.get(`audits/${orderId}/download`, {responseType: 'arraybuffer'}).pipe(
            map(response => {
                const blob = new Blob([response], {type: MimeTypes.bin});
                downloadFile(blob, `Order_${orderId}_${orderName}`, MimeTypes.xml);
            })
        );
    }


    handleAudit(auditObservable: Observable<Object>, id: string): Observable<XoGetAuditResponse> {
        return auditObservable.pipe(
            map((response: any) => {
                const auditResponse = new XoGetAuditResponse().decode(response);

                // provide items with their runtime info
                const runtimeInfoMap = new Map<string, XoRuntimeInfo>();
                auditResponse.info.data
                    .filter(runtimeInfo => runtimeInfo.id)
                    .forEach(runtimeInfo => runtimeInfoMap.set(runtimeInfo.id, runtimeInfo));

                const provideWithRuntimeInfo = (item: XoItem) => {

                    if (!item.runtimeInfo) {
                        item.setRuntimeInfo(runtimeInfoMap.get(item.id));
                    }

                    if (!item.runtimeInfo) {
                        item.missingRuntimeInfo = true;
                    } else {
                        runtimeInfoMap.delete(item.runtimeInfo.id);
                    }

                    // populate child items
                    if (item instanceof XoModellingItem) {
                        item.containerAreas.forEach(area => area.items.data.forEach(subItem => provideWithRuntimeInfo(subItem)));
                    }
                };
                if (auditResponse.workflow) {
                    // if workflow doesn't know its RTC, take the one from the Audit
                    auditResponse.workflow.$rtc = PMODRuntimeContext.fromRuntimeContext(auditResponse.rootRtc.toRuntimeContext());
                    provideWithRuntimeInfo(auditResponse.workflow);
                }

                runtimeInfoMap.forEach((value, key) => console.warn(`Could not map Runtime Info ${key} to an item.`));

                return auditResponse;
            }),
            catchError(error => {
                // FIXME parse and handle xmcp.processmodeller.datatypes.Error (has to be done in general, see PMOD-563)
                this.dialogs.error(`An error occurred while loading the Audit for order ${id}`);
                return EMPTY;
            })
        );
    }
}
