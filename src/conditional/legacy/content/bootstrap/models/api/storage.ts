/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2017 Martin Kimmerle
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

import {Module} from "lib/classes/module";
import {IKeysWithDefaults} from "lib/classes/object-interface";
import {createListenersMap} from "lib/utils/listener-factories";
import {SyncLocalStorageArea} from "./storage/sync-local-storage-area";

export class Storage extends Module {
  protected moduleName = "storage";

  private slsa = new SyncLocalStorageArea();

  private events = createListenersMap(["onChanged"]);

  public get backgroundApi() {
    return {
      local: {
        get: this.getLocal.bind(this),
        set: this.setLocal.bind(this),
      },
      onChanged: this.events.interfaces.onChanged,
    };
  }

  public get contentApi() {
    return this.backgroundApi;
  }

  public getLocal(
      aKeys: string | string[] | IKeysWithDefaults | null | undefined,
  ) {
    return Promise.resolve(this.slsa.get(aKeys));
  }

  public setLocal(aKeys: {[k: string]: any}) {
    try {
      return Promise.resolve(this.slsa.set(aKeys));
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
