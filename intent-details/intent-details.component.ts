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
import { afterNextRender, ChangeDetectorRef, Component, inject, Injector, OnDestroy, signal, ViewChild } from '@angular/core';

import { ApiService, RuntimeContext } from '@zeta/api';
import { I18nService, LocaleService, XcI18nContextDirective, XcI18nTranslateDirective } from '@zeta/i18n';
import { XcAutocompleteDataWrapper, XcDialogService, XcFormAutocompleteComponent, XcIconButtonComponent, XcPanelComponent, XcTabComponent, XcTooltipDirective } from '@zeta/xc';

import ElkConstructor from 'elkjs';

import { EFConnectableSide, EFConnectionBehavior, EFConnectionType, EFMarkerType, FCanvasComponent, FFlowComponent, FFlowModule, FSelectionChangeEvent } from '@foblex/flow';
import { DocumentService } from '../document.service';
import { XoIntentEntry } from '../intent-overview/xo/intent-entry.model';
import { getIntentRuntimeContext } from '../intent/intent';
import { XoOrderOverviewEntry } from '../xo/order-overview-entry.model';
import { intentDetailsTranslations_deDE } from './locale/intent-details-translations.de-DE';
import { intentDetailsTranslations_enUS } from './locale/intent-details-translations.en-US';
import { XoGraph } from './xo/graph.model';
import { XoIntentDetails } from './xo/intent-details.model';


interface Node {
    id: string;
    label: string;
    orderId: string;
    orderStatus: string;
    tooltip: string;
    backgroundColor: string;
    borderColor: string;
    stateColor: string;
    stateLabel: string;
    position: { x: number; y: number };
    selected: boolean;
}

interface Edge {
    id: string;
    label: string;
    source: string;
    target: string;
    undirected: boolean;
    markerSource: boolean;
    markerTarget: boolean;
    color: string;
}

enum GraphType {
    EXECUTION = 'execution',
    INTENT = 'intent'
}

const WF_GET_INTENT_DETAILS = 'xmcp.processmonitor.intent.GetIntentDetails';

const INITIAL_SCALE = 1.25;
const NODE_SPACING_HORIZONTAL = 90;
const NODE_SPACING_VERTICAL = 60;
const REFRESH_INTERVAL = 5000;


@Component({
    selector: 'xfm-mon-intent-instance-details',
    templateUrl: './intent-details.component.html',
    styleUrls: ['./intent-details.component.scss'],
    imports: [FFlowModule, XcIconButtonComponent, XcFormAutocompleteComponent, XcPanelComponent, XcTooltipDirective, XcI18nContextDirective, XcI18nTranslateDirective]
})
export class IntentDetailsComponent extends XcTabComponent<void, XoIntentEntry> implements OnDestroy {

    private readonly i18nService = inject(I18nService);
    private readonly apiService = inject(ApiService);
    private readonly dialogService = inject(XcDialogService);
    private readonly documentService = inject(DocumentService);
    private readonly injector = inject(Injector);
    private readonly cdr = inject(ChangeDetectorRef);

    private readonly elk = new ElkConstructor();
    readonly eMarkerType = EFMarkerType;
    readonly graphVisible = signal(true);

    outputSide: EFConnectableSide = EFConnectableSide.BOTTOM;
    inputSide: EFConnectableSide = EFConnectableSide.TOP;

    @ViewChild(FFlowComponent, { static: true })
    fFlow!: FFlowComponent;

    @ViewChild(FCanvasComponent, { static: true })
    fCanvas!: FCanvasComponent;

    intentDetails: XoIntentDetails | undefined;

    graph: XoGraph | undefined;
    nodes: Node[] = [];
    edges: Edge[] = [];
    selfLoopNodeIds = new Set<string>();

    maxLabelLength = 0;
    runtimeContext = RuntimeContext.undefined;

    graphType = GraphType.EXECUTION;
    graphTypeDataWrapper = new XcAutocompleteDataWrapper(
        () => this.graphType,
        (value: GraphType) => {
            this.graphType = value;
            this.update(true);
        },
        [
            { name: signal('Execution Graph'), value: GraphType.EXECUTION },
            { name: signal('Intent Graph'), value: GraphType.INTENT }
        ]
    );

    private timeout: ReturnType<typeof setTimeout> | undefined;
    private active = true;



    constructor() {
        super();

        if (this.tabBarItem) {
            this.tabBarItem.afterActivate = () => this.setActive(true);
            this.tabBarItem.afterDeactivate = () => this.setActive(false);
        }

        this.i18nService.setTranslations(LocaleService.EN_US, intentDetailsTranslations_enUS);
        this.i18nService.setTranslations(LocaleService.DE_DE, intentDetailsTranslations_deDE);

        getIntentRuntimeContext(this.apiService).subscribe(rtc => {
            this.runtimeContext = rtc;
            this.refresh();
        });
    }

