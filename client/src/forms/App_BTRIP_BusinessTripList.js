import { saveFormParam } from "../lib/common";

/**
 * @param {D5TableForm} form
 * @param {D5Core} core
 */
export const App_BTRIP_BusinessTripList = (form, core) => ({
  OnShow() {
    saveFormParam("App_BTRIP_BusinessTripEdit", "FirmID", form.filterField("FirmID").value);
  },
  OnApplyFilter() {
    saveFormParam("App_BTRIP_BusinessTripEdit", "FirmID", form.filterField("FirmID").value);
  }
});

window.userScript = {
  ...window.userScript,
  App_BTRIP_BusinessTripList
};
