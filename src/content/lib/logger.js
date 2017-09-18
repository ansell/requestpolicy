/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2008 Justin Samuel
 * Copyright (c) 2014 Martin Kimmerle
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

"use strict";

import {Environment, MainEnvironment} from "lib/environment";

//==============================================================================
// Logger
//==============================================================================

/**
 * Provides logging methods
 */
export var Logger = (function() {
  let self = {};

  //----------------------------------------------------------------------------
  // constants
  //----------------------------------------------------------------------------

  const LevelEnum = Object.freeze({
    OFF: Number.MAX_VALUE, // no logging
    ERROR: 1000,
    WARNING: 900,
    INFO: 800,
    DEBUG: 700,
    ALL: Number.MIN_VALUE, // log everything
  });

  const MINIMUM_LOGGING_LEVEL = LevelEnum.ERROR;

  //----------------------------------------------------------------------------
  // settings
  //----------------------------------------------------------------------------

  let loggingLevel = LevelEnum.ALL;
  let loggingEnabled = true;

  browser.storage.local.get([
    "log",
    "log.level",
  ]).then(result => {
    loggingEnabled = result.log;
    loggingLevel = result["log.level"];
    return;
  }).catch(error => {
    console.error("Error initializing the Logger! Details:");
    console.dir(error);
  });

  function onStorageChange(aChanges, aAreaName) {
    if (aChanges.hasOwnProperty("log")) {
      loggingEnabled = aChanges.log.newValue;
    }
    if (aChanges.hasOwnProperty("log.level")) {
      loggingLevel = aChanges["log.level"].newValue;
    }
  }

  browser.storage.onChanged.addListener(onStorageChange);

  //----------------------------------------------------------------------------
  // logging
  //----------------------------------------------------------------------------

  function shouldLog(aLevel) {
    if (loggingEnabled && aLevel >= loggingLevel) {
      return true;
    }

    // @ifdef UI_TESTING
    if (aLevel >= LevelEnum.WARNING) {
      // log even if logging is disabled
      return true;
    }
    // @endif

    if (aLevel >= MINIMUM_LOGGING_LEVEL) {
      // log even if logging is disabled
      return true;
    }

    return false;
  }

  function log(aLevel, aFn, aMessage, aError) {
    if (shouldLog(aLevel)) {
      let msg = `[RequestPolicy] ${aMessage}`;
      aFn(msg);
      if (aError) {
        self.reportError(aError);
      }
    }
  }

  self.error = log.bind(self, LevelEnum.ERROR, console.error);
  self.warning = log.bind(self, LevelEnum.WARNING, console.warn);
  self.info = log.bind(self, LevelEnum.INFO, console.info);
  self.debug = log.bind(self, LevelEnum.DEBUG, console.debug);

  self.trace = console.trace.bind(null);

  self.reportError = function reportError(e) {
    console.dir(e);
  };

  self.vardump = function(obj) {
    if (shouldLog(LevelEnum.DEBUG)) {
      console.dir(obj);
    }
  };

  return self;
}());

// @ifdef UI_TESTING

//==============================================================================
// ErrorTriggeringService
//==============================================================================

/**
 * Triggers errors for a RequestPolicy UI test.
 * It's used to test Error Detection from the UI tests.
 */
function createErrorTriggeringService() {
  let self = {};

  const where = MainEnvironment.isMainEnvironment ?
      "backgroundscript" :
      "contentscript";

  const topic = "requestpolicy-trigger-error-" + where;

  const observer = {};

  self.startup = function() {
    Services.obs.addObserver(observer, topic, false);
  };

  self.shutdown = function() {
    Services.obs.removeObserver(observer, topic);
  };

  /**
   * Split a string like
   *   "foo:bar:baz"
   * to two strings:
   *   ["foo", "bar:baz"]
   * Only the first colon counts.
   */
  function splitColon(aString) {
    var index = aString.indexOf(":");
    if (index === -1) {
      return [aString, ""];
    }
    var part1 = aString.substr(0, index);
    var part2 = aString.substr(index + 1);
    return [part1, part2];
  }

  observer.observe = function(aSubject, aTopic, aData) {
    let [type, message] = splitColon(aData);

    if (type === "error") {
      Logger.error(message);
    } else if (type === "ReferenceError") {
      runAsync(produceReferenceError);
    }
  };

  function produceReferenceError() {
    var localVar = nonexistantVariable; // jshint ignore:line
  }

  function runAsync(aFunction) {
    var runnable = {run: aFunction};
    Services.tm.currentThread.dispatch(runnable,
        Ci.nsIEventTarget.DISPATCH_NORMAL);
  }

  return self;
}

var ErrorTriggeringService;
// @endif

Logger.bootstrap = function() {
  // @ifdef UI_TESTING
  ErrorTriggeringService = createErrorTriggeringService();
  MainEnvironment.addStartupFunction(Environment.LEVELS.BACKEND,
      ErrorTriggeringService.startup);
  MainEnvironment.addShutdownFunction(Environment.LEVELS.BACKEND,
      ErrorTriggeringService.shutdown);
  // @endif
};
