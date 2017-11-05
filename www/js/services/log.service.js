app.factory('Log', function()
{
    function info(string, data, activate){
        activate = (angular.isUndefined(activate) ? true : activate);
        if( activate ){
            console.log('%c '+string, 'color: #5E8FCD;font-weight:bold', ( data || '' ));
        }
    }
    function success(string, data, activate){
        activate = (angular.isUndefined(activate) ? true : activate);
        if( activate ){
            console.log('%c '+string, 'color: #29B36E;font-weight:bold', ( data || '' ));
        }
    }
    function err(string, data, activate){
        activate = (angular.isUndefined(activate) ? true : activate);
        if( activate ){
            console.log('%c '+string, 'color: #e42112;font-weight:bold;', ( data || '' ));
        }
    }

    function DBException(e, sql, data, activate){
        activate = (angular.isUndefined(activate) ? true : activate);
        if( activate ){
            var message = ("Error({code}): {message} \nQuery {sql}")
            .replace('{message}', (e.message || ''))
            .replace('{code}', (e.code || ''))
            .replace('{sql}', sql);
            
            err(message, data, activate);
        }
    }

    return {
        err: err,
        info: info,
        success: success,
        DBException: DBException
    }
});