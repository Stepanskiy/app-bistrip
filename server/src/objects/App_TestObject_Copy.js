import ApiObjectInitializer from 'd5-api-initializer';

new ApiObjectInitializer('App_TestObject_Copy', {
    List: (apiCore, apiRequest, apiResponse) => {
        const response = apiRequest.invoke().getResponse();


        apiResponse.response = {[apiRequest.objectName]: [{abc: 2}]};
    },
});
