var Cloud = require('ti.cloud');
var AndroidPush = OS_ANDROID ? require('ti.cloudpush') : null;

// IOS Token
exports.initalize = function(_user, _pushRcvCallback, _callback) {
	USER_ID = _user.get("id");
	
	if (Ti.Platform.model === 'Simulator') {
		alert("Push ONLY works on Devices!");
		return;
	}
	
	// Only register push if we have a user logged in
	var userId = _user.get("id");
	
	if(userId) {
		if (OS_ANDROID) {
			//Reset any settings
			AndroidPush.clearStatus();
			
			//Set properties
			AndroidPush.debug = true;
			AndroidPush.showTrayNotificationsWhenFocused = true;
			
			AndroidPush.retrieveDeviceToken({
				success : function(_data) {
					Ti.API.debug("received device token", _data.deviceToken);
					
					//What to call when push is received
					AndroidPush.addEventListener('callback', _pushRcvCallback);
					
					//Set properties
					
					AndroidPush.enabled = true;
					AndroidPush.focusAppOnPush = false;
					
					pushRegisterSuccess(userId, _data, function(_response) {
						//save the device token locally
						Ti.App.Properties.setString('android.deviceToken',
						_data.deviceToken);
						
						_callback(_response);
					});
				},
				error : function(_data) {
					AndroidPush.enabled = false;
					AndroidPush.focusAppOnPush = false;
					AndroidPush.removeEventListener('callback', _pushRcvCallback);
					
					pushRegisterError(_data, _callback);
				}
			});
		} else {
			Ti.Network.registerForPushNotifications({
				types : [Ti.Network.NOTIFICATION_TYPE_BADGE,
						 Ti.Network.NOTIFICATION_TYPE_ALERT,
						 Ti.Network.NOTIFICATION_TYPE_SOUND
						 ],
				success : function(_data) {
					pushRegisterSuccess(_data, _callback);
				},
				error : function(_data) {
					pushRegisterError(_data, _callback);
				},
				callback : function(_data) {
					//what to call when push is received
					_pushRcvCallback(_data.data);
				}
			});
		}
	} else {
		_callback && _callback({
			success : false,
			msg : 'Must have User for Push Notifications',
		});
	}
};

function pushRegisterError(_data, _callback) {
	_callback && _callback({
		success : false,
		error : _data
	});
}

function pushRegisterSuccess(_userId, _data, _callback) {
	var token = _data.deviceToken;
	
	// clean up any previous registration of this device using saved device token
	Cloud.PushNotifications.unsubscribe({
		device_token :
	Ti.App.Properties.getString('android.deviceToken'),
		user_id : _userId,
		type : (OS_ANDROID) ? 'android' : 'ios'
	}, function(e) {
		exports.subscribe("friends", token, function(_resp1) {
			//if successful subscribe to the platform-specific channel
			if (_resp1.success) {
				
				_callback({
					success : true,
					msg : "Subscribe to channel: friends",
					data : _data,
				});
			} else {
				_callback({
					success : false,
					error : _resp2.data,
					msg : "Error Subscriing to channel: friends"
				});
			}
		});
	});
}
