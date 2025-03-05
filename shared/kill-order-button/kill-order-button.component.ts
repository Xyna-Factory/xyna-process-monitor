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
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { XoError } from '@pmod/xo/error.model';
import { ApiService } from '@zeta/api';
import { AuthService } from '@zeta/auth';
import { coerceBoolean } from '@zeta/base';
import { XcDialogService } from '@zeta/xc';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
    selector: 'xfm-mon-kill-order-button',
    templateUrl: './kill-order-button.component.html',
    styleUrls: ['./kill-order-button.component.scss'],
    standalone: false
})
export class KillOrderButtonComponent {

    private _icon = false;
    private _disabled = false;

    @Input()
    orderIds: string[];

    @Output()
    readonly refresh = new EventEmitter<void>();


    constructor(
        private readonly authService: AuthService,
        private readonly dialogService: XcDialogService,
        private readonly api: ApiService
    ) {
    }


    kill() {
        this.api.killOrders(this.orderIds).pipe(
            catchError((response, caught) => {
                const xo = new XoError().decode(response.error);
                // if (xo.message) {
                //     this.dialogService.error(xo.message);
                // }
                // FIXME: replace with code above, once PMON-221 has been fixed
                if ((xo.data as any).exceptionMessage) {
                    this.dialogService.error((xo.data as any).exceptionMessage);
                }
                // END OF FIXME
                return throwError(caught);
            })
        ).subscribe(
            () => this.refresh.emit()
        );
    }


    @Input()
    set disabled(value: boolean) {
        this._disabled = coerceBoolean(value);
    }


    get disabled(): boolean {
        return this._disabled;
    }


    @Input()
    set icon(value: boolean) {
        this._icon = coerceBoolean(value);
    }


    get icon(): boolean {
        return this._icon;
    }


    get visible(): boolean {
        return this.authService.hasRight('KILL_STUCK_PROCESS');
    }
}
