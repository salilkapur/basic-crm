/* Basic configuration.
 * This should be moved to a separate file ASAP.
 */
api_base_url = 'http://192.168.0.4:5000/'

// This is global variable used to keep track of the number of services for a customer
cst_service_count = 0;
cst_services = [];

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
    
    request.withCredentials = true;

    request.onload = function () {
        var data = null;
        if (request.status >= 200 && request.status < 400 && callback != null) {
            data = JSON.parse(this.response);
            callback(data)
        }
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

function getUTCTime() {
    var now = new Date();
    return now.getUTCFullYear() +'/' + now.getUTCMonth() + '/' + now.getUTCDate();
}

function hide_all_content() {
    document.getElementById('home-content').hidden = true;
    document.getElementById('li-home').classList.remove('active');
    document.getElementById('today-content').hidden = true;
    document.getElementById('li-today').classList.remove('active');
    document.getElementById('customers-content').hidden = true;
    document.getElementById('li-customers').classList.remove('active');
    document.getElementById('manage-content').hidden = true;
    document.getElementById('li-manage').classList.remove('active');
}

function goto_today() {
    hide_all_content();
    document.getElementById('today-content').hidden = false;
    document.getElementById('li-today').classList.add('active');
    console.log(getUTCTime());

    get_today_stats();
}

function goto_home() {
    hide_all_content();
    document.getElementById('home-content').hidden = false;
    document.getElementById('li-home').classList.add('active');

    reset_cst_information();
    reset_cst_service_box();
}

function goto_customers() {
    hide_all_content();
    document.getElementById('customers-content').hidden = false;
    document.getElementById('li-customers').classList.add('active');

    get_all_customers();
}

function goto_manage() {
    hide_all_content();
    document.getElementById('manage-content').hidden = false;
    document.getElementById('li-manage').classList.add('active');

    get_all_services(populate_services_manange_list);
    get_all_staff(populate_staff_manage_list);
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

function reset_cst_service_box() {
    cst_services = [];
    cst_service_count = 0;
    document.getElementById('cst_service_list').innerHTML = '';
    document.getElementById('cst_services').selectedIndex = 0;
    document.getElementById('cst_service_staff').selectedIndex = 0;
    document.getElementById('cst_service_location').selectedIndex = 0;
    get_all_services();
    get_all_staff();
}

function reset_cst_information() {
    document.getElementById('cst_id').value = '';
    document.getElementById('cst_name').value = '';
    document.getElementById('cst_phone_1').value = '';
    document.getElementById('cst_phone_2').value = '';
    document.getElementById('cst_address').value = '';
    document.getElementById('cst_dob').value = '';
    document.getElementById('cst_anniversary').value = '';
    document.getElementById('cst_gender').selectedIndex = 0;
}

function reset_home_content() {
    reset_cst_information();
    document.getElementById('customer-service').hidden = true;
    reset_cst_service_box();
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
    var ret = call_api(api_url, null, 'GET', auth_user_callback)
    print_api_result(ret)

    return true
}

function populate_today_stats(response_data) {
    document.getElementById('today_customers').innerHTML = response_data['customers'];
    document.getElementById('today_new_customers').innerHTML = response_data['new_customers'];
    document.getElementById('today_services').innerHTML = response_data['txn'];
}

function get_today_stats(callback=null) {
    api_url = prepare_api_get_url('get_today_stats');
    
    if (callback == null) {
        callback = populate_today_stats;
    }

    call_api(api_url, null, 'GET', callback);

    return true
}

function populate_all_customers_list(response_data) {
    var idx = 0;
    
    // Get the services element
    var services_list = document.getElementById('all-customers-list')
    services_list.innerHTML = '';
    for (idx = 0; idx < response_data.length; idx++) {
        service = response_data[idx];
        var child = document.createElement('div');
        child.classList.add('list-group-item');
        child.classList.add('list-group-item-action');
        var name_label = document.createElement('label');
        name_label.innerHTML = service.name;
        child.appendChild(name_label);
        child.append(document.createElement('br'));
        var phone_label = document.createElement('label');
        phone_label.classList.add('gray-color');
        phone_label.innerHTML = service.phone_1;
        if (service.phone_2 != '') {
            phone_label.innerHTML += ', ' + service.phone_2;
        }
        child.appendChild(phone_label);
        services_list.appendChild(child);
    }
}

function get_all_customers_callback(response_data) {
    populate_all_customers_list(response_data);
}

function get_all_customers(callback=null) {
    api_url = prepare_api_get_url('get_all_customers');
    
    if (callback == null) {
        callback = get_all_customers_callback;
    }

    var ret = call_api(api_url, null, 'GET', callback);
    print_api_result(ret);

    return true

}

function populate_services_manange_list(response_data) {
    var idx = 0;
    
    // Get the services element
    var services_list = document.getElementById('services-manage-list')
    services_list.innerHTML = '';
    for (idx = 0; idx < response_data.length; idx++) {
        service = response_data[idx];
        var child = document.createElement('a');
        child.classList.add('list-group-item');
        child.classList.add('list-group-item-action');
        child.innerHTML = service.name;
        services_list.appendChild(child);
    }
}

// Hopefully this is generic enough
function populate_services_list(response_data, dom_id) {
    // We have all the services. Populate the page with the data
    var idx = 0;

    // Get the services element
    var services_list = document.getElementById(dom_id);
    services_list.innerHTML = '';
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

function get_all_services(callback=null) {
    api_url = prepare_api_get_url('get_all_services');
    
    if (callback == null) {
        callback = get_all_services_callback;
    }

    var ret = call_api(api_url, null, 'GET', callback);
    print_api_result(ret);

    return true
}

function populate_staff_manage_list(response_data) {
    var idx = 0;

    // Get the staff element
    var staff_list = document.getElementById('staff-manage-list');
    staff_list.innerHTML = '';
    for (idx = 0; idx < response_data.length; idx++) {
        staff = response_data[idx];
        var child = document.createElement('a');
        child.classList.add('list-group-item');
        child.classList.add('list-group-item-action');
        child.innerHTML = staff.name;
        staff_list.appendChild(child);
    }

}


// Hopefully this is generic enough
function populate_staff_list(response_data, dom_id) {
    // We have all the staff. Populate the page with the data
    var idx = 0;

    // Get the staff element
    var staff_list = document.getElementById(dom_id)
    staff_list.innerHTML = '';
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

function get_all_staff(callback=null) {
    api_url = prepare_api_get_url('get_all_staff');
    
    if (callback == null) {
        callback = get_all_staff_callback;
    }

    var ret = call_api(api_url, null, 'GET', callback);
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
    reset_cst_service_box();
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
}

function add_new_customer_callback() {
    // New customer added. Search for the customer.
    search_cst_phone();
}

function add_new_customer() {
    // Check all required fields are present
    args = {}

    reset_cst_error();
    args['cst_name'] = document.getElementById('cst_name').value;
    args['cst_phone_1'] = document.getElementById('cst_phone_1').value;
    args['cst_phone_2'] = document.getElementById('cst_phone_2').value;
    args['cst_address'] = document.getElementById('cst_address').value;
    args['cst_gender_idx'] = document.getElementById('cst_gender').selectedIndex; 
    args['cst_dob'] = document.getElementById('cst_dob').value;
    args['cst_anniversary'] = document.getElementById('cst_anniversary').value;

    if (args['cst_name'] == '') {
        display_cst_error('Please enter customer name');
        return
    }

    if (args['cst_phone_1'] == '' && args['cst_phone_2'] == '') {
        display_cst_error('Please enter phone number');
        return
    }
    
    if (args['cst_gender_idx'] == 0) {
        display_cst_error('Please select gender');
        return
    }

    api_url = prepare_api_get_url('add_new_customer', args);
    var ret = call_api(api_url, null, 'GET', add_new_customer_callback);
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
    delete_button.onclick = function () { delete_cst_service(id); };
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

function delete_cst_service(id) {
    // Remove this entry from the list of services
    cst_services[id]['staff_id'] = -1;
    cst_services[id]['service_id'] = -1;
    document.getElementById('cst_service_' + id).hidden = true;
}

function add_new_cst_service() {
    var services_list = document.getElementById('cst_services');
    if (services_list.selectedIndex == 0)
        return;

    var service = services_list.options[services_list.selectedIndex].innerHTML;
    var service_id = services_list.options[services_list.selectedIndex].value;
    
    var staff_list = document.getElementById('cst_service_staff');
    if (staff_list.selectedIndex == 0)
        return;

    var staff = staff_list.options[staff_list.selectedIndex].innerHTML;
    var staff_id = staff_list.options[staff_list.selectedIndex].value;
    
    var customer_id = document.getElementById('cst_id').value;
    var service_location = document.getElementById('cst_service_location').selectedIndex;
    if (service_location == 0)
        return;

    create_new_service_element(cst_service_count, service, staff);
    cst_service_count = cst_service_count + 1; 
    cst_services.push({'customer_id': customer_id, 'staff_id': staff_id, 'service_id': service_id, 'location': service_location});
    services_list.selectedIndex = 0;
    staff_list.selectedIndex = 0;
}

function cst_done() {
    var idx = 0;
    for(idx = 0; idx < cst_services.length; idx++) {
        if (cst_services[idx]['staff_id'] == -1 || cst_services[idx]['service_id'] == -1) {
            continue;
        }
        api_url = prepare_api_get_url('add_customer_transaction', cst_services[idx]);
        var ret = call_api(api_url, null, 'GET', null)
    }
    reset_home_content();
}

function add_new_service_callback() {
    get_all_services(populate_services_manange_list);
}

function add_new_service() {
    var service = document.getElementById('service_name').value;
    if (service == '')
        return;

    args = {};
    args['service_name'] = service;
    args['service_price'] = 0;
    api_url = prepare_api_get_url('add_new_service', args);    
    var ret = call_api(api_url, null, 'GET', add_new_service_callback)
    document.getElementById('service_name').value = '';
}

function init_main() {

    get_all_services();
    get_all_staff();

}
