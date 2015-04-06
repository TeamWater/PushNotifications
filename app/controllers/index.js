function doClick(e) {
    alert($.label.text);
}

$.index.open();

$.loginSuccessAction = function(_options) {
	initializePushNotifications(_options.model);

funcion initializePushNotifications(_user) {
	
	Alloy.Globals.pushToken = null;
	var pushLib = require('pushNotifications');
	
	//Initialize Push Notifications
	pushLib.initialize(_user),
	//notification received callback
	function(_pushData) {
		Ti.API.info('I GOT A PUSH NOTIFICATION');
		// get the pyaload from th proper place depending on what platform you are on
		var payload;
		
		try{
			if (_pushData.payload) {
				payload = JSON.parse(_pushData.payload);
			} else {
				payload = _pushData;
			}
		} catch(e) {
			payload = {};
		}
		
		//display the information in an alert
		if (OS_ANDROID) {
			Ti.UI.createAlertDialod({
				title : payload.android.title || "Alert",
				message : payload.android.alert || "",
				buttonNames : ['Ok']
			}).show();
		} else {
			Ti.UI.createAlertDialog({
				title : "Alert",
				message : payload.alert || "",
				buttonNames : ['Ok']
			}).show();
		}
	},
	
	// registration callback parameter
	function(_pushInitData) {
		if(_pushInitData.success) {
			//save the token so we know itw as initalized
			Alloy.Globals.pushToken = _pushInitData.data.deviceToken;
			
			Ti.API.debug("Success: Initializing Push NOtifications " + 
			JSON.stringify(_pushInitData));
		} else {
			alert("Error Initializnig Push Notification");
			Alloy.Globals.pushToken = null;
		}
	};
};