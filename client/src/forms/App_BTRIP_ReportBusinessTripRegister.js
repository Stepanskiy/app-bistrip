import { restoreFormParam } from "../lib/common";
import dayjs from "dayjs";

export const App_BTRIP_ReportBusinessTripRegister = (form, core) => {
    return ({
        OnShow: () => {
            setFieldInitialValue(form);
        }
    });
}

function setFieldInitialValue(form) {
    let firmID = restoreFormParam("App_BTRIP_BusinessTripEdit", "FirmID");
    form.field("FirmID").value = firmID;
    
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    form.field("Period").value = [startOfMonth, endOfMonth];
}


window.userScript = {
    ...window.userScript,
    App_BTRIP_ReportBusinessTripRegister
};
