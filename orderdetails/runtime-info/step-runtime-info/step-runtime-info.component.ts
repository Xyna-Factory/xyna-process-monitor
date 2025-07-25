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
import { AfterContentChecked, Component, Input, ViewChild } from '@angular/core';

import { ApiService, Xo, XoArray, XoDescriberCache, XoObject, XoStructureObject } from '@zeta/api';
import { copyToClipboard, isArray } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcDialogService, XcReadonlyStructureTreeDataSource, XcReadonlyTreeComponent } from '@zeta/xc';

import { RTC } from '../../../const';
import { DocumentService } from '../../../document.service';
import { XoStepRuntimeInfo } from '../../../xo/step-runtime-info.model';
import { AuditService } from '../../audit.service';


@Component({
    selector: 'xfm-mon-step-runtime-info',
    templateUrl: './step-runtime-info.component.html',
    styleUrls: ['./step-runtime-info.component.scss'],
    standalone: false
})
export class StepRuntimeInfoComponent implements AfterContentChecked {

    private _runtimeInfo: XoStepRuntimeInfo;

    readonly dsTreeIn: XcReadonlyStructureTreeDataSource;
    readonly dsTreeOut: XcReadonlyStructureTreeDataSource;
    readonly dsTreeErr: XcReadonlyStructureTreeDataSource;

    private readonly expandTree = new Set<string>();
    private readonly dataSources: XcReadonlyStructureTreeDataSource[];
    private readonly structureCache = new XoDescriberCache<XoStructureObject>();

    @ViewChild('treeIn', { read: XcReadonlyTreeComponent, static: false })
    treeIn: XcReadonlyTreeComponent;

    @ViewChild('treeOut', { read: XcReadonlyTreeComponent, static: false })
    treeOut: XcReadonlyTreeComponent;

    @ViewChild('treeErr', { read: XcReadonlyTreeComponent, static: false })
    treeErr: XcReadonlyTreeComponent;

    private _lazyLoadingLimit: number;

    limitError: string;
    violatesInputLimit = false;
    violatesOutputLimit = false;
    violatesErrorLimit = false;


    constructor(
        apiService: ApiService,
        private readonly i18n: I18nService,
        private readonly auditService: AuditService,
        private readonly documentService: DocumentService,
        private readonly dialogs: XcDialogService
    ) {
        // create tree data sources
        const newDataSource = () => new XcReadonlyStructureTreeDataSource(apiService, undefined, RTC, []);
        this.dataSources = [
            this.dsTreeIn  = newDataSource(),
            this.dsTreeOut = newDataSource(),
            this.dsTreeErr = newDataSource()
        ];

        // initialize tree data sources
        this.dataSources.forEach(ds => {
            ds.structureCache = this.structureCache;
            ds.readonlyMode = true;
        });
    }


    private getExpandTreeKey(t: number, n: number): string {
        return t + '.' + n;
    }


    ngAfterContentChecked() {
        // no trees need to be expanded
        if (this.expandTree.size === 0) {
            return;
        }
        // expand trees, if necessary
        [this.treeIn, this.treeOut, this.treeErr]
            .forEach((tree, t) => tree?.dataSource.structureTreeData
                .filter((_, n) => this.expandTree.has(this.getExpandTreeKey(t, n)))
                .forEach((node, n) => tree.items
                    .filter(item => item.node === node)
                    .forEach(item => {
                        this.expandTree.delete(this.getExpandTreeKey(t, n));
                        item.expandItem();
                    })
                )
            );
    }


    private violatesLimit(xo: Xo, limit: number): boolean {
        let result = false;
        if (xo instanceof XoObject) {
            for (const key of xo.properties.keys()) {
                const value = xo.data[key];
                if (value instanceof Xo) {
                    result = this.violatesLimit(value, limit);
                }
                if (isArray(value)) {
                    result = value.length > limit;
                }
                if (!result) {
                    break;
                }
            }
        }
        if (xo instanceof XoArray) {
            result = xo.length > limit || xo.data.some(
                sub => this.violatesLimit(sub, limit)
            );
        }
        return result;
    }


    private checkLazyLoadingLimit() {
        this.limitError = undefined;
        this.violatesInputLimit = false;
        this.violatesOutputLimit = false;
        this.violatesErrorLimit = false;

        if (this.lazyLoadingLimit >= 1 && this.runtimeInfo) {
            this.limitError = this.i18n.translate(
                'order-overview.order-details.limiterror',
                {key: '$0', value: '' + this.lazyLoadingLimit}
            );
            const limit = this.lazyLoadingLimit - 1;
            this.violatesInputLimit = this.runtimeInfo.inputObjects.data.some(xo => this.violatesLimit(xo, limit));
            this.violatesOutputLimit = this.runtimeInfo.outputObjects.data.some(xo => this.violatesLimit(xo, limit));
            this.violatesErrorLimit = this.runtimeInfo.errorObjects.data.some(xo => this.violatesLimit(xo, limit));
        }
    }


    @Input()
    set lazyLoadingLimit(value: number) {
        this._lazyLoadingLimit = value;
        this.checkLazyLoadingLimit();
    }


    get lazyLoadingLimit(): number {
        return this._lazyLoadingLimit;
    }


    @Input()
    set runtimeInfo(value: XoStepRuntimeInfo) {
        this._runtimeInfo = value;
        this.checkLazyLoadingLimit();

        // inform audit service
        this.auditService.setRuntimeInfo(this.runtimeInfo);

        // update tree data sources
        this.dsTreeIn.orderId  = this.documentService.selectedDocument.id;
        this.dsTreeOut.orderId = this.documentService.selectedDocument.id;

        this.dsTreeIn.container.clear().append(...this.runtimeInfo.inputObjects.data);
        this.dsTreeOut.container.clear().append(...this.runtimeInfo.outputObjects.data);
        this.dsTreeErr.container.clear().append(...this.runtimeInfo.errorObjects.data);

        this.dataSources.forEach((ds, t) => {
            // tree has to be expanded
            ds.container.data.forEach((_, n) =>
                this.expandTree.add(this.getExpandTreeKey(t, n))
            );
            // refresh data source
            ds.describers = ds.container.data;
            ds.refresh();
        });
    }


    get runtimeInfo(): XoStepRuntimeInfo {
        return this._runtimeInfo;
    }


    get noDataAvailable(): boolean {
        return this.dataSources.every(ds => !this.hasData(ds));
    }


    hasData(dataSource: XcReadonlyStructureTreeDataSource): boolean {
        return dataSource.structureTreeData.length > 0;
    }


    toClipboard(dataSource: XcReadonlyStructureTreeDataSource) {
        copyToClipboard(dataSource.toString()).subscribe({
            error: () => this.dialogs.error(this.i18n.translate('error.copyToClipboard'))
        });
    }
}
