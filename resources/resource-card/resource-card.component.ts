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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@zeta/api';
import { I18nService } from '@zeta/i18n';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ResourceInfo } from '../resource-data-source';
import { XoOrder } from '../xo/order.model';

import { XoResource } from '../xo/resource.model';



@Component({
    selector: 'xfm-mon-resource-card',
    templateUrl: './resource-card.component.html',
    styleUrls: ['./resource-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceCardComponent implements OnDestroy {

    private _resourceInfo: ResourceInfo<XoResource>;
    selectedOrders: XoOrder[] = [];

    private readonly subscriptions: Subscription[] = [];

    @Input()
    set resourceInfo(value: ResourceInfo<XoResource>) {
        this._resourceInfo = value;
        this.subscriptions.push(
            this.resourceInfo.ordersDataSource.selectionModel.selectionChange.subscribe(model =>
                this.selectedOrders = model.selection ?? []
            ),
            this.resourceInfo.ordersDataSource.selectionModel.activatedChange.pipe(
                filter(model => !!model.activated)
            ).subscribe(model => {
                this.openAudit(model.activated.id);

                // remote activation indicator from table because it doesn't indicate anything in this context
                this.resourceInfo.ordersDataSource.selectionModel.activate(undefined);
            }),
            this.resourceInfo.collapsedChange.subscribe(collapsed => {
                this.cdr.markForCheck();
                if (!collapsed) {
                    this.elementRef.nativeElement.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }),
            this.resourceInfo.updated.subscribe(() => this.cdr.markForCheck())
        );
    }

    get resourceInfo(): ResourceInfo<XoResource> {
        return this._resourceInfo;
    }


    constructor(private readonly elementRef: ElementRef, readonly api: ApiService, readonly i18n: I18nService, private readonly router: Router, private readonly cdr: ChangeDetectorRef) {
    }


    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }


    refresh() {
        this.resourceInfo.refresh();
    }


    openAudit(orderId: string) {
        void this.router.navigate(['xfm/Process-Monitor/'], {
            queryParams: {'order': orderId}
        });
    }


    get orderIds(): string[] {
        return this.selectedOrders.map(order => order.id);
    }


    get resource(): XoResource {
        return this.resourceInfo?.resource;
    }
}
