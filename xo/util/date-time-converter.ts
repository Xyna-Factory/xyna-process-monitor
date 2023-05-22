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
import { dateString, isString, timeString } from '@zeta/base';


export interface Duration {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
}


/**
 * Converter between timestamp and readable date format.
 *
 * Fix Format:    yyyy-mm-dd hh:MM:ss.msec
 */
class DateTimeConverterSingleton {

    /**
     * Defines if the readable format is considered local or UTC
     */
    localTime = false;


    timestampToDateTime(timestamp: number | string): string {
        const t = isString(timestamp) ? parseInt(timestamp, 10) : timestamp;
        return dateString(t, 'yyyy-mm-dd', { leadingZeroes: true, convertToUTC: !this.localTime })
            + ' '
            + timeString(t, 'hh:mm:ss.msec', { leadingZeroes: true, convertToUTC: !this.localTime });
    }


    dateTimeToTimestamp(dateTime: string): number {
        const date = new Date(dateTime);

        // "getTime()" returns the UTC-timestamp of the date.
        // For local time input, it's the desired result
        // For UTC-time, the input has already considered to be UTC
        return this.localTime
            ? date.getTime()
            : Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    }


    /**
     * Encode date time filter string from readanle format to format with timestamp
     * @param filter User-inputted string with readable date time and operators
     */
    encodeDateTimeFilter(filter: string): string {
        // find date times and convert to timestamp
        const dateTimeRegEx = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3}/g;
        return filter.replace(dateTimeRegEx, match => '' + this.dateTimeToTimestamp(match));
    }


    /**
     * Decode date time filter string from format with timestamp to readable format
     * @param filter Filter-string from backend with timestamps and operators
     */
    decodeDateTimeFilter(filter: string): string {
        const timestampRegEx = /\d+/g;
        return filter.replace(timestampRegEx, match => '' + this.timestampToDateTime(+match));
    }



    // ======================================================================================================
    // DURATIONS
    // ======================================================================================================

    /**
     * @returns Date representing the duration for given milliseconds
     */
    duration(milliseconds: number): Duration {
        milliseconds = Math.floor(milliseconds);
        const MS_SECOND = 1000;
        const MS_MINUTE = 60 * MS_SECOND;
        const MS_HOUR = 60 * MS_MINUTE;
        const MS_DAY = 24 * MS_HOUR;
        const days = Math.floor(milliseconds / MS_DAY);
        milliseconds %= MS_DAY;
        const hours = Math.floor(milliseconds / MS_HOUR);
        milliseconds %= MS_HOUR;
        const minutes = Math.floor(milliseconds / MS_MINUTE);
        milliseconds %= MS_MINUTE;
        const seconds = Math.floor(milliseconds / MS_SECOND);
        milliseconds %= MS_SECOND;
        return <Duration>{ days: days, hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds };
    }


    durationString(duration: Duration): string {
        const result =
            (duration.days ? `${duration.days}d ` : '')
          + (duration.hours ? `${duration.hours}h ` : '')
          + (duration.minutes ? `${duration.minutes}min ` : '')
          + (duration.seconds ? `${duration.seconds}s ` : '')
          + (duration.milliseconds ? `${duration.milliseconds}ms` : '');
        return result || '0';
    }
}


export const DateTimeConverter = new DateTimeConverterSingleton();
