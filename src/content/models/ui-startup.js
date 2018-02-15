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

import {promiseObserverTopic} from "legacy/lib/utils/xpcom-utils";
import * as WindowUtils from "lib/utils/window-utils";
import {Windows} from "models/windows";

function areWindowsAvailable() {
  if (WindowUtils.getMostRecentBrowserWindow() === null) {
    return false;
  }
  try {
    Windows.forEachOpenWindow((win) => WindowUtils.getTabBrowser(win));
  } catch (e) {
    return false;
  }
  return true;
}

function promiseSessionstoreWindowsRestored() {
  return promiseObserverTopic("sessionstore-windows-restored").
      then(() => undefined);
}

export const pWindowsAvailable = areWindowsAvailable() ? Promise.resolve() :
  promiseSessionstoreWindowsRestored();