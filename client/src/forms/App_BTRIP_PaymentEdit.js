import { restoreFormParam, getCurrentUser } from "../lib/common";
import dayjs from "dayjs";
import _round from "lodash/round";


export const App_BTRIP_PaymentEdit = (form, core) => {
    return ({
        OnShow: async () => {
            await setFieldInitialValue(form, core);
        },

        OnSave: (event) => {
            fillFiledsBeforeSaving(form);
        }
    });
}


async function setFieldInitialValue(form,core) {
    let firmID = restoreFormParam("App_BTRIP_PaymentEdit", "FirmID");
    let businessTripID = restoreFormParam("App_BTRIP_PaymentEdit", "BusinessTripID");
    if (form.field("ID").value == null) {
        if (firmID instanceof Array) {
            form.field("FirmID").value = firmID[0];
        } else {
            form.field("FirmID").value = firmID;
        }
        form.field("BusinessTripID").value = businessTripID;
        form.field("Date").value = dayjs().format("YYYY-MM-DD");
        // заповнення поточного користувача у платежі
        let userInfo = await getCurrentUser(core);
        console.log("### userInfo",userInfo);
        let authorID = userInfo["PersonID"];
        if (authorID) {
            form.field("AuthorID").value = authorID;
        }
    }
}

function fillFiledsBeforeSaving(form) {

    form.field("ContractCurrencyID").value = form.field("PaymentCurrencyID").value;
    let vatRate = form.field("VATRate").value || 0;
    form.field("PaymentAmount").value = _round(form.field("PaymentAmountGross").value / (1 + vatRate/100),2);
    form.field("ContractAmount").value = form.field("PaymentAmount").value;
    form.field("VATAmount").value = form.field("PaymentAmountGross").value - form.field("PaymentAmount").value;

}



window.userScript = {
    ...window.userScript,
    App_BTRIP_PaymentEdit
};