    ngOnDestroy(): void {
        this.setActive(false);
    }

    private setActive(active: boolean): void {
        if (this.active === active) {
            return;
        }
        this.active = active;
        clearTimeout(this.timeout);
        this.timeout = undefined;
        if (active) {
            this.refresh();
        }
    }

    update(resetView: boolean): void {
        if (this.intentDetails) {
            let graph: XoGraph;
            switch (this.graphType) {
                case GraphType.EXECUTION:
                    graph = this.intentDetails.executionGraph;
                    break;
                case GraphType.INTENT:
                    graph = this.intentDetails.intentGraph;
                    break;
                default:
                    console.error('Unknown graph type:', this.graphType);
                    return;
            }
            const nodes = graph.nodes.data.map(node => ({
                id: node.id,
                label: node.label,
                orderId: node.orderId,
                orderStatus: node.orderStatus,
                tooltip: node.orderStatus ? `${node.orderId} (${node.orderStatus})` : '',
                backgroundColor: node.style.backgroundColor,
                borderColor: node.style.borderColor,
                stateColor: node.style.stateColor,
                stateLabel: node.state,
                position: {
                    x: 0,
                    y: 0
                },
                selected: false
            }));
            const edges = graph.edges.data.map(edge => ({
                id: edge.from + '-' + edge.to,
                label: edge.label,
                source: edge.from,
                target: edge.to,
                undirected: edge.undirected,
                markerSource: edge.style.startMarker === 'Arrow',
                markerTarget: edge.style.endMarker === 'Arrow',
                color: edge.style.lineColor
            }));
            this.maxLabelLength = this.getMaxLabelLength(nodes);
            this.layout(graph, nodes, edges, resetView);
        }
    }

