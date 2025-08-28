import { restoreFormParam } from "../lib/common";

/**
 * @param {D5TableForm} form
 * @param {D5Core} core
 */
export const App_BTRIP_BusinessTripEdit = (form, core) => ({
  OnInit() {
  },
  OnShow() {
    setFieldInitialValue(form);
  }
});

function setFieldInitialValue(form) {
  let firmID = restoreFormParam("App_BTRIP_BusinessTripEdit", "FirmID");
  if (form.field("ID").value == null) {
    if (firmID instanceof Array) {
        form.field("FirmID").value = firmID[0];
    } else {
        form.field("FirmID").value = firmID;
    }
    form.field("PersonID").filter = {"FirmID": firmID};
  } else {
    form.field("PersonID").filter = {"FirmID": -1};
  }
}

window.userScript = {
  ...window.userScript,
  App_BTRIP_BusinessTripEdit
};
