/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2018 Martin Kimmerle
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * ***** END LICENSE BLOCK *****
 */

// tslint:disable:no-namespace

import * as compareVersions from "lib/third-party/mozilla-version-comparator";
import { BrowserSettings } from "./browser-settings/browser-settings.module";
import { Migration } from "./migration/migration.module";
import { SettingsMigration } from "./migration/settings-migration";
import { Policy } from "./policy/policy.module";
import { RPServices } from "./services/services.module";
import { CachedSettings } from "./storage/cached-settings";
import { Storage } from "./storage/storage.module";
import { Ui } from "./ui/ui.module";
import { VersionInfoService } from "./services/version-info-service";
import { AsyncSettings } from "app/storage/async-settings";

export interface IVersionComparator {
  compare: typeof compareVersions;
}

export namespace App {
  export namespace migration {
    export type ISettingsMigration = SettingsMigration;
  }

  export namespace services {
    export type IVersionInfoService = VersionInfoService;
  }

  export namespace storage {
    export type IAsyncSettings = AsyncSettings;
    export type ICachedSettings = CachedSettings;
  }

  export type IBrowserSettings = BrowserSettings;
  export type IMigration = Migration;
  export type IPolicy = Policy;
  export type IRPServices = RPServices;
  export type IStorage = Storage;
  export type IUi = Ui;
}