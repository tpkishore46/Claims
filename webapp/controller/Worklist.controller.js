sap.ui.define([
		"./BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/odata/v2/ODataModel",
		"../model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/Button",
		"sap/m/Dialog",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV",
		"sap/ui/table/TablePersoController",
		"../model/personalization"
	],
	function (BaseController, JSONModel, ODATAModel, formatter, Filter, FilterOperator, Button, Dialog, Export, ExportType,
		TablePersoController, DemoPersoService) {
		"use strict";

		return BaseController.extend("zqtc.ZQTC_CLAIMS.controller.Worklist", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */

			onInit: function () {
				// var oViewModel,
				// 	iOriginalBusyDelay,
				// 	oTable = this.byId("table");

				// Put down worklist table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				//	iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				//	this._aTableSearchState = [];

				// Model used to manipulate control states
				// oViewModel = new JSONModel({
				// 	worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				// 	shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				// 	shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				// 	shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				// 	tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
				// 	tableBusyDelay : 0
				// });
				// this.setModel(oViewModel, "worklistView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				//	oTable.attachEventOnce("updateFinished", function(){
				// Restore original busy indicator delay for worklist's table
				//	oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				//	});

				//////////Get End point BP passed from CIC0
				try {
					sap.ui.getCore().bp = jQuery.sap.getUriParameters().mParams["sap-data-bp"][0];
				} catch (ab) {
					sap.ui.getCore().bp = "";
				}
				if(sap.ui.getCore().bp === "")
				{
				sap.ui.getCore().bp = "1000018097";
				}
          //Global Variables
				sap.ui.getCore().shipTo = null;
				sap.ui.getCore().media = null;
				sap.ui.getCore().multiMedia = [];
				//////Get all the required data in intialization and set JSON model, these funcion called multiple times when required
				this.getTableData();
				this.getClaimsReasons();
				this.getClaimsHistory();
				//this.getContracts();
				//this.getRealeaseOrders();
				//this.getSoldTo();
				//this.getShipTo();
				//this.getMedia();

				// Empty Json for selected entries in Media issue F4 Help
				this.oJsonData = new JSONModel([], true);
				this.getView().setModel(this.oJsonData, "sel");
			//Table personalization
				var oThis = this;
				// init and activate controller
				this._oTPC = new TablePersoController({
					table: oThis.getView().byId("table"),
					//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
					componentName: "demoApp",
					persoService: DemoPersoService

				});

			},

			onAfterRendering: function () {
             //set default BP
				//	this.getView().byId("Ibp").setSelectedKey(sap.ui.getCore().bp);
				//	this.getView().byId("soldtoInput").setPlaceholder(sap.ui.getCore().bp);
				this.getView().byId("soldtoInput").setValue(sap.ui.getCore().bp);
				//this.getView().byId("myProdTable")._getSelectAllCheckbox().setVisible(false);
				//var title = new sap.m.Label({text : "testchart",
				//	                           class : "chart"
				//});
				//  //title.addStyleClass("chart");

				//this.getView().byId("chartContainerdcc").setTitle(title.text);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished: function (oEvent) {
				// update the worklist's object counter after the table update
				//		var sTitle,
				//			oTable = oEvent.getSource(),
				//			iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				//		// the table is not empty
				//		if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				//			sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				//		} else {
				//			sTitle = this.getResourceBundle().getText("worklistTableTitle");
				//		}
				//		this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress: function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},

			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser history
			 * @public
			 */
			onNavBack: function () {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			},

			onSearch: function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("ContractNum", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh: function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject: function (oItem) {
				// this.getRouter().navTo("object", {
				// 	objectId: oItem.getBindingContext().getProperty("Auart")
				//});
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
			 * @private
			 */
			_applySearch: function (aTableSearchState) {
				//	var oTable = this.byId("table"),
				//		oViewModel = this.getModel("worklistView");
				///	oTable.getBinding("items").filter(aTableSearchState, "Application");
				//	// changes the noDataText of the list in case there are no filter results
				//	if (aTableSearchState.length !== 0) {
				//		oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				//	}
			},
			//////////////////////////////Custome Methods/////////////////////////////////////////////////
			//////////// Get Main Table data
			getTableData: function () {
				var that = this;
				//Screen freeze
				that.getView().setBusy(true);
				var oFilter = new sap.ui.model.Filter({
					filters: [],
					and: true
				});
				oFilter.aFilters.push(new Filter("Ismidentcode", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().multiMedia));
				var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
				var oDataModel = new ODATAModel(sUrl, {
					json: true,
					loadMetadataAsync: true
				});

				if (sap.ui.getCore().bp || sap.ui.getCore().shipTo || sap.ui.getCore().media !== null) {
					oDataModel.read("/ZREL_ORDERSet", {

						filters: [this.getInitialFilter(), oFilter],
						and: true,
						success: function (oData, response) {
							that.getView().setBusy(false);
							var oJSONModel = new sap.ui.model.json.JSONModel();
							oJSONModel.setData(oData);
							sap.ui.getCore().setModel(oJSONModel);
							this.getView().setModel(oJSONModel, "tp");
							if (sap.ui.getCore().count > 5) {
								//	that.getView().byId("refreshTab").setVisible(true);
								sap.m.MessageToast.show("Table has been Refreshed Successfully!");
								sap.ui.getCore().count = " ";
							}
						}.bind(this),
						error: function (oError) {
							that.getView().setBusy(false);
							sap.m.MessageToast.show("Error in Fetching Data");
						}
					});
				} else {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Select atleast one of the input filters");
					var nullData = [];
					this.getView().getModel("tp").setData(nullData);
				}
			},
			getInitialFilter: function () {
				return new Filter({
					filters: [
						new Filter("SoldTo", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp),
						new Filter("ShipTo", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().shipTo)
					],
					and: true
				});

			},
			//////////////get SoldTo drop down
			getSoldTo: function () {
				var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
				var oDataModel = new ODATAModel(sUrl, {
					json: true,
					loadMetadataAsync: true
				});
				oDataModel.read("/SOLDTOSet", {
					filters: [], //[filters],// 
					success: function (oData10, response) {

						var oJSONModel0 = new sap.ui.model.json.JSONModel();
						oJSONModel0.setData(oData10);
						oJSONModel0.setSizeLimit(2000);
						sap.ui.getCore().setModel(oJSONModel0);
						oJSONModel0.setProperty("/comboBoxValue", "");
						oJSONModel0.setProperty("/comboBoxKey", "");
						this.getView().setModel(oJSONModel0, "sold");
					}.bind(this),
					error: function (oError) {}
				});

			},
			//////////////get ShipTo drop down
			getShipTo: function () {
				var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
				var oDataModel = new ODATAModel(sUrl, {
					json: true,
					loadMetadataAsync: true
				});
				//	var objFilter6 = new sap.ui.model.Filter("Soldto", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp);
				oDataModel.read("/ZSHIPTOSet", {
					filters: [], //[filters],// 
					success: function (oData9, response) {

						var oJSONMode9 = new sap.ui.model.json.JSONModel();
						oJSONMode9.setData(oData9);
						oJSONMode9.setSizeLimit(1000);
						sap.ui.getCore().setModel(oJSONMode9);
						this.getView().setModel(oJSONMode9, "ship");
					}.bind(this),
					error: function (oError) {}
				});

			},
			////////Get data for Orders/Claims history Chart 1 set
			getClaimsHistory: function () {

				// var objFilter7 = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp);
				var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
				var oDataModel = new ODATAModel(sUrl, {
					json: true,
					loadMetadataAsync: true
				});
				oDataModel.read("/ZSROSet", {
					filters: [], //[filters],// 
					success: function (oData9, response) {

						var oJSONModel3 = new sap.ui.model.json.JSONModel();
						oJSONModel3.setData(oData9);
						sap.ui.getCore().setModel(oJSONModel3);
						this.getView().setModel(oJSONModel3, "Chart1");
					}.bind(this),
					error: function (oError) {}
				});
			},
			///////Get Claims set for order reasons history Chart2
			getClaimsReasons: function () {

				var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
				var oDataModel = new ODATAModel(sUrl, {
					json: true,
					loadMetadataAsync: true
				});
				var objFilter3 = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp);
				oDataModel.read("/ReasonsSet", {
					filters: [objFilter3],
					success: function (oData4, response) {
						var oJSONModel3 = new sap.ui.model.json.JSONModel();
						oJSONModel3.setData(oData4);
						sap.ui.getCore().setModel(oJSONModel3);
						this.getView().setModel(oJSONModel3, "Reason");
						//	sap.m.MessageToast.show("Data Read Successfully");
					}.bind(this),
					error: function (oError) {

						//	sap.m.MessageToast.show("Data Read error + oError.responseText");
					}
				});
			},

			///////Get Contracts
			// getContracts: function () {
			// 	var objFilter2 = new sap.ui.model.Filter("SoldTo", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp);
			// 	var objFilter3 = new sap.ui.model.Filter("ShipTo", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().shipto);
			// 	var objFilter4 = new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().type);
			//     var objFilter5 = new sap.ui.model.Filter("RelOrder", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().order);
			//     var objFilter6 = new sap.ui.model.Filter("Ismidentcode", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().media);
			// 	var oFilter = new sap.ui.model.Filter({
			// 		filters: [
			// 			objFilter2,
			// 			objFilter3,
			// 			objFilter4,
			// 			objFilter5,
			// 			objFilter6
			// 		],
			// 		and: true
			// 	});
			// 	var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
			// 	var oDataModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
			// 		json: true,
			// 		loadMetadataAsync: true
			// 	});

			// 	oDataModel.read("/ContractSet", {
			// 		filters: [oFilter], //[filters],// 
			// 		success: function (oData6, response) {

			// 			var oJSONModel5 = new sap.ui.model.json.JSONModel();
			// 			oJSONModel5.setData(oData6);
			// 			sap.ui.getCore().setModel(oJSONModel5);
			// 			this.getView().setModel(oJSONModel5, "con");
			// 		}.bind(this),
			// 		error: function (oError) {}
			// 	});
			// },

			///////Get Orders set for Release orders dropdown
			// getRealeaseOrders: function () {
			// 	var objFilter2 = new sap.ui.model.Filter("SoldTo", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp);
			// 	var objFilter3 = new sap.ui.model.Filter("ShipTo", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().shipto);
			//     var objFilter4 = new sap.ui.model.Filter("ContractNum", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().contract);
			// 	var objFilter5 = new sap.ui.model.Filter("Ismidentcode", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().media);
			// 	var oFilter = new sap.ui.model.Filter({
			// 		filters: [
			// 			objFilter2,
			// 			objFilter3,
			// 			objFilter4,
			// 			objFilter5
			// 		],
			// 		and: true
			// 	});
			// 	var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
			// 	var oDataModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
			// 		json: true,
			// 		loadMetadataAsync: true
			// 	});
			// 	oDataModel.read("/REL_OrderSet", {
			// 		filters: [oFilter], //[filters],// 
			// 		success: function (oData2, response) {

			// 			var oJSONModel2 = new sap.ui.model.json.JSONModel();
			// 			oJSONModel2.setData(oData2);
			// 			sap.ui.getCore().setModel(oJSONModel2);
			// 			this.getView().setModel(oJSONModel2, "Order");
			// 		}.bind(this),
			// 		error: function (oError) {}
			// 	});
			// },
			//get Claims for new Dialog
			getClaimDetails: function () {
				var objFilter1 = new sap.ui.model.Filter("RelOrder", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().relorder);
				var objFilter2 = new sap.ui.model.Filter("RelItem", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().relitem);
				var objFilter3 = new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().reltype);
				var oFilter = new sap.ui.model.Filter({
					filters: [
						objFilter1,
						objFilter2,
						objFilter3
					],
					and: true
				});
				var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
				var oDataModel = new ODATAModel(sUrl, {
					json: true,
					loadMetadataAsync: true
				});
				var that = this;
				oDataModel.read("/ZCLM_DETAILSSet", {
					filters: [oFilter],
					success: function (oData15, response) {
						var oJSONModel15 = new sap.ui.model.json.JSONModel();
						oJSONModel15.setData(oData15);
						sap.ui.getCore().setModel(oJSONModel15);
						that.getView().setModel(oJSONModel15, "claims");
					}.bind(that),
					error: function (oError) {
						//sap.m.MessageToast.show("Data Read error + oError.responseText");
					}
				});
			},
			//get Media Issues
			getMedia: function () {
				var sUrl = "/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/";
				var oDataModel = new ODATAModel(sUrl, {
					json: true,
					loadMetadataAsync: true
				});
				var objFilter1 = new sap.ui.model.Filter("Soldto", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp);
				var objFilter2 = new sap.ui.model.Filter("Shipto", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().shipTo);
				//var objFilter3 = new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().type);
				var objFilter4 = new sap.ui.model.Filter("Contract", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().contract);
				var objFilter5 = new sap.ui.model.Filter("RelOrder", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().order);
				var oFilter = new sap.ui.model.Filter({
					filters: [
						objFilter1,
						objFilter2,

						objFilter4,
						objFilter5
					],
					and: true
				});
				oDataModel.read("/ISMCodeSet", {
					filters: [oFilter],
					success: function (oData16, response) {
						var oJSONModel6 = new sap.ui.model.json.JSONModel();
						oJSONModel6.setData(oData16);
						sap.ui.getCore().setModel(oJSONModel6);
						this.getView().setModel(oJSONModel6, "media");
						//	sap.m.MessageToast.show("Data Read Successfully");
					}.bind(this),
					error: function (oError) {

						//	sap.m.MessageToast.show("Data Read error + oError.responseText");
					}
				});
			},
			////BP selected from Drop down
			bpSelected: function (oEvent) {

				// var selectedItem = this.getView().byId("Ibp").getSelectedItem();
				// sap.ui.getCore().bp = selectedItem ? selectedItem.getKey() : null;

				// if (sap.ui.getCore().bp || sap.ui.getCore().shipTo || sap.ui.getCore().media !== null) {

				// 	//Refresh Table	
				// 	this.getTableData();
				// 	//Refresh Release Orders
				// 	//	this.getRealeaseOrders();
				// 	//Refresh Claims Reasons
				// 	this.getClaimsReasons();
				// 	//Refresh Contracts
				// 	//	this.getContracts();
				// 	//Refresh Media
				// 	this.getMedia();
				// } else {
				// 	var data = [];
				// 	var oTable = this.getView().byId("table");
				// 	this.getView().getModel("tp").setData(data);
				// 	oTable.getModel("tp").refresh(true);
				// 	sap.m.MessageToast.show("Select atleast one of the input filters");
				// }
			},
			//Ship To Selected
			shipToSelected: function (oEvent) {

				// var selectedItem = this.getView().byId("IShip").getSelectedItem();
				// sap.ui.getCore().shipTo = selectedItem ? selectedItem.getKey() : null;
				// //var tablRef = this.getView().byId("table");
				// //if Order selected filter it, else selection removed , check BP slected or not
				// this.bpSelected();
			},
			//Type selected
			// typeSelected: function (oEvent) {
			// 	var selectedItem = this.getView().byId("OType").getSelectedItem();
			// 	sap.ui.getCore().Type = selectedItem ? selectedItem.getKey() : null;
			// 	this.shipToSelected();
			// },
			// //Contract selected
			// contractSelected: function (oEvent) {
			// 	var selectedItem = this.getView().byId("Con").getSelectedItem();
			// 	sap.ui.getCore().contract = selectedItem ? selectedItem.getKey() : null;
			// 	this.typeSelected();
			// },
			//Release Orders Selected
			// orderSelected: function (oEvent) {
			// 	var selectedItem = this.getView().byId("Iorder").getSelectedItem();
			// 	sap.ui.getCore().order = selectedItem ? selectedItem.getKey() : null;
			//var tablRef = this.getView().byId("table");
			//if Order selected filter it, else selection removed , check BP slected or not
			// if (sap.ui.getCore().order) {
			// 	var objFilter1 = new sap.ui.model.Filter("SoldTo", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().bp);
			// 	var objFfilter2 = new sap.ui.model.Filter("RelOrder", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().order);
			// 	var tableitemsbinding = tablRef.getBinding("rows");
			// 	tableitemsbinding.filter([objFilter1, objFfilter2]);
			// } else {
			// 	this.typeSelected();
			// }

			//this.contractSelected();
			// },
			//media Issue selected
			mediaSelected: function (oEvent) {

				// var selectedItem = this.getView().byId("Missue").getSelectedItem();
				// sap.ui.getCore().media = selectedItem ? selectedItem.getKey() : null;
				// this.shipToSelected();
				//var tablRef = this.getView().byId("table");
				// if (sap.ui.getCore().media) {
				// 	var objFilter1 = new sap.ui.model.Filter("SoldTo", sap.ui.model.FilterOperator.GE, sap.ui.getCore().bp);
				// 	var objFfilter2 = new sap.ui.model.Filter("RelOrder", sap.ui.model.FilterOperator.LE, sap.ui.getCore().order);
				// 	var objFfilter3 = new sap.ui.model.Filter("Ismidentcode", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().media);
				// 	var tableitemsbinding = tablRef.getBinding("rows");
				// 	tableitemsbinding.filter([objFilter1, objFfilter2, objFfilter3]);
				// } else {
				// 	this.orderSelected();
				// }
				//this.orderSelected();
			},
			//Search
			onMainSearch: function (oEvent) {

				var value = oEvent.getParameter("query");
				value.toUpperCase();
				var oFilter = new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.Contains, value);
				var oFilter2 = new sap.ui.model.Filter("RelOrder", sap.ui.model.FilterOperator.Contains, value);
				var oFilter3 = new sap.ui.model.Filter("RelItem", sap.ui.model.FilterOperator.Contains, value);
				var oFilter4 = new sap.ui.model.Filter("SoldToName", sap.ui.model.FilterOperator.Contains, value);
				var oFilter11 = new sap.ui.model.Filter("Ismidentcode", sap.ui.model.FilterOperator.Contains, value);
				var oFilter12 = new sap.ui.model.Filter("ContractNum", sap.ui.model.FilterOperator.Contains, value);
				var oFilter13 = new sap.ui.model.Filter("ContractItem", sap.ui.model.FilterOperator.Contains, value);
				var oFilter5 = new sap.ui.model.Filter("SoldTo", sap.ui.model.FilterOperator.Contains, value);
				var oFilter6 = new sap.ui.model.Filter("PurRequisition", sap.ui.model.FilterOperator.Contains, value);
				var oFilter7 = new sap.ui.model.Filter("ShipToName", sap.ui.model.FilterOperator.Contains, value);
				var oFilter8 = new sap.ui.model.Filter("ShipTo", sap.ui.model.FilterOperator.Contains, value);
				var oFilter9 = new sap.ui.model.Filter("PurOrderDes", sap.ui.model.FilterOperator.Contains, value);
				var oFilter10 = new sap.ui.model.Filter("PurOrder", sap.ui.model.FilterOperator.Contains, value);
				var oFilter14 = new sap.ui.model.Filter("NewClaim", sap.ui.model.FilterOperator.Contains, value);
				var oFilter15 = new sap.ui.model.Filter("RecClaim", sap.ui.model.FilterOperator.Contains, value);
				var oFilter16 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, value);
				var oTable = this.getView().byId("table");

				var oTableItems = oTable.getBinding("rows");

				var orFilter = new sap.ui.model.Filter({
					filters: [oFilter, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7, oFilter8, oFilter9, oFilter10,
						oFilter11, oFilter12, oFilter13, oFilter14, oFilter15, oFilter16
					],
					and: false
				});
				var aFilter = [orFilter];
				oTableItems.filter(aFilter);
			},
			////////////////////////////////////////Process Orders
			//Pop up
			draggableDialog: null,
			processEH: function (oEvent) {
				var sMsg;
			
				//validate selection
				var oTable = this.getView().byId("table");
				var iIndex = oTable.getSelectedIndex();

				if (iIndex < 0) {
					sMsg = "Please Select Items To be Processed";
					sap.m.MessageBox.warning(sMsg);
				} else {
					//sMsg = oTable.getContextByIndex(iIndex);
				}

				//Create PopUp for order reasons
				if (!this.draggableDialog) {
					this.draggableDialog = new Dialog({
						title: "Enter Order Reason",
						contentWidth: "200px",
						contentHeight: "30px",
						draggable: true,
						content: [
							new sap.m.Label({
								text: "Order Reason",
								textDirection: "RTL",
								design: "Bold"
							}),
							new sap.m.Input({
								width: "100px",
								fieldWidth: "10px",
								id: "IReasn",
								showValueHelp: true,
								valueHelpRequest: [this.onF4, this]
							})
						],
						beginButton: new Button({
							type: "Emphasized",
							text: "OK",
							press: function () {
								//Create Claim 
								this.createClaim();
								this.draggableDialog.close();
							}.bind(this)
						}),
						endButton: new Button({
							text: "Close",
							press: function () {

								this.draggableDialog.close();
							}.bind(this)
						})
					});
					//to get access to the global model
					this.getView().addDependent(this.draggableDialog);
				}
				if (!sMsg) {
					this.draggableDialog.open();
				}
			},
			//Select diallog from Fragment and bind Order reasons in popup
			inputId: "",
			fragmento: null,
			onF4: function (oEvent) {
				this.inputId = oEvent.getSource().getId();
				if (this.fragmento === null) {
					this.fragmento = new sap.ui.xmlfragment("zqtc.ZQTC_CLAIMS.view.fragmentExcl", this);
					this.fragmento.bindAggregation("items", {
						path: "/ODR_REASONSet",
						parameters: {
							operationMode: "Client"
						},
						template: new sap.m.DisplayListItem({
							label: "{Augru}",
							value: "{Bezei}"
						})
					});

					this.getView().addDependent(this.fragmento);
				}
				this.fragmento.open();
			},
			//Aftre clicking Ok on popup
			handleTableValueHelpConfirm: function (oEvent) {

				var selectedItem = oEvent.getParameter("selectedItem");

				var Value = selectedItem.getLabel();

				sap.ui.getCore().byId(this.inputId).setValue(Value);
			},
			//Search on Popup Order reasons
			onSearchReasonf4: function (oEvent) {
				var oBinding = oEvent.getParameter("itemsBinding");
				var sValue = oEvent.getParameter("value");
				if (!sValue) {
					oBinding.filter([]);
				} else {

					var oFilter1 = new sap.ui.model.Filter("Augru", FilterOperator.Contains, sValue);
				
					oBinding.filter([oFilter1]);
				}

			},
			//Call backend create method
			createClaim: function () {

				var tableo = this.getView().byId("table");
				//Different logic to get selected items for sap.ui.table
				var modelo = tableo.getModel("tp");
				var modelData = modelo.getData();
				var items = tableo.getSelectedIndices();
				sap.ui.getCore().count = items.length;
				var itemData = [];
				var order;
				var item;
				var type;
				var OrderReasnRef = sap.ui.getCore().byId("IReasn");

				var OrderReasn = OrderReasnRef ? OrderReasnRef.getValue() : null;
				//get items records one by one from Table using For Loop
				if (!OrderReasn) {
					sap.m.MessageBox.warning("Please select Order Reason");
					this.onF4();
				}
				for (var iRowIndex = 0; iRowIndex < items.length; iRowIndex++) {

					//var  itemrow  	=   items[iRowIndex].getBindingContext();

					//var itemrow = modelData.results[items[iRowIndex]];
                   	var itemrow = this.getView().byId("table").getContextByIndex(items[iRowIndex]).getObject();
					///Pass header info to deep entity
					order = itemrow.RelOrder;
					item = itemrow.RelItem;
					type = itemrow.Auart;
					////Item data
					itemData.push({
						Vbeln: order,
						Posnr: item,
						Augru: OrderReasn
					});
				}
				//THAT = THIS
				var that = this;
				//Screen freeze
				that.getView().setBusy(true);
				var DataObject = {};
				DataObject.Vbeln = order;
				//Navigational proprty
				DataObject.NP_VBELN = itemData;

				var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZQTC_REL_ORDER_SERVICE_SRV/");
				//Call create Deep entity

				odatamodelobject.create("/CLAIMHEADSet", DataObject, {
					success: function (oData, oResp) {
						//	sap.m.MessageBox.success("Claim Order" + " " + oData.Message + " " + "Created Successfully");
						sap.m.MessageBox.success(oData.Message);
						that.getView().setBusy(false);
						if (sap.ui.getCore().count > 5) {
							that.getView().byId("refreshTab").setVisible(true);
							//sap.m.MessageToast.show("Table gets Refreshed when Job is complete!!");
						} else {
							//Refresh all App Data			
							that.getTableData();
							that.getClaimsHistory();
							that.getClaimsReasons();
							that.getView().byId("searchField").setValue("");
						}

					},
					error: function (oData, oResp) {

						sap.m.MessageBox.error("Error in Claim Order Creation");

						that.getView().setBusy(false);
					}

				});

			},

			handleLoadItems: function (oControlEvent) {

				//	oControlEvent.getSource().getBinding("items").resume();
			},

			////////////////////////////Claims Details Dialog
			fragment2: null,
			handleClaims: function (oEvent) {

				sap.ui.getCore().relorder = this.getView().getModel("tp").getProperty("RelOrder", oEvent.getSource().getBindingContext("tp"));
				sap.ui.getCore().relitem = this.getView().getModel("tp").getProperty("RelItem", oEvent.getSource().getBindingContext("tp"));
				sap.ui.getCore().reltype = this.getView().getModel("tp").getProperty("Auart", oEvent.getSource().getBindingContext("tp"));

				this.getClaimDetails();
				if (this.fragment2 === null) {
					this.fragment2 = new sap.ui.xmlfragment("zqtc.ZQTC_CLAIMS.view.fragmentClaims", this);
					this.getView().addDependent(this.fragment2);
				}
				this.fragment2.setTitle("Claim Orders For" + " " + sap.ui.getCore().relorder);
				//this.fragment2.addStyleClass("styleclass1");
				this.fragment2.open();
			},
			claimConfirm: function () {
				this.fragment2.close();
			},
			////////////////////Table personalization
			onPersoButtonPressed: function (oEvent) {

				this._oTPC.openDialog();
			},

			//////////////////////////////	Excel download
			downloadExcel: function () {

				var oTable = this.getView().byId("table");
				var aColumns = oTable.getColumns();
				var aTemplate = [];
				for (var i = 0; i < aColumns.length; i++) {
					var oColumn = {
						name: aColumns[i].getLabel().getText(),
						template: {
							content: {
								//	path: "/columns" + "/" + i
								path: aColumns[i].getProperty("filterProperty")
							}
						}
					};
					aTemplate.push(oColumn);
				}
				//var oModel = oTable.getModel();
				var oModel = this.getView().getModel("tp");
				var oExport = new Export({

					exportType: new ExportType({
						mimeType: "application/vnd.ms-excel",
						fileExtension: "xls",
						separatorChar: "\t",
						charset: "utf-8"
					}),

					models: oModel,

					rows: {
						path: "/results"
					},
					columns: aTemplate

				});
				oExport.saveFile().catch(function (oError) {

					sap.m.MessageBox.error("error");
				}).then(function () {
					oExport.destroy();
				});
			},
			///////////////Sort, Grouping and Filtering Reset
			resetSort: function () {
				var oTable = this.getView().byId("table");
				oTable.setEnableGrouping(false);
				//oTable.getColumns()[0].setGrouped(false);
				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					aColumns[i].setSorted(false);
					aColumns[i].setGrouped(false);
					aColumns[i].setFiltered(false);
				}
				var oListBinding = oTable.getBinding();
				oListBinding.aSorters = null;
				oListBinding.aFilters = null;
				oTable.getModel("tp").refresh(true);
				oTable.setEnableGrouping(true);
			},
			////////////////////Refresh Table
			Refresh: function () {
				this.getView().byId("refreshTab").setVisible(false);
				//	if (sap.ui.getCore().bp || sap.ui.getCore().shipTo || sap.ui.getCore().media !== null) {
				//Refresh all App Data			
				this.getTableData();
				this.getClaimsHistory();
				this.getClaimsReasons();
				this.getView().byId("searchField").setValue("");
				sap.m.MessageBox.information("Table will be Refreshed after Job is complete!!");
				// } else {
				// 	sap.m.MessageToast.show("Select atleast one of the input filters");
				// 	var nullData = [];
				// 	this.getView().getModel("tp").setData(nullData);
				// }

			},
			/////////////// Pop Up for Media Issues
			inputMedia: "",
			fragmentMedia: null,
			onProductHelpRequest: function (oEvent) {

				this.inputMedia = oEvent.getSource().getId();
				if (this.fragmentMedia === null) {
					this.fragmentMedia = new sap.ui.xmlfragment("zqtc.ZQTC_CLAIMS.view.fragmentMedia", this);

					this.fragmentMedia.setTitle("Media Issue Value Help");
					this.getView().addDependent(this.fragmentMedia);
				}
				//			var aToken = this.getView().byId("productInput").getTokens();

				this.fragmentMedia.open();
			},
			//Aftre clicking Ok on popup
			handleHelpMediaConfirm: function (oEvent) {

				var selectedItem = oEvent.getParameter("selectedItem");

				var Value = selectedItem.getLabel();

				sap.ui.getCore().byId(this.inputMedia).setValue(Value);
				sap.ui.getCore().media = Value ? Value : null;
				//	this.shipToSelected();
			},

			//Change tokens in Media Multi Input
			mediaChange: function (oEvent) {
				var value = oEvent.getParameter("type");
				if (value === "removed") {
				//remove from selection in value help	
						var text = oEvent.getParameter("token").getText();
                         this.getView().getModel("sel").getData().pop({
						"Ismidentcode": text});
				         this.getView().getModel("sel").updateBindings(true);
				         
					var aFilter = [];

					var aToken = this.getView().byId("productInput").getTokens();
					//if table has any any selected items capture it else clear
					if (aToken.length > 0) {
						for (var i = 0; i < aToken.length; i++) {

							var selectedItem = aToken[i].getProperty("text");
							// var defToken = new sap.m.Token({
							// 	text: selectedItem
							// });
					
				         
							aFilter.push(selectedItem);
						}
						sap.ui.getCore().multiMedia = aFilter;
					} else {
						sap.ui.getCore().multiMedia = [];
						sap.ui.getCore().media = null;
					}
				
					this.getTableData();
				}
			},

	//Serch Media issues on F4 Media issue

			searchEH: function (oEvent) {

				//if table has any any selected items capture it else clear

				var value = oEvent.getParameter("query");
				//value.toUpperCase();
				var oFilter = new sap.ui.model.Filter("Ismidentcode", sap.ui.model.FilterOperator.EQ, value);
				var oTable = sap.ui.getCore().byId("myProdTable");
				//      	var selectedItems = oTable.getSelectedItems();

				//var oTable = this.fragmentMedia.getContent()[1];
				var oTableItems = oTable.getBinding("items");

				oTableItems.filter(oFilter);
				oTable.removeSelections(true);

				// 	if (selectedItems.length > 0) {
				// 	oTable.setSelectedItems(selectedItems);
				// }

				// oTable.SelectAll(false);
			},
		// Accept Button Media issue F4
			acceptProd: function (oEvent) {

				var aFilter = [];
				//	var oTable = sap.ui.getCore().byId("myProdTable");
				var oTable = sap.ui.getCore().byId("mySelProdTable");
				//	var oTable = this.fragmentMedia.getContent()[1];
				//var selectedItems = oTable.getSelectedItems();
				var selectedItems = oTable.getItems();
				//if table has any any selected items capture it else clear
				if (selectedItems.length > 0) {
					var aToken = this.getView().byId("productInput").getTokens();
					this.getView().byId("productInput").destroyTokens([aToken]);
					for (var i = 0; i < selectedItems.length; i++) {

						var selectedItem = selectedItems[i].getBindingContext("sel").getProperty("Ismidentcode");
						var defToken = new sap.m.Token({
							text: selectedItem
						});

						this.getView().byId("productInput").addToken(defToken);
						sap.ui.getCore().media = selectedItem;
						aFilter.push(selectedItem);
					}
					sap.ui.getCore().multiMedia = aFilter;
                  sap.ui.getCore().byId("myProdTable").removeSelections(true);
				} else {
					aToken = this.getView().byId("productInput").getTokens();
					this.getView().byId("productInput").destroyTokens([aToken]);
					sap.ui.getCore().media = null;
					sap.ui.getCore().multiMedia = [];
				}
                
				this.fragmentMedia.close();

				this.getTableData();
			},
      //Cancel Button on Media issue F4
			cancelProd: function () {

				this.fragmentMedia.close();

			},
	//Clear all selections Media issues
			clearProd: function () {
				var oTable = sap.ui.getCore().byId("myProdTable");
				//var oTable = this.fragmentMedia.getContent()[1];
				var selectedItems = oTable.getSelectedItems();

				if (selectedItems.length > 0) {
					oTable.removeSelections(true);
					var aToken = this.getView().byId("productInput").getTokens();
					this.getView().byId("productInput").destroyTokens([aToken]);
					sap.ui.getCore().multiMedia = [];
				}
				//remove selections also
				this.getView().getModel("sel").setData([]);
				//var searchValue = sap.ui.core.Fragment.byId("mediaDialog", "mySearch").getValue();
				var searchField = sap.ui.getCore().byId("mySearch");
				searchField.setValue(null);
			},
		//Medis issue rows selections	
			rowSelectionMedia: function (oEvent) {
				// User selected all rows
				//	var oTable = sap.ui.getCore().byId("mySelProdTable").setModel("sel");
				if ((oEvent.getParameter("listItems").length > 1) && oEvent.getParameter("selected") === true) {
					for (var i = 0; i < oEvent.getParameter("listItems").length; i++) {
						var selectedItem2 = oEvent.getParameter("listItems")[i].getBindingContext().getProperty("Ismidentcode");
						this.getView().getModel("sel").getData().push({
							"Ismidentcode": selectedItem2
						});
						this.getView().getModel("sel").updateBindings(true);
					}
				}
				//Slected only single row
				else {
					var selectedItem = oEvent.getParameter("listItem").getBindingContext().getProperty("Ismidentcode");
					if (oEvent.getParameter("listItem").getProperty("selected") === true) {
						this.getView().getModel("sel").getData().push({
							"Ismidentcode": selectedItem
						});
						this.getView().getModel("sel").updateBindings(true);
						//deselected single row
					} else {
						this.getView().getModel("sel").getData().pop({
							"Ismidentcode": selectedItem
						});
						this.getView().getModel("sel").updateBindings(true);
					}
				}
				//User deselected allrows
				if ((oEvent.getParameter("listItems").length > 1) && oEvent.getParameter("selected") === false) {
					this.getView().getModel("sel").setData([]);
				}
				//sap.ui.getCore().byId("mySelProdTable").insertItem(selectedItem.clone(selectedItem.getId(),Math.random()));
			},
			//delete selected media issue from selected table
			deleteSelectionMedia: function (oEvent) {
				var selectedItem = oEvent.getParameter("listItem");
				var oTable = sap.ui.getCore().byId("mySelProdTable");
				//var oTable = this.fragmentMedia.getContent()[1];
				oTable.removeItem(selectedItem);
			},
			//////////////////////////////SoldTo Value help
			inputSold: "",
			fragmentSold: null,
			onSoldHelpRequest: function (oEvent) {

				this.inputSold = oEvent.getSource().getId();
				if (this.fragmentSold === null) {
					this.fragmentSold = new sap.ui.xmlfragment("zqtc.ZQTC_CLAIMS.view.fragmentSoldto", this);
					this.fragmentSold.setTitle("SoldTo Value Help");
					this.getView().addDependent(this.fragmentSold);
				}
				this.fragmentSold.open();
			},
            //Search soldTo on soldTo value help
			searchEHSold: function (oEvent) {

				var value = oEvent.getParameter("query");
				//value.toUpperCase();
				var oFilter = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.EQ, value);

				var oTable = sap.ui.getCore().byId("mySoldTable");
				//var oTable = this.fragmentSold.getContent()[1];
				var oTableItems = oTable.getBinding("items");

				oTableItems.filter(oFilter);

			},
			//Select SoldTo on soldTo F4 help
			soldToSelect: function (oEvent) {
				var value = oEvent.getParameter("listItem").getBindingContext().getProperty("Kunnr");
				this.selectedItemSold = value;
				this.getView().byId("soldtoInput").setValue(value);
				sap.ui.getCore().bp = value;
				this.getTableData();
				this.fragmentSold.close();
			//	this.getClaimsHistory();
				this.getClaimsReasons();
			},
			//Change soldto from input 
			soldToChange: function (oEvent) {
              
				var Value = oEvent.getParameter("value");
				sap.ui.getCore().bp = Value ? Value : null;
				if (sap.ui.getCore().bp === null) {
					this.getTableData();
					//this.getClaimsHistory();
					this.getClaimsReasons();
				}
				if(Value.length === 10){
						this.getTableData();
						this.getClaimsReasons();
				}
				if(this.selectedItemSold){
				sap.ui.getCore().byId("mySoldTable").removeSelections(true);
				}
			},
           //cancel sold To popup
			cancelSold: function () {

				this.fragmentSold.close();

			},
	// To give suggetions for Sold To
			onSuggest: function (oEvent) {
				var sTerm = oEvent.getParameter("suggestValue");
				var aFilters = [];
				if (sTerm) {
					aFilters.push(new Filter("Name1", FilterOperator.StartsWith, sTerm));
				}

				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
				// if (sTerm.length === 1) {
				// 	sap.ui.getCore().bp = null;
				// 	this.getTableData();
				// }
			},
         //Selected Item from suggested Items SoldTo
			onSuggestionSoldTo: function (oEvent) {

				var selectedItem = oEvent.getParameter("selectedItem");
				sap.ui.getCore().bp = selectedItem.getKey();
				this.getTableData();
				this.getClaimsReasons();
			},
			/////////////////////Shipto Value help

			inputShip: "",
			fragmentShip: null,
			onShipHelpRequest: function (oEvent) {

				this.inputSold = oEvent.getSource().getId();
				if (this.fragmentShip === null) {
					this.fragmentShip = new sap.ui.xmlfragment("zqtc.ZQTC_CLAIMS.view.fragmentShipto", this);
					this.fragmentShip.setTitle("ShipTo Value Help");
					this.getView().addDependent(this.fragmentShip);
				}
				this.fragmentShip.open();
			},
         ///Search on Shipto Popup
			searchEHShip: function (oEvent) {

				var value = oEvent.getParameter("query");
				//value.toUpperCase();
				var oFilter = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.EQ, value);

				var oTable = sap.ui.getCore().byId("myShipTable");
				//var oTable = this.fragmentShip.getContent()[1];
				var oTableItems = oTable.getBinding("items");

				oTableItems.filter(oFilter);

			},
		///Selected Item from ShipTo
			shipToSelect: function (oEvent) {
     
				var value = oEvent.getParameter("listItem").getBindingContext().getProperty("Shipto");
				this.selectedItemShip = value;
				this.getView().byId("shiptoInput").setValue(value);
				sap.ui.getCore().shipTo = value;
				this.fragmentShip.close();
				this.getTableData();
				//	this.getClaimsHistory();
				//	this.getClaimsReasons();
			},
		//Changed Item from Shipto Input
			shipToChange: function (oEvent) {

				var Value = oEvent.getParameter("value");
				sap.ui.getCore().shipTo = Value ? Value : null;
				if (sap.ui.getCore().shipTo === null) {
					this.getTableData();
				}
				//		this.getClaimsHistory();
				//		this.getClaimsReasons();
				if(Value.length === 10){
					this.getTableData();	
				}
				if(this.selectedItemShip){
				sap.ui.getCore().byId("myShipTable").removeSelections(true);
				}
			},
         //Cancel shipTo
			cancelShip: function () {

				this.fragmentShip.close();

			},
		//Suggestion Shipto	
			onSuggestShip: function (oEvent) {
				var sTerm = oEvent.getParameter("suggestValue");
				var aFilters = [];
				if (sTerm) {
					aFilters.push(new Filter("Name1", FilterOperator.StartsWith, sTerm));
				}

				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
				// if (sTerm.length === 1) {
				// 	sap.ui.getCore().shipTo = null;
				// 	this.getTableData();
				// }
			},
        //ShipTo selected from Suggestions ShipTo
			onSuggestionShipTo: function (oEvent) {

				var selectedItem = oEvent.getParameter("selectedItem");
				sap.ui.getCore().shipTo = selectedItem.getKey();
				this.getTableData();
			},
			///////////////////////////////////////////Main filter on Table/////////////////////////////////////
			filterTable: function () {
				this.getTableData();
			},

			colorFormatter: function (value) {

				return (value === "Complete") ? "Success" : "Error";

			}

		});
	});