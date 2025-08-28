import { restoreFormParam } from "../lib/common";

/**
 * @param {D5TableForm} form
 * @param {D5Core} core
 */
export const App_BTRIP_BusinessTripEdit = (form, core) => ({
  OnShow() {
    setFieldInitialValue(form);
    console.log("### Hi there");
  }
});

function setFieldInitialValue(form) {
  let firmID = restoreFormParam("App_BTRIP_BusinessTripEdit", "FirmID");
  if (form.field("FirmID").value = null) {
    if (firmID instanceof Array) {
        form.field("FirmID").value = firmID[0];
    } else {
        form.field("FirmID").value = firmID;
    }
  }
}

window.userScript = {
  ...window.userScript,
  App_BTRIP_BusinessTripEdit
};
