sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var PersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "demoApp-table-ordtype",
					order: 2,
					text: "Product",
					visible: true
				},
				{
					id: "demoApp-table-relord",
					order: 1,
					text: "Supplier",
					visible: true
				},
				{
					id: "demoApp-table-relitem",
					order: 0,
					text: "Dimensions",
					visible: false
				},
				{
					id: "demoApp-table-meida",
					order: 3,
					text: "Weight",
					visible: true
				}
			]
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		delPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns : [
					{
					id: "demoApp-table-ordtype",
					order: 2,
					text: "Product",
					visible: true
				},
				{
					id: "demoApp-table-relord",
					order: 1,
					text: "Supplier",
					visible: true
				},
				{
					id: "demoApp-table-relitem",
					order: 0,
					text: "Dimensions",
					visible: false
				},
				{
					id: "demoApp-table-meida",
					order: 3,
					text: "Weight",
					visible: true
				}
			
							]
			};

			//set personalization
			this._oBundle = oInitialData;

			//reset personalization, i.e. display table as defined
	//		this._oBundle = null;

			oDeferred.resolve();
			return oDeferred.promise();
		}

	};

	return PersoService;

});