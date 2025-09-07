import { getEnum, paymentStatusEnum } from "../lib/enums";


export const App_BTRIP_PaymentList = (form, core) => {
    return ({
        OnInit: () => {
            form.field("Status").datasource = getEnum(paymentStatusEnum);
        }
    });
}




window.userScript = {
    ...window.userScript,
    App_BTRIP_PaymentList
};
