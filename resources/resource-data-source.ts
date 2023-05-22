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
import { ApiService, StartOrderOptionsBuilder, Xo, XoArray, XoArrayClassInterface, XoObjectClassInterface } from '@zeta/api';
import { Comparable } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcRemoteTableDataSource, XcSelectionDataSource, XcSelectionModel } from '@zeta/xc';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { RTC } from '../const';
import { XoName } from './xo/name.model';
import { XoOrder, XoOrderArray } from './xo/order.model';
import { XoResource } from './xo/resource.model';


export class ResourceInfo<T extends XoResource> extends Comparable {

    private readonly updatedSubject = new Subject<this>();
    private readonly collapsedSubject = new BehaviorSubject<boolean>(true);

    constructor(public resource: T, public ordersDataSource: XcRemoteTableDataSource<XoOrder>, public api: ApiService, public detailsOrderType: string) {
        super();

        // if orders refresh (e. g. by sorting), the resource object has to be refreshed, too
        // skip first refresh, which is triggered on init of the orders-table
        this.ordersDataSource.dataChange.pipe(skip(1)).subscribe(orders => this.refreshResource());
    }


    refresh() {
        this.refreshOrders();   // will refresh capacity-details, too
    }


    private refreshResource() {
        this.api.startOrder(RTC, this.detailsOrderType, new XoName(undefined, this.resource?.name ?? ''), this.resource.decoratorClass as XoObjectClassInterface<T>, StartOrderOptionsBuilder.defaultOptionsWithErrorMessage).subscribe(result => {
            this.resource = result.output?.[0] as T;
            this.updatedSubject.next(this);
        });
    }


    private refreshOrders() {
        this.ordersDataSource.input = this.resource;
        this.ordersDataSource.refresh();
    }


    get updated(): Observable<this> {
        return this.updatedSubject.asObservable();
    }


    get collapsed(): boolean {
        return this.collapsedSubject.value;
    }


    set collapsed(value: boolean) {
        this.collapsedSubject.next(value);

        // fetch details on uncollapse, if not fetched yet
        if (!this.collapsed) {
            this.refresh();
        }
    }


    get collapsedChange(): Observable<boolean> {
        return this.collapsedSubject.asObservable();
    }


    get uniqueKey(): string {
        return this.resource?.name ?? '';
    }
}



export class ResourceDataSource<R extends XoResource, L extends XoArray<R> = XoArray<R>> extends XcSelectionDataSource<ResourceInfo<R>> {

    private expandedResourceInfo: ResourceInfo<R>;
    private readonly infoSubscriptions: Subscription[] = [];


    constructor(private readonly api: ApiService, private readonly i18n: I18nService, public listOrderType: string, public listInput: Xo[], public listOutput: XoArrayClassInterface<L>, public detailsOrderType: string) {
        super(new XcSelectionModel());
    }


    cleanup() {
        this.infoSubscriptions.forEach(s => s.unsubscribe());
    }


    refresh() {
        super.refresh();

        this.cleanup();
        this.api.startOrderAssertFlat<R>(RTC, this.listOrderType, this.listInput, this.listOutput).subscribe(output => {
            this.data = output.map(resource => {
                const info = new ResourceInfo(
                    resource,
                    new XcRemoteTableDataSource<XoOrder>(this.api, this.i18n, RTC, 'xmcp.processmonitor.resources.GetOrders'),
                    this.api,
                    this.detailsOrderType
                );
                info.ordersDataSource.input = info.resource;
                info.ordersDataSource.output = XoOrderArray;

                this.infoSubscriptions.push(info.collapsedChange.subscribe(collapsed => {
                    if (collapsed) {
                        if (this.expandedResourceInfo === info) {
                            this.expandedResourceInfo = null;
                        }
                    } else {
                        // collapse previously expanded resource
                        if (this.expandedResourceInfo && !this.expandedResourceInfo.equals(info)) {
                            this.expandedResourceInfo.collapsed = true;
                        }
                        this.expandedResourceInfo = info;
                    }
                }));

                return info;
            });

            // restore expanded resource
            if (this.expandedResourceInfo) {
                const result = this.data.find(info => info.equals(this.expandedResourceInfo));
                if (result) {
                    this.expandedResourceInfo = result;
                    this.expandedResourceInfo.collapsed = false;
                }
            }
        });
    }


    get rawData(): ResourceInfo<R>[] {
        return this.data;
    }
}
