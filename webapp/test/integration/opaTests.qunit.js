/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"zqtc/ZQTC_CLAIMS/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
