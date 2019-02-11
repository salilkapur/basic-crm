/* Basic configuration.
 * This should be moved to a separate file ASAP.
 */
api_base_url = 'http://localhost:5000/'

// This is global variable used to keep track of the number of services for a customer
cst_service_count = 0;

window.onload = init_main()

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
        console.log(this.response);
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

function print_api_result(ret) {
    console.log('API RETURN: ', ret)
    if (ret == true)
        console.log('API call successfully made')
    else
        console.log('Unable to make API call')
}

function display_cst_error(message) {
    var cst_error = document.getElementById('cst_error');
    cst_error.hidden = false;
    cst_error.innerHTML = message;
}

function reset_cst_error() {
    var cst_error = document.getElementById('cst_error');
    cst_error.innerHTML = '';
    cst_error.hidden = true;
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
    print_api_result(ret)

    return true
}

// Hopefully this is generic enough
function populate_services_list(response_data, dom_id) {
    // We have all the services. Populate the page with the data
    var idx = 0;

    // Get the services element
    var services_list = document.getElementById(dom_id)
    for (idx = 0; idx < response_data.length; idx++) {
        service = response_data[idx];
        var child = document.createElement('option');
        child.value = service.service_id;
        child.innerHTML = service.name;
        services_list.appendChild(child);
    }
}

function get_all_services_callback(response_data) {
    populate_services_list(response_data, 'cst_services')
}

function get_all_services() {
    api_url = prepare_api_get_url('get_all_services');
    
    var ret = call_api(api_url, null, 'GET', get_all_services_callback);
    print_api_result(ret);

    return true
}


// Hopefully this is generic enough
function populate_staff_list(response_data, dom_id) {
    // We have all the staff. Populate the page with the data
    var idx = 0;
    console.log(response_data);
    // Get the staff element
    var staff_list = document.getElementById(dom_id)
    for (idx = 0; idx < response_data.length; idx++) {
        staff = response_data[idx];
        var child = document.createElement('option');
        child.value = staff.staff_id;
        child.innerHTML = staff.name;
        staff_list.appendChild(child);
    }
}

function get_all_staff_callback(response_data) {
    populate_staff_list(response_data, 'cst_service_staff')
}

function get_all_staff() {
    api_url = prepare_api_get_url('get_all_staff');

    var ret = call_api(api_url, null, 'GET', get_all_staff_callback);
    print_api_result(ret);
}

function populate_customer_info(cst_info) {
    document.getElementById('cst_id').value = cst_info.customer_id;
    document.getElementById('cst_name').value = cst_info.name;
    document.getElementById('cst_phone_1').value = cst_info.phone_1;
    document.getElementById('cst_phone_2').value = cst_info.phone_2;
    document.getElementById('cst_address').value = cst_info.address;
    if (cst_info.gender.toUpperCase() == 'MALE')
        document.getElementById('cst_gender_male').selected = true;
    else if (cst_info.gender.toUpperCase() == 'FEMALE')
        document.getElementById('cst_gender_female').selected = true;
    
    var cst_dob = new Date(cst_info.dob);
    if (isNaN(cst_dob.getUTCDate())) {
        document.getElementById('cst_dob').value = '';
    } else {
        document.getElementById('cst_dob').value = cst_dob.getUTCDate() +'/' + (cst_dob.getUTCMonth() + 1); 
    }

    var cst_anniversary = new Date(cst_info.anniversary);
    if (isNaN(cst_anniversary.getUTCDate())) {
        document.getElementById('cst_anniversary').value = '';
    }
    else {
        document.getElementById('cst_anniversary').value = cst_anniversary.getUTCDate() +'/' + (cst_anniversary.getUTCMonth() + 1); 
    }
}

function search_customer_callback(response_data) {

    var add_cst = document.getElementById('btn_add_cst')
    reset_cst_error();

    if (response_data != null) {
        add_cst.hidden = true;
        //Populate customer information
        populate_customer_info(response_data);
        // Show services box
        document.getElementById('customer-service').hidden = false;
    }
    else {
        // Show the add customer button.
        add_cst.hidden = false;
        display_cst_error('Customer not found. Please add a new customer');
    }
}

function search_cst_phone() {
    args = {};
    args['key'] = 'phone';
    args['value'] = document.getElementById('cst_phone_1').value;

    reset_cst_error();

    if (document.getElementById('cst_phone_1').value == '' &&
        document.getElementById('cst_phone_2').value == '') {

        display_cst_error('Please enter phone number');
        return
    }

    api_url = prepare_api_get_url('search_customer', args);
    var ret = call_api(api_url, null, 'GET', search_customer_callback);
    print_api_result(ret);
}

function add_new_cst() {
    // Check all required fields are present
    args = {}

    reset_cst_error();

    if (document.getElementById('cst_name').value == '') {
        display_cst_error('Please enter customer name');
    }

    if (document.getElementById('cst_phone_1').value == '' &&
        document.getElementById('cst_phone_2').value == '') {
        display_cst_error('Please enter phone number');
    }

}

function create_new_service_element(id, service, staff) {
    var list_element = document.createElement('li');
    list_element.classList.add('list-group-item');
    list_element.classList.add('clearfix');
    list_element.id = 'cst_service_' + id;

    var span_button = document.createElement('span');
    span_button.classList.add('button-group');

    var delete_button = document.createElement('button');
    delete_button.classList.add('btn');
    delete_button.classList.add('btn-outline-danger');
    delete_button.classList.add('btn-sm');
    delete_button.id = 'cst_service_del_btn_' + id;
    span_button.appendChild(delete_button)

    var span_fas_times = document.createElement('span');
    span_fas_times.classList.add('fas');
    span_fas_times.classList.add('fa-times');
    
    delete_button.appendChild(span_fas_times);
    list_element.appendChild(span_button);
    
    list_element.appendChild(document.createTextNode(' '));

    var span_name = document.createElement('span');
    span_name.classList.add('label');
    span_name.classList.add('label-default');
    span_name.innerHTML = service + ' - ' + staff;
    list_element.appendChild(span_name);

    document.getElementById('cst_service_list').appendChild(list_element);
}

function add_new_cst_service() {
    var services_list = document.getElementById('cst_services');
    var service = services_list.options[services_list.selectedIndex].innerHTML;

    var staff_list = document.getElementById('cst_service_staff');
    var staff = staff_list.options[staff_list.selectedIndex].innerHTML;

    create_new_service_element(cst_service_count, service, staff);
    cst_service_count = cst_service_count + 1; 
    cst_services = Array()
}

function init_main() {

    get_all_services();
    get_all_staff();

}
