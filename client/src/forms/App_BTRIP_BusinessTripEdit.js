import { restoreFormParam } from "../lib/common";
import { getEnum, BusinessTripTypes } from "../lib/enums";

/**
 * @param {D5TableForm} form
 * @param {D5Core} core
 */
export const App_BTRIP_BusinessTripEdit = (form, core) => {
  return ({
    OnInit: () => {
      form.field("TripType").datasource = getEnum(BusinessTripTypes);
    },
    OnShow: () => {
      setFieldInitialValue(form);
      setFieldAvailability(form);
    }
  });
}


function setFieldInitialValue(form) {
  let firmID = restoreFormParam("App_BTRIP_BusinessTripEdit", "FirmID");
  if (form.field("ID").value == null) {
    if (firmID instanceof Array) {
      form.field("FirmID").value = firmID[0];
    } else {
      form.field("FirmID").value = firmID;
    }
    form.field("PersonID").filter = { "FirmID": firmID };
  } else {
    form.field("PersonID").filter = { "FirmID": -1 };
  }
}

function setFieldAvailability(form) {
  if (form.field("ID").value != null) {
    let status = form.field("ApproveStatus").value || 0;
    if (status > 0) {
      for (let field of form.fields) {
        if (status != 1 || field.name != "Comment") {
          field.isReadOnly = 1;
        }
      }
    }
  }
}

window.userScript = {
  ...window.userScript,
  App_BTRIP_BusinessTripEdit
};
