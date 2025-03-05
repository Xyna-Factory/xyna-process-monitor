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
import { ChangeDetectorRef, Component, Input } from '@angular/core';

import { IterationInfo } from '@pmod/xo/runtime-info.model';
import { I18nService } from '@zeta/i18n';

import { XoIterationContainer } from '../../../xo/iteration-container.model';
import { XoIterationEntry } from '../../../xo/iteration-entry.model';
import { XoStepRuntimeInfo } from '../../../xo/step-runtime-info.model';
import { AuditService } from '../../audit.service';


@Component({
    selector: 'xfm-mon-iteration-runtime-info',
    templateUrl: './iteration-runtime-info.component.html',
    styleUrls: ['./iteration-runtime-info.component.scss'],
    standalone: false
})
export class IterationRuntimeInfoComponent {

    private readonly allowedKeys = new Set(['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight']);

    private _runtimeInfo: XoIterationContainer;

    // selected iteration (can be undefined, if selected index does not match index in any iteration)
    private _selectedIteration: XoIterationEntry;

    // selected iteration index, displayed in input box
    private _selectedIndex: number;

    private _firstIndex: number;
    private _lastIndex: number;

    // array index of selected iteration
    private _arrayIdx: number;

    private _lazyLoadingLimit: number;
    private _iterationDepth: number;

    limitError: string;
    violatesLimit = false;


    constructor(
        private readonly i18n: I18nService,
        private readonly cdref: ChangeDetectorRef,
        private readonly auditService: AuditService
    ) {
    }


    private selectIteration(arrayIdx: number) {
        // select iteration
        this.selectedIteration = this.iterations[arrayIdx];
        // update selected index
        if (this.selectedIteration) {
            // enforce the input field value to update by reseting the selected index to -1 first
            this._selectedIndex = -1;
            this.cdref.detectChanges();
            this._selectedIndex = this.selectedIteration.index;
        }
        // update array index accordingly
        this._arrayIdx = this.selectIteration ? arrayIdx : -1;
    }


    private checkLazyLoadingLimit() {
        this.limitError = undefined;
        this.violatesLimit = false;

        if (this.lazyLoadingLimit >= 1 && this.runtimeInfo && this.iterationDepth) {
            const limit = Math.max(1, Math.trunc(Math.pow(this.lazyLoadingLimit, 1 / this.iterationDepth)));
            this.violatesLimit = this.iterations.length >= limit;
            this.limitError = this.i18n.translate(
                'order-overview.order-details.limiterror',
                {key: '$0', value: '' + limit}
            );
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
    set runtimeInfo(value: XoIterationContainer) {
        this._runtimeInfo = value;
        this.checkLazyLoadingLimit();

        // determine first and last iteration index
        const len = this.iterations.length;
        if (len > 0) {
            this._firstIndex = this.iterations[0].index;
            this._lastIndex  = this.iterations[len - 1].index;
        } else {
            this._firstIndex = -1;
            this._lastIndex  = -1;
        }

        // pre-select first iteration
        this.selectIteration(0);
    }


    get runtimeInfo(): XoIterationContainer {
        return this._runtimeInfo;
    }


    @Input()
    set iterationDepth(value: number) {
        this._iterationDepth = value;
        this.checkLazyLoadingLimit();
    }


    get iterationDepth(): number {
        return this._iterationDepth;
    }


    set selectedIteration(value: XoIterationEntry) {
        this._selectedIteration = value;

        if (this.selectedIteration) {
            this.auditService.setIterationInfo(
                <IterationInfo>{
                    iterationContainerKey: this.runtimeInfo.iterationContainerKey,
                    iterationIndex:        this.selectedIteration.index
                }
            );
        }
    }


    get selectedIteration(): XoIterationEntry {
        return this._selectedIteration;
    }


    get selectedIndex(): number {
        return this._selectedIndex;
    }


    get iterationStatus(): string {
        return this.selectedIteration && this.selectedIteration.runtimeInfo instanceof XoStepRuntimeInfo
            ? this.selectedIteration.runtimeInfo.status
            : '';
    }


    get firstIndex(): number {
        return this._firstIndex;
    }


    get lastIndex(): number {
        return this._lastIndex;
    }


    get iterations(): XoIterationEntry[] {
        return this.runtimeInfo
            ? this.runtimeInfo.iterations.data
            : [];
    }


    start() {
        if (this.hasPrev) {
            this.selectIteration(0);
        }
    }


    end() {
        if (this.hasNext) {
            this.selectIteration(this.iterations.length - 1);
        }
    }


    prev() {
        if (this.hasPrev) {
            this.selectIterationShift(-1);
        }
    }


    next() {
        if (this.hasNext) {
            this.selectIterationShift(1);
        }
    }


    get hasPrev(): boolean {
        return this.selectedIndex > this.firstIndex;
    }


    get hasNext(): boolean {
        return this.selectedIndex < this.lastIndex;
    }


    private selectIterationShift(shift: -1 | 0 | 1) {
        this.selectIteration(
            this._arrayIdx < 0
                ? this.findArrayIndex(shift)
                : this._arrayIdx + shift
        );
    }


    private findArrayIndex(shift: -1 | 0 | 1): number {
        const arr = this.iterations;
        const max = arr.length - 1;
        const idx = (() => {
            for (let i = 0; i <= max; i++) {
                const sub = arr[i].index - this.selectedIndex;
                if ((sub > 0 && shift < 0) || sub === 0) {
                    return i + shift;
                }
                if (sub > 0 && shift === 0) {
                    break;
                }
                if ((sub > 0 && shift > 0) || i === max) {
                    return i;
                }
            }
        })();

        if (idx === undefined) {
            return -1;
        }
        return Math.max(0, Math.min(max, idx));
    }


    indexKeydown(event: KeyboardEvent, text: string) {
        if (event.key === 'Enter') {
            this.indexBlur(text);
        }
        if ((event.key < '0' || event.key > '9') && !this.allowedKeys.has(event.key)) {
            event.stopPropagation();
            return false;
        }
    }


    indexBlur(text: string) {
        this._arrayIdx = -1;
        this._selectedIndex = +text;
        this.selectIterationShift(0);
    }
}
