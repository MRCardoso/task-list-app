app.service('messageBox', ["$rootScope", "$ionicPopup", function($rootScope, $ionicPopup)
{
	var boxConfirm = null;
	
	this.alert = function(title, message, $scope, buttons)
	{
		var params = {
			template: message,
			title: title,
			scope: $scope
		};
		if( buttons != undefined ){
			params.buttons = buttons;
		}
		$ionicPopup.alert(params);
	};

	this.confirm = function(config, $scope)
	{
		if( boxConfirm == null)
		{
			boxConfirm = $ionicPopup.confirm({
				template: config.message || 'Do you really wish do this action?',
				title: config.title || 'Confirmation',
				scope: $scope,
				buttons: [
					{
						text: config.btnCancel || 'Cancel',
						type: config.classCancel || 'button-light',
						onTap: function(e){ 
							boxConfirm = null;
							
							if( config.fail != undefined )
								config.fail();
						}
					},
					{
						text: config.btnOk || 'OK',
						type: config.classOk || 'button-blue-inverse', 
						onTap: function(e){
							boxConfirm = null;
							config.success(e);
						}
					}
				]
			});
		}
	};
}])