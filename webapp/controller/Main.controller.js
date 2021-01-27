sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/Filter",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, ChartFormatter, Format, NumberFormat, Filter, DateFormat, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ZUI_PM_RM_COST_MONITORING.controller.Main", {

		onInit: function() {
			Format.numericFormatter(ChartFormatter.getInstance());
			this._formatPattern = ChartFormatter.DefaultPattern;

			this.setFields();
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

			var currentDate = new Date();
			var mm = String(currentDate.getMonth() + 1).padStart(2, "0");

			var periodTo = this.getView().byId("periodToComboBox");
			periodTo.setSelectedKey(mm);

			var periodToN = ((periodTo.getSelectedKey() === 12) ? 99 : periodTo.getSelectedKey());

			// topPM.setVisible((oData.results.length >= 1) ? true : false);
			this.setDataTable("1", periodToN, dateFormatted);

			this.setTotals("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters()); //Totals
			this.setTotalsOT("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters()); //Totals

			// CHARTS
			this.setRM1ChartDataPieL("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM1ChartDataPieR("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM1ChartDataStack("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM2ChartData("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM2ChartData2("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM3ChartData("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM3ChartData2("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			
			this.setSegmentCompMonthly("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setSegmentComp("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());

			this.setTop1ChartData("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setTop2ChartData("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setTop3ChartData("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());

			this.setTop4ChartData("1", periodToN, dateFormatted, this.getView().byId("smartFilterBar").getFilters());

			// CHARTS FORMAT
			this.setRM1ChartFormatPie1();
			this.setRM1ChartFormatPie2();
			this.setRM1ChartFormatStack();
			
			this.setRM2ChartFormat();
			this.setRM2ChartFormat2();
			
			this.setRM3ChartFormat();
			this.setRM3ChartFormat2();

			this.setTop1ChartFormat();
			this.setTop2ChartFormat();
			this.setTop3ChartFormat();

			this.setTop4ChartFormat();

			this.getView().addStyleClass(this.getContentDensityClass());
		},

		onNavFIDocNo: function(oEvent) {
			// var oContext = null;
			// var oSource = oEvent.getSource();
			// oContext = oSource.getBindingContext();
			
			var oContext = oEvent.getSource().getBindingContext();
			var companyCode = oContext.getProperty("CompanyCode");
			var fiscalYear = oContext.getProperty("FiscalYear");
			var fiDocNo = oContext.getProperty("FIDocNo");
			
			var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
				"CrossApplicationNavigation");
			var href = (xnavservice && xnavservice.hrefForExternal({
				target: {
					// semanticObject: "FixedAsset",
					// action: "displayWorklist"
					
					semanticObject: "ZSO_FB03",
					action: "display"
				},
				params: {
					"RF05L-BUKRS": companyCode,
					"RF05L-BELNR": fiDocNo,
					"RF05L-GJAHR": fiscalYear
				}
			})) || "";
			
			var finalUrl = window.location.href.split("#")[0] + href;
			sap.m.URLHelper.redirect(finalUrl, true);

		},
		
		onNavOrderNo: function(oEvent) {
			// var oContext = null;
			// var oSource = oEvent.getSource();
			// oContext = oSource.getBindingContext();
			
			var oContext = oEvent.getSource().getBindingContext();
			var orderNo = oContext.getProperty("OrderNo");
			
			var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
				"CrossApplicationNavigation");
			var href = (xnavservice && xnavservice.hrefForExternal({
				target: {
					// semanticObject: "FixedAsset",
					// action: "displayWorklist"
					
					semanticObject: "ZSO_IW33",
					action: "display"
				},
				params: {
					"CAUFVD-AUFNR": orderNo
				}
			})) || "";
			
			var finalUrl = window.location.href.split("#")[0] + href;
			sap.m.URLHelper.redirect(finalUrl, true);

		},


		setTotals: function(periodFrom, periodTo, curryear, filterBar) {
			// this.showBusyIndicator(4000);
			var keyDate = curryear + "0101";

			var oModelTotals = this.getOwnerComponent().getModel("itemDetail_Totals");
			var oJSONModel = new sap.ui.model.json.JSONModel();
			var overallDonutChart = this.getView().byId("RMTile");

			var aFilters = filterBar;
			var pathTotals = "/ZCDS_PM_RMCM_TOTALS(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";

			oModelTotals.read(pathTotals, {
				urlParameters: {
					"$select": "Currency,FiscalYear,Amount"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "totalsModel");
					// MessageToast.show("SUCCESS");
				},
				error: function(err) {
					// MessageToast.show("ERROR");
				}
			});
		},

		setTotalsOT: function(periodFrom, periodTo, curryear, filterBar) {
			// this.showBusyIndicator(4000);
			var keyDate = curryear + "0101";

			var oModelTotalsOT = this.getOwnerComponent().getModel("itemDetail_TotalsPM");
			var oJSONModel = new sap.ui.model.json.JSONModel();
			var overallOrderType = this.getView().byId("PMTile");

			var aFilters = filterBar;

			var pathTotalsOT = "/ZCDS_PM_RMCM_TOTALS_PM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";

			oModelTotalsOT.read(pathTotalsOT, {
				urlParameters: {
					"$select": "FiscalYear,Amount,Currency"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallOrderType.setModel(oJSONModel, "totalsOTModel");
					// MessageToast.show("SUCCESS");
				},
				error: function(err) {
					// MessageToast.show("ERROR");
				}
			});

		},

		setColorAss: function() {
			var caeText = this.getView().byId("assText").getProperty("text");
			var n = caeText.includes("-");
			if (n) {
				this.getView().byId("assText").removeStyleClass("totalsText");
				this.getView().byId("assText").addStyleClass("totalsTextN");
			} else {
				this.getView().byId("assText").removeStyleClass("totalsTextN");
				this.getView().byId("assText").addStyleClass("totalsText");
			}

			var caeText2 = this.getView().byId("assText2").getProperty("text");
			var n2 = caeText2.includes("-");
			if (n2) {
				this.getView().byId("assText2").removeStyleClass("totalsText");
				this.getView().byId("assText2").addStyleClass("totalsTextN");
			} else {
				this.getView().byId("assText2").removeStyleClass("totalsTextN");
				this.getView().byId("assText2").addStyleClass("totalsText");
			}
		},
		
		onDataReceived: function() {
			var topPM1 = this.getView().byId("TOPOrderType");
			var topPM2 = this.getView().byId("TOPFuncLoc");
			var topPM3 = this.getView().byId("TOPEquipment");

			var res = topPM1.getVisible().toString().concat(topPM2.getVisible().toString(), topPM3.getVisible().toString());

			// MessageToast.show(res);

			if (res === "falsefalsefalse") {
				topPM1.setVisible(false);
				topPM2.setVisible(false);
				topPM3.setVisible(false);
			} else {
				topPM1.setVisible(true);
				topPM2.setVisible(true);
				topPM3.setVisible(true);
			}
		},

		setDataTable: function(periodFrom, periodTo, curryear) {

			var keyDate = curryear + "0101";

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";

			var oSmartTableProjects = this.getView().byId("smartTableDetails");
			oSmartTableProjects.setTableBindingPath(path);

		},

		setTop1ChartData: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail_OrderType");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("TOPOrderTypeFrame");

			var topPM = this.getView().byId("TOPOrderType");

			var path = "/ZCDS_PM_RMCM_ORDERTYPE(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "OrderType,OrderTypeName,FiscalYear,Amount",
					"$orderby": "OrderType asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "TOPOrderTypeModel");

					topPM.setVisible((oData.results.length >= 1) ? true : false);
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},

		setTop2ChartData: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail2");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("TOPFuncLocFrame");

			var topPM = this.getView().byId("TOPFuncLoc");

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM2(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				filters: aFilters,
				urlParameters: {
					"$select": "FuncLoc,FuncLocName,Amount",
					// "$filter": "FuncLoc ne '-'",
					"$top": "20",
					"$orderby": "Amount desc"
				},
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "TOPFuncLocModel");

					topPM.setVisible((oData.results.length >= 1) ? true : false);
				},
				error: function(err) {
					// console.log("error");
				}
			});

		},

		setTop3ChartData: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail3");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var equipChart = this.getView().byId("TOPEquipmentFrame");

			var topPM = this.getView().byId("TOPEquipment");

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM3(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				filters: aFilters,
				urlParameters: {
					"$select": "Equip,EquipName,Amount",
					// "$filter": "Equip ne '-'",
					"$top": "20",
					"$orderby": "Amount desc"
				},
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					equipChart.setModel(oJSONModel, "TOPEquipmentModel");

					// MessageToast.show(oData.results.length);

					topPM.setVisible((oData.results.length >= 1) ? true : false);
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},

		setTop4ChartData: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail4");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("TOPCostCenterFrame");

			// var topPM = this.getView().byId("TOPCostCenter");

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM4(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "CostCenter,costcentername,OrderType,Amount",
					// "$filter": "OrderType eq '-' and CostCenter ne '-'",
					"$top": "30",
					"$orderby": "Amount desc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "TOPCostCenterModel");

					// topPM.setVisible((oData.results.length >= 1) ? true : false);
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},

		setTop1ChartFormat: function() {
			var oChart = this.getView().byId("TOPOrderTypeFrame");

			oChart.setVizProperties({
				title: {
					visible: "false"
				},
				legend: {
					visible: true,
					label: {
						style: {
							fontSize: "9"
						}
					},
					isScrollable: false
						// ,
						// order: this.sort
				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				interaction: {
					selectability: {
						mode: "exclusive"
					}
				},
				plotArea: {
					gridline: {
						visible: true
					},
					dataLabel: {
						type: "percentage",
						// formatString: this._formatPattern.STANDARDPERCENT_MFD2,
						visible: true,
						style: {
							fontSize: "9"
						},
						showTotal: true
					},
					dataPointSize: {
						min: 55,
						max: 55
					}
				}
			});

			this.setColorPalette(oChart);

			var oPopOver = this.getView().byId("TOPOrderTypePopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},

		setTop2ChartFormat: function() {
			var oChart = this.getView().byId("TOPFuncLocFrame");
			oChart.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						visible: false
					},
					window: {
						start: "firstDataPoint",
						end: "lastDataPoint"
					},
					dataPointSize: {
						min: 50,
						max: 50
					}
					// ,isScrollable: false
				},
				valueAxis: {
					label: {
						formatString: this._formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: false
						// text: 'Revenue by City and Store Name'
				}
			});

			// this.setColorPalette(oChart);
			oChart.setVizScales([{
				feed: "color",
				// palette: ["#336699", "#00D2DC"]
				palette: ["#98bc62", "#98bc62"]

			}]);

			var oPopOver = this.getView().byId("TOPFuncLocPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},

		setTop3ChartFormat: function() {
			var oChart = this.getView().byId("TOPEquipmentFrame");
			oChart.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						visible: false
					},
					window: {
						start: "firstDataPoint",
						end: "lastDataPoint"
					},
					dataPointSize: {
						min: 50,
						max: 50
					}
					// ,isScrollable: false
				},
				valueAxis: {
					label: {
						formatString: this._formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
					// ,axisLine: {
					// 	visible: false
					// }
				},
				title: {
					visible: false
						// text: 'Revenue by City and Store Name'
				}
			});

			oChart.setVizScales([{
				feed: "color",
				// palette: ["#336699", "#00D2DC"]
				palette: ["#2d5f2e", "#98bc62"]

			}]);

			var oPopOver = this.getView().byId("TOPEquipmentPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},

		setTop4ChartFormat: function() {
			var oChart = this.getView().byId("TOPCostCenterFrame");
			oChart.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						visible: false
					}
				},
				valueAxis: {
					label: {
						formatString: this._formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: false
						// text: 'Revenue by City and Store Name'
				}
			});

			// this.setColorPalette(oChart);

			var oPopOver = this.getView().byId("TOPCostCenterPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);

		},

		setRM1ChartDataPieL: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail");
			// var oModel = this.getOwnerComponent().getModel("itemDetail_prevYR");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("RMTotals_PieL");

			var topPM = this.getView().byId("totPie1");

			// var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "GL_Label2,Amount",
					// "$top": "2",
					// "$filter": "FiscalYear eq '" + curryear + "'",
					"$orderby": "GL_Label2 asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "RMTotalsModel_PieL");

					topPM.setVisible((oData.results.length >= 1) ? true : false);
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},

		setRM1ChartDataPieR: function(periodFrom, periodTo, curryear, filterBar) {

			var prevYR = curryear - 1;
			var keyDate = prevYR + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail");
			// var oModel = this.getOwnerComponent().getModel("itemDetail_prevYR");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var pieChart = this.getView().byId("RMTotals_PieR");

			var topPM = this.getView().byId("totPie2");

			// var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "GL_Label2,Amount"
						// "$top": "2",
						// "$filter": "FiscalYear eq '" + prevYR + "'"
						,
					"$orderby": "GL_Label2 asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					pieChart.setModel(oJSONModel, "RMTotalsModel_PieR");

					// MessageToast.show(prevYR);
					topPM.setVisible((oData.results.length >= 1) ? true : false);
				},
				error: function(err) {
					// console.log("error");
				}
			});

		},

		setRM1ChartDataStack: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail_prevYR");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("RMTotals_Stack");

			var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "FiscalYear,GL_Label2,Amount",
					// "$top": "2",
					// "$filter": "FiscalYear eq '" + curryear + "'",
					"$orderby": "FiscalYear desc, GL_Label2 asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "RMTotalsModel_Stack");
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},

		setRM2ChartData: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail_prevYR");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("RMTotalsGLFrame");

			var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "FiscalYear,CompanyName,SegmentDesc,GL_Label1,Amount",
					"$orderby": "FiscalYear desc, GL_Label1 asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "RMTotalsGLModel");
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},
		
		setRM2ChartData2: function(periodFrom, periodTo, curryear, filterBar) {

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail_prevYR");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("RMTotalsGLFrame2");

			var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "FiscalYear,CompanyName,SegmentItemNo,SegmentDesc,GL_Label1,Amount",
					"$orderby": "SegmentItemNo, FiscalYear desc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "RMTotalsGLModel");
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},
		
		setSegmentCompMonthly: function(periodFrom, periodTo, curryear, filterBar){
			
			// var oVizFrame = this.getView().byId("RMTotalsGLMonthFrame2");
			var keyDate = curryear + "0101";
			var oModel = this.getOwnerComponent().getModel("itemDetail_Group");
			var aFilters = filterBar;
			// var oJSONModel = new sap.ui.model.json.JSONModel();
			
			
			var rmMonthSegment = this.getView().byId("rmMonthlySegment");
			var rmMonthCompany = this.getView().byId("rmMonthly");

			var path = "/ZCDS_PM_RMCM_DETAIL_GROUP(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
	
				oModel.read(path, {
					urlParameters: {
						"$select": "CompanyName"
					},
					filters: aFilters,
					success: function(oData, oResponse) {
						// if (oData.results.length() >= 1) {
						// 	// MessageToast.show("Company");
						// }
						// else {
						// 	// MessageToast.show("Segment");
						// }
					rmMonthSegment.setVisible((oData.results.length === 1) ? true : false);
					rmMonthCompany.setVisible((oData.results.length !== 1) ? true : false);
						
						// oJSONModel.setData(oData);
						// oVizFrame.setModel(oJSONModel, "shekretModel");
					},
					error: function(err) {
						// console.log("error");
						MessageToast.show("ERROR");
					}
				});
							
		},
		
		setSegmentComp: function(periodFrom, periodTo, curryear, filterBar){
			
			// var oVizFrame = this.getView().byId("RMTotalsGLMonthFrame2");
			var keyDate = curryear + "0101";
			var oModel = this.getOwnerComponent().getModel("itemDetail_prevYR");
			var aFilters = filterBar;
			// var oJSONModel = new sap.ui.model.json.JSONModel();
			
			
			var rmSegment = this.getView().byId("rmTotalsSegment");
			var rmCompany = this.getView().byId("rmTotalsCompany");

			var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
	
				oModel.read(path, {
					urlParameters: {
						"$select": "CompanyName"
					},
					filters: aFilters,
					success: function(oData, oResponse) {
					rmSegment.setVisible((oData.results.length === 1) ? true : false);
					rmCompany.setVisible((oData.results.length !== 1) ? true : false);
					},
					error: function(err) {
						// console.log("error");
						MessageToast.show("ERROR");
					}
				});
							
		},

		setRM3ChartData: function(periodFrom, periodTo, curryear, filterBar) {
			
			var oVizFrame = this.getView().byId("RMTotalsGLMonthFrame");

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail_Group");

			var aFilters = filterBar;

			var path = "/ZCDS_PM_RMCM_DETAIL_GROUP(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
				
			oModel.read(path, {
				urlParameters: {
					"$select": "Period,Per_TXT_UP,GL_Label1,CompanyName,SegmentDesc,ProfitCenter,Amount",
					"$filter": "ProfitCenter ne '-'",
					"$orderby": "Period asc, Amount desc, CompanyName asc, SegmentDesc asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData);
					oVizFrame.setModel(oJSONModel, "RMTotalsGLMonthModel");
				},
				error: function(err) {
					// console.log("error");
					MessageToast.show("ERROR");
				}
			});
		},
		
		setRM3ChartData2: function(periodFrom, periodTo, curryear, filterBar) {
			
			var oVizFrame = this.getView().byId("RMTotalsGLMonthFrame2");

			var keyDate = curryear + "0101";

			var oModel = this.getOwnerComponent().getModel("itemDetail_Group");

			var aFilters = filterBar;

			var path = "/ZCDS_PM_RMCM_DETAIL_GROUP(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate +
				"')/Results";
				
			oModel.read(path, {
				urlParameters: {
					"$select": "Period,Per_TXT_UP,GL_Label1,CompanyName,SegmentDesc,ProfitCenter,Amount",
					"$filter": "ProfitCenter ne '-'",
					"$orderby": "Period asc, Amount desc, CompanyName asc, SegmentDesc asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData);
					oVizFrame.setModel(oJSONModel, "RMTotalsGLMonthModel");
				},
				error: function(err) {
					// console.log("error");
					MessageToast.show("ERROR");
				}
			});
		},

		setRM1ChartFormatPie1: function(chart, oPopover) {

			var oVizFrame = this.oVizFrame = this.getView().byId("RMTotals_PieL");

			oVizFrame.setVizProperties({
				title: {
					visible: "false"
				},
				legend: {
					visible: false,
					label: {
						style: {
							fontSize: "9"
						}
					},
					isScrollable: false
				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				interaction: {
					selectability: {
						mode: "exclusive"
					}
				},
				plotArea: {
					gridline: {
						visible: true
					},
					dataLabel: {
						type: "percentage",
						// formatString: this._formatPattern.STANDARDPERCENT_MFD2,
						visible: true,
						style: {
							fontSize: "9"
						},
						showTotal: true
					},
					dataPointSize: {
						min: 55,
						max: 55
					}
				}
			});

			oVizFrame.setVizScales([{
				feed: "color",
				// palette: ["#336699", "#00D2DC"]
				palette: ["#498ec5", "#b6d1de"]

			}]);

			var oPopOver = this.getView().byId("RMTotalsPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
			// oPopOver.setFormatString(FIORI_PERCENTAGE_FORMAT_2);
		},

		setRM1ChartFormatPie2: function(chart, oPopover) {

			var oVizFrame = this.oVizFrame = this.getView().byId("RMTotals_PieR");

			oVizFrame.setVizProperties({
				title: {
					visible: "false"
				},
				legend: {
					visible: false,
					label: {
						style: {
							fontSize: "9"
						}
					},
					isScrollable: false
				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				interaction: {
					selectability: {
						mode: "exclusive"
					}
				},
				plotArea: {
					gridline: {
						visible: true
					},
					dataLabel: {
						type: "percentage",
						// formatString: this._formatPattern.STANDARDPERCENT_MFD2,
						visible: true,
						style: {
							fontSize: "9"
						},
						showTotal: true
					},
					dataPointSize: {
						min: 55,
						max: 55
					}
				}
			});

			oVizFrame.setVizScales([{
				feed: "color",
				// palette: ["#336699", "#00D2DC"]
				palette: ["#498ec5", "#b6d1de"]

			}]);

			var oPopOver = this.getView().byId("RMTotalsPopOver2");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
			// oPopOver.setFormatString(FIORI_PERCENTAGE_FORMAT_2);
		},

		setRM1ChartFormatStack: function(chart, oPopover) {

			Format.numericFormatter(ChartFormatter.getInstance());

			//Formatter
			var FIORI_PERCENTAGE_FORMAT_2 = "__UI5__PercentageMaxFraction2";
			var chartFormatter = ChartFormatter.getInstance();
			chartFormatter.registerCustomFormatter(FIORI_PERCENTAGE_FORMAT_2, function(value) {
				var percentage = sap.ui.core.format.NumberFormat.getPercentInstance({
					style: "percent",
					maxFractionDigits: 1
				});
				return percentage.format(value);
			});
			sap.viz.api.env.Format.numericFormatter(chartFormatter);

			var oVizFrame = this.oVizFrame = this.getView().byId("RMTotals_Stack");

			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						// type: "percentage",
						visible: false,
						showTotal: true,
						formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						}
					}
				},

				legend: {
					visible: true,
					label: {
						style: {
							fontSize: "9"
						}
					}
				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},

				valueAxis: {
					title: {
						visible: false
					},
					label: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						// formatString: FIORI_PERCENTAGE_FORMAT_2,
						style: {
							fontSize: "9"
								// ,visible: true
						}
						// ,visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: false
					},
					label: {
						// formatString: this._formatPattern.SHORTFLOAT_MFD2,
						visible: true,
						style: {
							fontSize: "9"
						}
					}
				},
				title: {
					text: "R&M by Totals",
					visible: false
				}
			});

			oVizFrame.setVizScales([{
				feed: "color",
				// palette: ["#336699", "#00D2DC"]
				palette: ["#498ec5", "#b6d1de"]

			}]);

			var oPopOver = this.getView().byId("RMTotalsPopOver3");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
			// oPopOver.setFormatString(FIORI_PERCENTAGE_FORMAT_2);
		},

		setRM2ChartFormat: function(chart, oPopover) {
			var oChart = this.getView().byId("RMTotalsGLFrame");

			oChart.setVizProperties({
				title: {
					visible: "false"
				},
				legend: {
					visible: true,
					label: {
						style: {
							fontSize: "9"
						}
					}
				},
				legendGroup: {
					layout: {
						position: "bottom"
					}
				},
				interaction: {
					selectability: {
						mode: "exclusive"
					}
				},
				categoryAxis: {
					title: {
						visible: false
					},
					label: {
						visible: true,
						rotation: "auto",
						angle: "10",
						style: {
							fontWeight: "normal",
							fontSize: "9"
						},
						parentStyle: {
							fontWeight: "normal",
							fontSize: "9"
						}
					}
				},
				valueAxis: {
					title: {
						visible: false
					},
					label: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						}
					}
				},
				plotArea: {
					// mode: "percentage",
					dataLabel: {
						visible: true,
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						}
					}
				}
			});

			// this.setColorPalette(oChart);

			oChart.setVizScales([{
				feed: "color",
				// palette: ["#E9AF32", "#CC5B23"]
				palette: ["#0c5097", "#e87f33"]
			}]);

			var oPopOver = this.getView().byId("RMTotalsGLPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},
		
		setRM2ChartFormat2: function(chart, oPopover) {
			var oChart = this.getView().byId("RMTotalsGLFrame2");

			oChart.setVizProperties({
				title: {
					visible: "false"
				},
				legend: {
					visible: true,
					label: {
						style: {
							fontSize: "9"
						}
					}
				},
				legendGroup: {
					layout: {
						position: "bottom"
					}
				},
				interaction: {
					selectability: {
						mode: "exclusive"
					}
				},
				categoryAxis: {
					title: {
						visible: false
					},
					label: {
						visible: true,
						rotation: "auto",
						angle: "10",
						style: {
							fontWeight: "normal",
							fontSize: "9"
						},
						parentStyle: {
							fontWeight: "normal",
							fontSize: "9"
						}
					}
				},
				valueAxis: {
					title: {
						visible: false
					},
					label: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						}
					}
				},
				plotArea: {
					// mode: "percentage",
					dataLabel: {
						visible: true,
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						}
					}
				}
			});

			// this.setColorPalette(oChart);

			oChart.setVizScales([{
				feed: "color",
				// palette: ["#E9AF32", "#CC5B23"]
				palette: ["#0c5097", "#e87f33"]
			}]);

			var oPopOver = this.getView().byId("RMTotalsGLPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},

		setRM3ChartFormat: function() {
			var oChart = this.getView().byId("RMTotalsGLMonthFrame");

			oChart.setVizProperties({
				title: {
					visible: "false"
				},
				plotArea: {
					dataLabel: {
						visible: false,
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						},
						showTotal: true
					},
					window: {
						start: "firstDataPoint",
						end: "lastDataPoint"
					},
					isScrollable: true
				},
				legend: {
					visible: true,
					label: {
						style: {
							fontSize: "9"
						}
					},
					isScrollable: false
				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				interaction: {
					selectability: {
						mode: "exclusive"
					}
				},
				categoryAxis: {
					title: {
						visible: false
					},
					label: {
						style: {
							fontSize: "9"
						}
					},
					isScrollable: false
				},
				valueAxis: {
					title: {
						visible: false
					},
					label: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						}
					}
				}

			});

			this.setColorPalette2(oChart);

			// oChart.setVizScales([{
			// 	feed: "color",
			// 	// palette: ["#154890", "#6699FF", "#CDBFAC", "#F5EDE3", "#FF6600"]
			// 	// palette: ["#154890", "#fbde84", "#e4c98b", "#f0c571", "#967e5e"]
			// 	palette: ["#154890",
			// 		"#508b67", "#95c281", "#967e5e", "#fa4949"
			// 	]
			// }]);

			var oPopOver = this.getView().byId("RMTotalsGLMonthPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},
		
		setRM3ChartFormat2: function() {
			var oChart = this.getView().byId("RMTotalsGLMonthFrame2");

			oChart.setVizProperties({
				title: {
					visible: "false"
				},
				plotArea: {
					dataLabel: {
						visible: false,
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						},
						showTotal: true
					},
					window: {
						start: "firstDataPoint",
						end: "lastDataPoint"
					},
					isScrollable: true
				},
				legend: {
					visible: true,
					label: {
						style: {
							fontSize: "9"
						}
					},
					isScrollable: false
				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				interaction: {
					selectability: {
						mode: "exclusive"
					}
				},
				categoryAxis: {
					title: {
						visible: false
					},
					label: {
						style: {
							fontSize: "9"
						}
					},
					isScrollable: false
				},
				valueAxis: {
					title: {
						visible: false
					},
					label: {
						formatString: this._formatPattern.SHORTFLOAT_MFD2,
						style: {
							fontSize: "9"
						}
					}
				}

			});

			// this.setColorPalette(oChart);

			oChart.setVizScales([{
				feed: "color",
				// palette: ["#154890", "#6699FF", "#CDBFAC", "#F5EDE3", "#FF6600"]
				// palette: ["#154890", "#fbde84", "#e4c98b", "#f0c571", "#967e5e"]
				palette: ["#154890",
					"#508b67", "#95c281", "#967e5e", "#fa4949"
				]
			}]);

			var oPopOver = this.getView().byId("RMTotalsGLMonthPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},

		onSearchDetails: function() {
			var periodFrom = this.getView().byId("periodFromComboBox");
			var periodTo = this.getView().byId("periodToComboBox");
			var fiscalYear = this.getView().byId("FiscalYear");

			var periodToN = ((periodTo.getSelectedKey() === "12") ? "99" : periodTo.getSelectedKey());

			this.setDataTable(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey());

			this.setTotals(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setTotalsOT(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());

			this.setRM1ChartDataPieL(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar")
				.getFilters());
			this.setRM1ChartDataPieR(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar")
				.getFilters());
			this.setRM1ChartDataStack(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar")
				.getFilters());

			this.setRM2ChartData(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setRM2ChartData2(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			
			this.setRM3ChartData(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setRM3ChartData2(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			
			this.setSegmentCompMonthly(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setSegmentComp(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());

			this.setTop1ChartData(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setTop2ChartData(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setTop3ChartData(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());

			this.setTop4ChartData(periodFrom.getSelectedKey(), periodToN, fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());

			var oSmartTableProjectsDetails = this.getView().byId("smartTableDetails");
			oSmartTableProjectsDetails.rebindTable();
			
			this.onDataReceived();
		},

		setFields: function() {
			// var oPeriodComboBox = this.getView().byId("PeriodComboBox");
			var oYearComboBox = this.getView().byId("FiscalYear");

			var today = new Date();
			var thisYear = today.getFullYear();

			var yearsData = {
				"years": []
			};
			var i = 1;
			var year = thisYear;

			while (i < 20) {
				if (year > "2016") {
					yearsData.years.push({
						"key": year
					});
					year -= 1;
				}
				i++;
			}

			var oYearsJson = new sap.ui.model.json.JSONModel();
			oYearsJson.setData(yearsData);
			oYearComboBox.setModel(oYearsJson, "paramYearModel");
			oYearComboBox.setSelectedKey(thisYear);
		},

		sort: function(m, n) {
			// MessageToast.show("SORT");
			return -1;
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
		setColorPalette: function(chart) {

			chart.setVizScales([{
				feed: "color",
				palette: [
					"#01B4EA",
					"#8DD75F",
					"#FF8A00",
					"#00D2DC",
					"#01547F",
					"#FFE030",
					"#A5E348"
				]
			}]);

		},

		setColorPalette2: function(chart) {

			chart.setVizScales([{
				feed: "color",
				palette: [
					"#59981a",
					"#274472",
					"#04ecf0",
					"#ecf87f",
					"#5885af",
					"#3d550c",
					"#145da0",
					"#b1d4e0",
					"#41729f",
					"#2e8bc0",
					"#04d4f0",
					"#059dc0"
				]
			}]);
		},

		showBusyIndicator: function(iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);
		}

	});
});