    refresh() {
        if (!this.runtimeContext.uniqueKey) {
            console.error('RuntimeContext is undefined. Cannot refresh intent details.');
            return;
        }
        this.apiService.startOrder(
            this.runtimeContext,
            WF_GET_INTENT_DETAILS,
            this.injectedData,
            XoIntentDetails
        ).subscribe(result => {
            if (result && !result.errorMessage) {
                const initialUpdate = !this.intentDetails;
                this.intentDetails = result.output?.[0] as XoIntentDetails;
                this.update(initialUpdate);

                // a request still in flight while the tab got deactivated must not re-schedule
                if (this.active && this.intentDetails.finished !== 'Finished') {
                    console.log('auto-refresh');
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => this.refresh(), REFRESH_INTERVAL);
                }
            } else {
                this.dialogService.error(result.errorMessage ?? 'Unknown error');
            }
        });
    }

    /**
     * Emitted by foblex once the first render following `fFlow.reset()` has settled,
     * i.e. once the new nodes are rendered and connected.
     */
    onFullRendered(): void {
        if (!this.graphVisible()) {
            this.resetView(() => this.graphVisible.set(true));
        }
    }

    /**
     * Centers the graph and zooms to `INITIAL_SCALE`, since foblex' `resetScaleAndCenter` always resets to a scale of 1
     */
    private resetView(done?: () => void): void {
        this.fCanvas.resetScaleAndCenter(false);
        // resetScaleAndCenter applies the transform in a timeout of its own, zoom afterwards
        setTimeout(() => {
            const host = this.fFlow.hostElement;
            this.fCanvas.setScale(INITIAL_SCALE, { x: host.clientWidth / 2, y: host.clientHeight / 2 });
            this.fCanvas.redraw();
            done?.();
        });
    }

    onSelectionChange(event: FSelectionChangeEvent): void {
        this.nodes.forEach(node => node.selected = false);
        if (event.nodeIds.length > 0) {
            const nodeId = event.nodeIds[0];
            const node = this.nodes.find(n => n.id === nodeId);
            if (node) {
                node.selected = true;
            }
        }
    }

    layout(graph: XoGraph, nodes: Node[], edges: Edge[], resetView: boolean) {
        if (!graph) {
            console.error('Graph is undefined. Cannot layout graph.');
            return;
        }
        const nodeWidth = this.getNodeWidth();
        const nodeHeight = this.getNodeHeight();
        // ELK distinguishes spacing within a layer and between layers, which axis that is depends on the direction
        const horizontalLayers = graph.layout === 'LR' || graph.layout === 'RL';
        const spacingInLayer = horizontalLayers ? NODE_SPACING_VERTICAL : NODE_SPACING_HORIZONTAL;
        const spacingBetweenLayers = horizontalLayers ? NODE_SPACING_HORIZONTAL : NODE_SPACING_VERTICAL;
        const elkGraph = {
            id: graph.id,
            layoutOptions: {
                'elk.algorithm': 'elk.layered',
                'elk.layered.nodePlacement.strategy': 'SIMPLE',

                // 'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
                // 'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',

                // 'elk.algorithm': 'elk.mrtree',

                'elk.spacing.nodeNode': String(spacingInLayer),
                'elk.layered.spacing.nodeNodeBetweenLayers': String(spacingBetweenLayers),
                'elk.direction': {
                    'TB': 'DOWN',
                    'BT': 'UP',
                    'LR': 'RIGHT',
                    'RL': 'LEFT'
                }[graph.layout] || 'DOWN'
            },
            children: nodes.map(node => ({
                id: node.id,
                width: nodeWidth,
                height: nodeHeight
            })),
            edges: edges.filter(edge => !edge.undirected).map(edge => ({
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target]
            }))
        };

        this.elk.layout(elkGraph).then(layout => {
            this.applyLayout(graph, nodes.map(node => {
                const graphNode = layout.children?.find(n => n.id === node.id);
                return {
                    ...node,
                    position: {
                        x: graphNode?.x ?? 0,
                        y: graphNode?.y ?? 0
                    }
                };
            }), edges, resetView);
        }).catch(error => {
            console.error('ELK layout error:', error);
        });
    }

    /**
     * Applies all layout dependent state at once, so the old graph is never rendered
     * with properties (sizes, connectable sides) of the new one.
     */
    private applyLayout(graph: XoGraph, nodes: Node[], edges: Edge[], resetView: boolean): void {
        if (!this.graph || this.graph.id !== graph.id) {
            this.graphVisible.set(false);
            this.fFlow.reset();
        } else if (resetView) {
            afterNextRender(() => this.resetView(), { injector: this.injector });
        }
        this.graph = graph;
        this.nodes = nodes;
        this.edges = edges;
        this.selfLoopNodeIds = new Set(edges.filter(edge => this.isSelfLoop(edge)).map(edge => edge.source));
        this.updateConnectableSides();
        this.cdr.detectChanges();
    }

    private getMaxLabelLength(nodes: Node[]): number {
        return nodes.reduce((max, node) => Math.max(max, node.label.length), 0);
    }

    private updateConnectableSides(): void {
        switch (this.graph?.layout) {
            case 'BT':
                this.outputSide = EFConnectableSide.TOP;
                this.inputSide = EFConnectableSide.BOTTOM;
                break;
            case 'LR':
                this.outputSide = EFConnectableSide.RIGHT;
                this.inputSide = EFConnectableSide.LEFT;
                break;
            case 'RL':
                this.outputSide = EFConnectableSide.LEFT;
                this.inputSide = EFConnectableSide.RIGHT;
                break;
            case 'TB':
            default:
                this.outputSide = EFConnectableSide.BOTTOM;
                this.inputSide = EFConnectableSide.TOP;
                break;
        }
    }

    getOutputConnectableSide(nodeId: string): EFConnectableSide {
        return this.hasSelfLoop(nodeId) ? EFConnectableSide.BOTTOM : this.outputSide;
    }

    getInputConnectableSide(nodeId: string): EFConnectableSide {
        return this.hasSelfLoop(nodeId) ? EFConnectableSide.LEFT : this.inputSide;
    }

    getConnectionBehavior(edge: Edge): EFConnectionBehavior {
        return this.isSelfLoop(edge) ? EFConnectionBehavior.FIXED : EFConnectionBehavior.FLOATING;
    }

    getConnectionType(edge: Edge): EFConnectionType {
        return this.isSelfLoop(edge) ? EFConnectionType.SEGMENT : EFConnectionType.STRAIGHT;
    }

    private hasSelfLoop(nodeId: string): boolean {
        return this.selfLoopNodeIds.has(nodeId);
    }

    private isSelfLoop(edge: Edge): boolean {
        return edge.source === edge.target;
    }

    nodeLabelMouseDown(node: Node, event: MouseEvent) {
        if (node.tooltip) {
            event.stopPropagation();
        }
    }

    nodeLabelClick(node: Node) {
        if (node.orderId && this.intentDetails) {
            this.documentService.openDocument(
                new XoOrderOverviewEntry(undefined, node.orderId, this.intentDetails.id)
            );
        }
    }

    getNodeWidth(): number {
        return 60 + this.maxLabelLength * 8;
    }

    getNodeHeight(): number {
        return 30;
    }

    getSourceNodeId(nodeId: string): string {
        return nodeId + '-target';
    }

    getTargetNodeId(nodeId: string): string {
        return nodeId + '-source';
    }
}
