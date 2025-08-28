import { saveFormParam } from "../lib/common";

/**
 * @param {D5TableForm} form
 * @param {D5Core} core
 */
export const App_BTRIP_BusinessTripList = (form, core) => ({
  OnInit() {
    form.filterField("IsPassed").defaultValue = 0;  
    setFieldInitialValue(form);
  },
  OnShow() {
    saveFormParam("App_BTRIP_BusinessTripEdit", "FirmID", form.filterField("FirmID").value);
    setFieldInitialValue(form);
  },
  OnApplyFilter() {
    saveFormParam("App_BTRIP_BusinessTripEdit", "FirmID", form.filterField("FirmID").value);
    setFieldInitialValue(form);
  },
  FirmIDOnValueChanged() {
    setFieldInitialValue(form);
  }
});

function setFieldInitialValue(form) {
  let firmID = form.filterField("FirmID").value || -1;
  form.filterField("PersonID").filter = {"FirmID": firmID};
  form.filterField("ApprovedByPersonID").filter = {"FirmID": firmID};
  form.subForm("TableExpenses").filterField("NomenclatureID").filter = {"FirmID": firmID, "NomenclatureKindID": 4};
}

window.userScript = {
  ...window.userScript,
  App_BTRIP_BusinessTripList
};
