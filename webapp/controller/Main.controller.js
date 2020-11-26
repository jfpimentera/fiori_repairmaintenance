sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/Filter", 
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function(Controller, ChartFormatter, Format, NumberFormat, Filter, FilterOperator, JSONModel) {
	"use strict";

	return Controller.extend("ZUI_PM_RM_COST_MONITORING.controller.Main", {

		onInit: function() {

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy"
			});
			var dateFormatted = dateFormat.format(new Date());
			var oInitModel = new sap.ui.model.json.JSONModel();
			oInitModel.setData({
				currDate: dateFormatted
			});
			
			var fiscalYear = this.getView().byId("FiscalYear");
			fiscalYear.setModel(oInitModel);
			
			
			// var datePicker = this.getView().byId("ReportDatePicker");
			// datePicker.setModel(oInitModel);
			// var datePickerDetails = this.getView().byId("ReportDatePickerDetails");
			// datePickerDetails.setModel(oInitModel);

			var currentDate = new Date();
			var dd = String(currentDate.getDate()).padStart(2, "0");
			var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
			var yyyy = currentDate.getFullYear();


			var periodTo = this.getView().byId("periodToComboBox");
			periodTo.setSelectedKey(mm);


			var initialDate = yyyy + mm + dd;
			var startDate = yyyy + "01" + "01";


			// sap.m.MessageBox.success(dateFormatted, {
			//     title: "Success",                                    // default
			//     onClose: null,                                       // default
			//     styleClass: "",                                      // default
			//     initialFocus: null,                                  // default
			//     textDirection: sap.ui.core.TextDirection.Inherit     // default
			// });
			

			// this.setDataTable("1", "1", yyyy);
			this.setDataTable("1", 	periodTo.getSelectedKey(), yyyy);
			// this.setModel("smartTableDetails", "/ZCDS_PM_RMCM_DETAIL_ITEM", "itemDetail");

			this.getView().addStyleClass(this.getContentDensityClass());

		},


		onDataReceived: function() {
			var oTable = this.byId("smartTableDetails");
			var i = 0;
			oTable.getTable().getColumns().forEach(function(oLine) {
				oLine.setWidth("100%");
				oLine.getParent().autoResizeColumn(i);
				i++;
			});
		},

		setDataTable: function(periodFrom, periodTo, curryear) {
			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "')/Results";
			// ,P_Year='" + curryear + "'
			// var path = "/ZCDS_PM_RMCM_DETAIL_ITEM";

			var oSmartTableProjects = this.getView().byId("smartTableDetails");
			oSmartTableProjects.setTableBindingPath(path);
		},
		
		
		setModel: function(pComponent, pPath, pModelName) {

			this.showBusyIndicator(4000);

			var oComponent = this.getView().byId(pComponent);
			var oJSONModel = new sap.ui.model.json.JSONModel();
			this._oModel.read(pPath, {
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					oComponent.setModel(oJSONModel, pModelName);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(err) {}
			});
		}, 
		
		onSearchDetails: function() {
			var periodFrom = this.getView().byId("periodFromComboBox");
			var periodTo = this.getView().byId("periodToComboBox");
			// var fiscalYear = this.getView().byId("FiscalYear").getValue();
			
			this.setDataTable(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), "2020");

			var oSmartTableProjectsDetails = this.getView().byId("smartTableDetails");
			oSmartTableProjectsDetails.rebindTable();
		},

		
		

		getContentDensityClass: function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		toTitleCase: function(str) {
			return str.replace(
				/\w\S*/g,
				function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				}
			);
		},

		showBusyIndicator: function(iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);
		}


	});
});