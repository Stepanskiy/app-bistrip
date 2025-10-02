import _round from "lodash/round";


export const App_BTRIP_BusinessTripExpenseEdit = (form, core) => {
    return ({
        PlanPriceOnValueChanged:  () => {
            recalculatePlanAmount(form);    
        },
        PlanQuantityOnValueChanged:  () => {
            recalculatePlanAmount(form);    
        }
    });
}

function recalculatePlanAmount(form) {
    let qty = form.field("PlanQuantity").value || 0;
    let price = form.field("PlanPrice").value || 0;
    form.field("PlanAmount").value = _round(qty * price, 2);
}


window.userScript = {
    ...window.userScript,
    App_BTRIP_BusinessTripExpenseEdit
};
