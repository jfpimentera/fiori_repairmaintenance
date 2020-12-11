sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/Filter", 
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel"
], function(Controller, ChartFormatter, Format, NumberFormat, Filter, DateFormat, JSONModel) {
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
			
			
			// var datePicker = this.getView().byId("ReportDatePicker");
			// datePicker.setModel(oInitModel);
			// var datePickerDetails = this.getView().byId("ReportDatePickerDetails");
			// datePickerDetails.setModel(oInitModel);

			var currentDate = new Date();
			// var dd = String(currentDate.getDate()).padStart(2, "0");
			var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
			// var yyyy = currentDate.getFullYear();


			var periodTo = this.getView().byId("periodToComboBox");
			periodTo.setSelectedKey(mm);


			// var initialDate = yyyy + mm + dd;
			// var startDate = yyyy + "01" + "01";


			// sap.m.MessageBox.success(dateFormatted, {
			//     title: "Success",                                    // default
			//     onClose: null,                                       // default
			//     styleClass: "",                                      // default
			//     initialFocus: null,                                  // default
			//     textDirection: sap.ui.core.TextDirection.Inherit     // default
			// });

			// this.setDataTable("1", "1", yyyy);
			this.setDataTable("1", 	periodTo.getSelectedKey(), dateFormatted);
			// this.setModel("smartTableDetails", "/ZCDS_PM_RMCM_DETAIL_ITEM", "itemDetail");
			
			var totalsPath = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='1',P_PeriodTo='" + periodTo.getSelectedKey() + "',P_KeyDate='" + dateFormatted + "')/Results";
			this.setModel("Grid", totalsPath, "totalsModel"); //Totals
			
			// var pathTotals = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='1',P_PeriodTo='" + periodTo.getSelectedKey() + "',P_KeyDate='" + dateFormatted + "')/Results"; 
			// this.setModel("Grid", pathTotals, "totalsModel");

			// CHARTS
			// this.setModel("RMTotals", path, "RMTotalsModel"); 
			this.setRM1ChartData("1", 	periodTo.getSelectedKey(), dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM2ChartData("1", 	periodTo.getSelectedKey(), dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setRM3ChartData("1", 	periodTo.getSelectedKey(), dateFormatted, this.getView().byId("smartFilterBar").getFilters());

			this.setTop1ChartData("1", 	periodTo.getSelectedKey(), dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setTop2ChartData("1", 	periodTo.getSelectedKey(), dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			this.setTop3ChartData("1", 	periodTo.getSelectedKey(), dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			
			this.setTop4ChartData("1", 	periodTo.getSelectedKey(), dateFormatted, this.getView().byId("smartFilterBar").getFilters());
			
			// CHARTS FORMAT
			this.setRM1ChartFormat();
			this.setRM2ChartFormat();
			this.setRM3ChartFormat();
			
			this.setTop1ChartFormat();
			this.setTop2ChartFormat();
			this.setTop3ChartFormat();
			
			this.setTop4ChartFormat();

			this.getView().addStyleClass(this.getContentDensityClass());
		},
		
		
		
		setModel: function(pComponent, pPath, pModelName) {
			// this.showBusyIndicator(4000);

			var oModel = this.getOwnerComponent().getModel("itemDetail_Totals");
			var oComponent = this.getView().byId(pComponent);
			var oJSONModel = new sap.ui.model.json.JSONModel();
			oModel.read(pPath, {
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					if(pPath === "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='1',P_PeriodTo='12',P_KeyDate='2020')/Results"){
						oData.results[0].INT_COV = parseFloat(oData.results[0].FiscalYear);
						oData.results[0].INT_COV_TARGET= parseFloat(oData.results[0].Amount);
						oData.results[0].INT_COV_MAX = parseFloat(oData.results[0].Currency);
					}
					oComponent.setModel(oJSONModel, pModelName);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(err) {}
			});
		}, 
		
		
		setColorAss: function() {
			var caeText = this.getView().byId("assText").getProperty("text");
			var n = caeText.includes("-");
			if (n){
			this.getView().byId("assText").removeStyleClass("totalsText");
			this.getView().byId("assText").addStyleClass("totalsTextN");
			}
			else{
			this.getView().byId("assText").removeStyleClass("totalsTextN");
			this.getView().byId("assText").addStyleClass("totalsText");
			}
			
			var caeText2 = this.getView().byId("assText2").getProperty("text");
			var n2 = caeText2.includes("-");
			if (n2){
			this.getView().byId("assText2").removeStyleClass("totalsText");
			this.getView().byId("assText2").addStyleClass("totalsTextN");
			}
			else{
			this.getView().byId("assText2").removeStyleClass("totalsTextN");
			this.getView().byId("assText2").addStyleClass("totalsText");
			}
		},
     //   onExport: function() {
     //       var oExportConfiguration, oExportPromise;
 
     //       /* Creates the configuration and initializes the spreadsheet export */
     //       oExportConfiguration = this.createExportConfiguration();
            
     //       var aColumns = [];
			  //aColumns.push({
			  //  label: "Name",
			  //  property: "name"
			  //});
			  //aColumns.push({
			  //  label: "Salary",
			  //  property: "salary",
			  //  type: "number",
			  //  scale: 2
			  //});
			  //var mSettings = {
			  //  workbook: { columns: aColumns },
			  //  // dataSource: mDataSource,
			  //  fileName: "salary.xlsx"
			  //};
     //       var oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
 
     //       /* Starts the export and returns a Promise */
     //       oExportPromise = oSpreadsheet.build();
 
     //       oExportPromise.then(function() {
     //           // Here you can perform additional steps after the export has finished
     //       });
     //   },
 
     //   createExportConfiguration: function() {
     //       var oConfiguration = {
					//     workbook: {
					//         context: {
					//             application: "Supplier Invoices List",
					//             version: "6.1.0-SNAPSHOT",
					//             title: "Supplier Invoices",
					//             modifiedBy: "Doe, John",
					//             sheetName: "Invoices"
					//         }
					//     }
					// };
 
     //       return oConfiguration;
     //   },

		onDataReceived: function() {
			var oTable = this.byId("smartTableDetails");
			var i = 0;                         
			oTable.getTable().getColumns().forEach(function(oLine) {
				oLine.setWidth("100%");
				oLine.getParent().autoResizeColumn(i);
				oLine.getParent().autoResizeColumn(0);
				i++;
			});
		},
		
		setDataTable: function(periodFrom, periodTo, curryear) {
			
			var keyDate = curryear + "0101";
			
			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			// ,P_Year='" + curryear + "'
			// var path = "/ZCDS_PM_RMCM_DETAIL_ITEM";

			var oSmartTableProjects = this.getView().byId("smartTableDetails");
			oSmartTableProjects.setTableBindingPath(path);
		},
		
		
		setTop1ChartData: function(periodFrom, periodTo, curryear, filterBar) {
			
			var keyDate = curryear + "0101";
			
			var oModel = this.getOwnerComponent().getModel("itemDetail");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("TOPOrderTypeFrame");

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "OrderType,FiscalYear,ordertypename,Amount"
					,"$filter": "OrderType eq 'PM01' or OrderType eq 'PM02' or OrderType eq 'PM03' or OrderType eq 'PM04' or OrderType eq 'PM05' or OrderType eq 'PM06'"
					// "$top": "2",
					,"$orderby": "OrderType asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "TOPOrderTypeModel");
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},
		
		setTop2ChartData: function(periodFrom, periodTo, curryear, filterBar) {
			
			var keyDate = curryear + "0101";
			
			var oModel = this.getOwnerComponent().getModel("itemDetail");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("TOPFuncLocFrame");

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "FuncLoc,FuncLocName,Amount",
					"$filter": "FuncLoc ne ''",
					"$top": "20",
					"$orderby": "Amount desc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "TOPFuncLocModel");
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},
		
		setTop3ChartData: function(periodFrom, periodTo, curryear, filterBar) {
			
			var keyDate = curryear + "0101";
			
			var oModel = this.getOwnerComponent().getModel("itemDetail");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var equipChart = this.getView().byId("TOPEquipmentFrame");

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "Equip,EquipName,Amount",
					"$filter": "Equip ne ''",
					// "$filter": "Equip ne ''",
					"$top": "20"
					,
					"$orderby": "Amount desc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					equipChart.setModel(oJSONModel, "TOPEquipmentModel");
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},
		
		setTop4ChartData: function(periodFrom, periodTo, curryear, filterBar) {
			
			var keyDate = curryear + "0101";
			
			var oModel = this.getOwnerComponent().getModel("itemDetail");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("TOPCostCenterFrame");

			var path = "/ZCDS_PM_RMCM_DETAIL_ITEM(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "CostCenter,costcentername,OrderType,ordertypename,Amount",
					"$filter": "OrderType eq '-'",
					"$top": "30",
					"$orderby": "Amount desc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "TOPCostCenterModel");
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
								isScrollable: true
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
								isScrollable: true
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

		
		setRM1ChartData: function(periodFrom, periodTo, curryear, filterBar) {
			
			var keyDate = curryear + "0101";
			
			var oModel = this.getOwnerComponent().getModel("itemDetail_prevYR");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("RMTotalsFrame");

			var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "FiscalYear,GL_Label2,Amount",
					// "$top": "2",
					"$orderby": "FiscalYear desc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "RMTotalsModel");
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

			var path = "/ZCDS_PM_RMCM_DETAIL_PREVYR(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "FiscalYear,GL_Label1,Amount",
					"$orderby": "FiscalYear desc"
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


		setRM3ChartData: function(periodFrom, periodTo, curryear, filterBar) {
			
			var keyDate = curryear + "0101";
			
			var oModel = this.getOwnerComponent().getModel("itemDetail_Group");
			var oJSONModel = new sap.ui.model.json.JSONModel();

			var aFilters = filterBar;
			var overallDonutChart = this.getView().byId("RMTotalsGLMonthFrame");

			var path = "/ZCDS_PM_RMCM_DETAIL_GROUP(P_PeriodFrom='" + periodFrom + "',P_PeriodTo='" + periodTo + "',P_KeyDate='" + keyDate + "')/Results";
			oModel.read(path, {
				urlParameters: {
					"$select": "Period,Per_TXT_UP,GL_Label1,Amount",
					"$orderby": "Period asc"
				},
				filters: aFilters,
				success: function(oData, oResponse) {
					oJSONModel.setData(oData);
					overallDonutChart.setModel(oJSONModel, "RMTotalsGLMonthModel");
				},
				error: function(err) {
					// console.log("error");
				}
			});
		},

		setRM1ChartFormat: function(chart, oPopover) {
			var oChart = this.getView().byId("RMTotalsFrame");

var oVizFrame = this.oVizFrame = this.getView().byId("RMTotalsFrame");
            oVizFrame.setVizProperties({
                plotArea: {
                    mode: "percentage",
                    dataLabel: {
                        type: "percentage",
                        formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
						visible: true,
						showTotal: true
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
                    label: {
                        // formatString: this._formatPattern.SHORTFLOAT_MFD2,
						visible: false
                    },
                    title: {
                        visible: false
                    }
                },
                valueAxis2: {
                    label: {
                        // formatString: this._formatPattern.SHORTFLOAT_MFD2,
						visible: true
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
                    visible: false,
                    text: 'R&M Totals'
                }
            });

			this.setColorPalette(oChart);

			var oPopOver = this.getView().byId("RMTotalsPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.INTEGER);
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
					},
					isScrollable: false
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
						visible: false
					}
				}
			});


			this.setColorPalette(oChart);

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
						visible: false
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

			this.setColorPalette(oChart);

			var oPopOver = this.getView().byId("RMTotalsGLMonthPopOver");
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},

		
// rowSelectionChange: function(oEvent){
// 		var oID = oEvent.getSource().getId();
// 		var oSelectedRowID = $('#'+oID).find('.smartTableDetails')[1].id;
// 		var oRow = sap.ui.getCore().byId(oSelectedRowID);
// 		var oCells = oRow.getCells();
// 		for(var i=0;i<oCells.length;i++){
// 			oCells[i].setEditable(true);
// 		}
// 	},
		onSearchDetails: function() {
			var periodFrom = this.getView().byId("periodFromComboBox");
			var periodTo = this.getView().byId("periodToComboBox");
			var fiscalYear = this.getView().byId("FiscalYear");
			
			this.setDataTable(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey());
			
			
			this.setRM1ChartData(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setRM2ChartData(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setRM3ChartData(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			
			this.setTop1ChartData(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setTop2ChartData(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			this.setTop3ChartData(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());
			
			this.setTop4ChartData(periodFrom.getSelectedKey(), 	periodTo.getSelectedKey(), fiscalYear.getSelectedKey(), this.getView().byId("smartFilterBar").getFilters());

			var oSmartTableProjectsDetails = this.getView().byId("smartTableDetails");
			oSmartTableProjectsDetails.rebindTable();
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
					"#991101",
					"#C23210",
					"#D65F59",
					"#FF8AB3",
					"#FFD0C2",
					"#8DD75F",
					"#A5E348"
				]
			}]);
		},

		showBusyIndicator: function(iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);
		}


	});
});