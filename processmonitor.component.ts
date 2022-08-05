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
import { ChangeDetectorRef, Component, Injector, LOCALE_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { ApiService } from '@zeta/api';
import { AuthService } from '@zeta/auth';
import { I18nService } from '@zeta/i18n';
import { RouteComponent } from '@zeta/nav';
import { XcDialogService, XcTabBarComponent, XcTabBarItem } from '@zeta/xc';

import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { RIGHT_PROCESS_MONITOR_LIVE_REPORTING, RIGHT_PROCESS_MONITOR_MI_MONITOR, RIGHT_PROCESS_MONITOR_ORDER_MONITOR, RIGHT_PROCESS_MONITOR_RESOURCE_MONITOR, RTC } from './const';
import { DocumentService } from './document.service';
import { LiveReportingDetailsComponent } from './live-reporting-details/live-reporting-details.component';
import { LiveReportingComponent } from './live-reporting/live-reporting.component';
import { WF_GET_FREQUENCY_CONTROLLED_TASK_DETAILS } from './live-reporting/live-reporting.consts';
import { XoFrequencyControlledTaskDetails } from './live-reporting/xo/xo-frequency-controlled-task-details.model';
import { XoTaskId } from './live-reporting/xo/xo-task-id.model';
import { pmonTranslations_deDE } from './locale/pmon-translations.de-DE';
import { pmonTranslations_enUS } from './locale/pmon-translations.en-US';
import { ManualInteractionMonitorComponent } from './mi-monitor/mi-monitor.component';
import { OrderdetailsComponent } from './orderdetails/orderdetails.component';
import { OrderoverviewComponent } from './orderoverview/orderoverview.component';
import { CapacitiesComponent } from './resources/capacities/capacities.component';
import { VetoesComponent } from './resources/vetoes/vetoes.component';
import { XoOrderOverviewEntry } from './xo/order-overview-entry.model';


@Component({
    templateUrl: './processmonitor.component.html',
    styleUrls: ['./processmonitor.component.scss'],
    providers: [I18nService]
})
export class ProcessmonitorComponent extends RouteComponent {

    private _tabBar: XcTabBarComponent;
    private queryParamSubscription: Subscription;

    private readonly orderOverview: XcTabBarItem = {name: 'pmon.tab-header-order-overview', component: OrderoverviewComponent};
    private readonly miMonitor:     XcTabBarItem = {name: 'pmon.tab-header-mi-monitor',     component: ManualInteractionMonitorComponent};
    private readonly capacities:    XcTabBarItem = {name: 'pmon.tab-header-capacities',     component: CapacitiesComponent};
    private readonly vetoes:        XcTabBarItem = {name: 'pmon.tab-header-vetoes',         component: VetoesComponent};
    private readonly liveReporting: XcTabBarItem = {name: 'pmon.tab-header-live-reporting', component: LiveReportingComponent};
    readonly tabBarItems: XcTabBarItem[] = [];

    // return to this tab, when no more order documents are opened
    private orderReturnTab: XcTabBarItem;

    // return to this tab, when closing an order document tab (will be reset upon changing out of the sub tab)
    private orderParentTab: XcTabBarItem;


    constructor(
        injector: Injector,
        private readonly authService: AuthService,
        private readonly apiService: ApiService,
        private readonly dialogService: XcDialogService,
        private readonly documentService: DocumentService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly i18n: I18nService,
        private readonly cdr: ChangeDetectorRef
    ) {
        super();

        i18n.setTranslations(I18nService.EN_US, pmonTranslations_enUS);
        i18n.setTranslations(I18nService.DE_DE, pmonTranslations_deDE);
        i18n.language = injector.get(LOCALE_ID) ?? I18nService.EN_US;

        // add default tabs
        if (authService.hasRight(RIGHT_PROCESS_MONITOR_ORDER_MONITOR)) {
            this.tabBarItems.push(this.orderOverview);
        }
        if (authService.hasRight(RIGHT_PROCESS_MONITOR_MI_MONITOR)) {
            this.tabBarItems.push(this.miMonitor);
        }
        if (authService.hasRight(RIGHT_PROCESS_MONITOR_RESOURCE_MONITOR)) {
            this.tabBarItems.push(this.capacities);
            this.tabBarItems.push(this.vetoes);
        }
        if (authService.hasRight(RIGHT_PROCESS_MONITOR_LIVE_REPORTING)) {
            this.tabBarItems.push(this.liveReporting);
        }

        // translate tab item names
        this.tabBarItems.forEach(item => item.name = i18n.translate(item.name));

        // sync documents with tabs
        this.documentService.documentListChange.pipe(filter(() => !!this.tabBar)).subscribe(documents => {
            // open added documents
            documents.forEach((document, idx) => {
                if (!this.tabBar.items.find(item => item.data === document)) {
                    // ensure tabs match order in documents (beware of static tabs and tasks)!!!
                    let documentIdx = 0;
                    let skipped = 0;
                    this.tabBar.items.forEach((item, itemIdx) => {
                        if (item.component === OrderdetailsComponent) {
                            if (documentIdx < idx) {
                                documentIdx++;
                            }
                        } else {
                            skipped++;
                        }
                    });
                    this.tabBar.open(
                        <XcTabBarItem<XoOrderOverviewEntry>>{
                            name: document.id,
                            icon: 'tb-workflow',
                            iconStyle: 'modeller',
                            component: OrderdetailsComponent,
                            closable: true,
                            data: document
                        },
                        this.tabBar.items[documentIdx + skipped]
                    ).subscribe();
                }
            });
            // close removed documents
            this.tabBar.items.filter(
                item => !documents.find(document => document === item.data) &&
                        item.component === OrderdetailsComponent &&
                        item.closable
            ).forEach(
                item => this.tabBar.close(
                    item,
                    undefined,
                    documents.length === 0 && this.tabBar.selection === item
                        ? this.orderReturnTab
                        : this.orderParentTab
                ).subscribe()
            );
        });

        // sync document selection with tab selection
        this.documentService.selectionChange.pipe(filter(() => !!this.tabBar)).subscribe(document =>
            this.tabBar.selection = this.tabBar.items.find(item => item.data === document)
        );

        // necessary for proper step deselection (PMON-263)
        fromEvent(window.document, 'click').subscribe();
    }


    private checkRoute() {
        if (!this.tabBar) {
            return;
        }

        let value: string;
        if ((value = this.route.snapshot.queryParams.order)) {
            if (this.authService.hasRight(RIGHT_PROCESS_MONITOR_ORDER_MONITOR)) {
                // open order in a new tab
                this.documentService.openDocument(new XoOrderOverviewEntry(undefined, value));
                this.cdr.detectChanges();
            } else {
                this.dialogService.error('You are missing the right to use the order monitor (xmcp.xfm.processmonitor.ordermonitor)!');
            }
        }
        if ((value = this.route.snapshot.queryParams.task)) {
            if (this.authService.hasRight(RIGHT_PROCESS_MONITOR_LIVE_REPORTING)) {
                const taskId = +value;
                // check, if task is not already open
                const taskItem = this.tabBar.items.find(item => item.data instanceof XoFrequencyControlledTaskDetails && item.data.taskId.id === taskId);
                if (taskItem) {
                    // select it
                    this.tabBar.selection = taskItem;
                } else {
                    // get task details
                    this.apiService.startOrder(
                        RTC, WF_GET_FREQUENCY_CONTROLLED_TASK_DETAILS,
                        new XoTaskId(undefined, taskId),
                        XoFrequencyControlledTaskDetails
                    ).subscribe(result => {
                        if (!result.errorMessage) {
                            const task = result.output[0] as XoFrequencyControlledTaskDetails;
                            // open task in a new tab
                            this.tabBar.open(<XcTabBarItem<XoFrequencyControlledTaskDetails>>{
                                name: this.i18n.translate('pmon.task') + ' ' + task.taskId.id,
                                component: LiveReportingDetailsComponent,
                                closable: true,
                                data: task
                            }).subscribe();
                        } else {
                            this.dialogService.error(result.errorMessage);
                        }
                    });
                }
            } else {
                this.dialogService.error('You are missing the right to use live reporting (xmcp.xfm.processmonitor.livereporting)!');
            }
        }
    }


    private updateRoute() {
        const item = this.tabBar?.selection;
        const extras: NavigationExtras = {};
        if (item?.component === OrderdetailsComponent) {
            extras.queryParams = {'order': (<XoOrderOverviewEntry>item.data).id};
        }
        if (item?.component === LiveReportingDetailsComponent) {
            extras.queryParams = {'task':  (<XoFrequencyControlledTaskDetails>item.data).taskId.id};
        }
        // set query param in url
        void this.router.navigate([], extras);
    }


    onShow() {
        // check route when query parameters change while already being in the process monitor.
        // this is necessary when opening an audit from a workflow tester invoked from another audit.
        this.queryParamSubscription = this.route.queryParams.subscribe(() => {
            this.checkRoute();
        });
        // set query parameter of route for selected document tab (e.g. order=10602628),
        // when simply switching back to base route (e.g. xfm/Process-Monitor)
        setTimeout(() => {
            this.updateRoute();
        }, 0);
    }


    onHide() {
        this.queryParamSubscription?.unsubscribe();
    }


    tabChanged(item: XcTabBarItem) {
        this.updateRoute();
        // remember order tab to switch back to
        if (item === this.orderOverview || item === this.capacities || item === this.vetoes) {
            this.orderReturnTab = item;
        }
        // remember order parent tab
        if (item?.data instanceof XoOrderOverviewEntry && item.data.parentId) {
            this.orderParentTab = this.tabBarItems.find(value => value.data?.id === item.data.parentId);
            item.data.parentId = undefined;
        } else {
            this.orderParentTab = undefined;
        }
        // select document of tab
        if (item?.component === OrderdetailsComponent) {
            this.documentService.selectedDocument = item.data;
        }
    }


    @ViewChild(XcTabBarComponent, {static: false})
    set tabBar(value: XcTabBarComponent) {
        this._tabBar = value;
        this.checkRoute();
    }


    get tabBar(): XcTabBarComponent {
        return this._tabBar;
    }
}
