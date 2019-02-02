/* Basic configuration.
 * This should be moved to a separate file ASAP.
 */
api_base_url = 'http://localhost:5000/'

// A utility function to make API calls
function call_api(url, data, method, callback) {
    var request = new XMLHttpRequest();
    if (method == 'GET') {
        request.open('GET', url, true)
    }
    else {
        return false
    }

    request.onload = function () {
        var data = JSON.parse(this.response);
        if (request.status < 200 || request.status >= 400) {
            data = null
        }
        callback(data)
    }
    
    request.send()

    return true
}

function prepare_api_get_url(api_url, args) {
    args_str="?";
    for(var key in args) {
        args_str = args_str + key + "=" + args[key];
        args_str = args_str + "&";
    }
    args_str = args_str.substring(0, args_str.length - 1)
    return api_base_url + api_url + args_str;
}

// User authentication functions
function auth_user_callback(response_data) {
    console.log(response_data)    
}

function auth_user () {
    args = {};
    args['username']='salil';
    args['password']='salil';

    api_url = prepare_api_get_url('auth_user', args);    
    console.log(api_url)
    var ret = call_api(api_url, null, 'GET', auth_user_callback)
    if (ret == true)
        console.log('API call successfully made')
    else
        console.log('Unable to make API call')

    return true
}
