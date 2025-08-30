import _find from "lodash/find";
import _map from "lodash/map";
import _isEmpty from "lodash/isEmpty";
import { saveFormParam } from "../lib/common";
import { getEnum, BusinessTripStatus, BusinessTripTypes } from "../lib/enums";

/**
 * @param {D5TableForm} form
 * @param {D5Core} core
 */
const App_BTRIP_BusinessTripList = (form, core) => {
  return ({
    OnInit: () => {
      form.filterField("IsPassed").defaultValue = 0;
      setFieldInitialValue(form);
      form.field("TripType").datasource = getEnum(BusinessTripTypes);
      form.field("ApproveStatus").datasource = getEnum(BusinessTripStatus);
      form.filterField("TripType").datasource = getEnum(BusinessTripTypes);
      form.filterField("ApproveStatus").datasource = getEnum(BusinessTripStatus);
    },
    OnShow: () => {
      saveFormParam("App_BTRIP_BusinessTripEdit", "FirmID", form.filterField("FirmID").value);
      setFieldInitialValue(form);
    },
    OnApplyFilter: () => {
      saveFormParam("App_BTRIP_BusinessTripEdit", "FirmID", form.filterField("FirmID").value);
      setFieldInitialValue(form);
    },
    FirmIDOnValueChanged: () => {
      setFieldInitialValue(form);
    },
    btnSetApprovedOnClick: async () => {
      await setApprove(form, core, 1)
    },
    btnSetRejectedOnClick: async () => {
      await setApprove(form, core, 2)
    },
    btnSetNewOnClick: async () => {
      await setApprove(form, core, 0)
    },
    btnGrEditOnClick: async (button, defaultHandler) => {
      let selectedRows = form.selectedRows;
      let notNewTrips = _find(selectedRows, (a) => a.data.ApproveStatus > 0);
      if (!_isEmpty(notNewTrips)) {
        return core.showWarning("Серед обраних є затверджені або закриті. Операція не можлива!");
      } else {
        await defaultHandler();
      }
    }

  });
}


function setFieldInitialValue(form) {
  let firmID = form.filterField("FirmID").value || -1;
  form.filterField("PersonID").filter = { "FirmID": firmID };
  form.filterField("ApprovedByPersonID").filter = { "FirmID": firmID };
  form.subForm("TableExpenses").filterField("NomenclatureID").filter = { "FirmID": firmID, "NomenclatureKindID": 4 };
}

async function setApprove(form, core, status) {
    let selRows = form.selectedRows;
    let keys = _map(selRows, (a) => a.key);
    if (_isEmpty(selRows)) {
      core.showWarning("Не обрано жодного рядка!");
      return;
    }

    // add confirm question
    let question = "";
    if (status === 0) {
      question = "Зробити обрані відрядження новими?";
    } else if (status === 1) {
      question = "Затвердити обрані відрядження?";
    } else if (status === 2) {
      question = "Відхилити обрані відрядження?";
    }
    let userAnswer = await core.showConfirmDialog(
        question,
        ["no", "yes"],
        "Питання"
    );
    if(userAnswer !== "yes"){
        return;
    }


    let modRequest = [];
    for (let row of selRows) {
      modRequest.push({"ID": row.data["ID"], "ApproveStatus": status});
    }
    if (!_isEmpty(modRequest)) {
      let modResult = await core.execObjectOperation("App_BTRIP_BusinessTrips", "Approve",
        {"Request":{"App_BTRIP_BusinessTrips": modRequest}}
      );  
      let isError = false;
      if (!_isEmpty(modResult)) {
          let result = Number(modResult["ResponseCode"]);
          let message = modResult["ResponseText"];
          if (result > 400) {
              core.showError(message);
              isError = true;
          } else {
              if (status === 0) {
                  core.showSuccess("Обрані відрядження стали новими"); 
              }
              if (status === 1) {
                  core.showSuccess("Обрані відрядження затверджені"); 
              }
              if (status === 2) {
                  core.showSuccess("Обрані відрядження відхилені"); 
              }
          }
      } else {
          if (status === 0) {
              core.showSuccess("Обрані відрядження стали новими"); 
          }
          if (status === 1) {
              core.showSuccess("Обрані відрядження затверджені"); 
          }
          if (status === 2) {
              core.showSuccess("Обрані відрядження відхилені"); 
          }
      }
    }
    if (!isError) {
      await form.refreshRecords(keys);  
    }

}

window.userScript = {
  ...window.userScript,
  App_BTRIP_BusinessTripList
};
