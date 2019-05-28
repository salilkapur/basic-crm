function goto_home() {
    hide_all_content();
    document.getElementById('home-content').hidden = false;
    document.getElementById('li-home').classList.add('active');
    document.getElementById('customer-service').hidden = true;
    reset_cst_information();
    reset_cst_service_box();
}

function reset_home_content() {
    reset_cst_information();
    document.getElementById('customer-service').hidden = true;
    reset_cst_service_box();
}

function get_all_customers_callback(response_data) {
    populate_all_customers_list(response_data, 1);
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
        display_error('Customer not found. Please add a new customer');
    }
    reset_cst_service_box();
}

function search_cst_phone() {
    args = {};
    args['key'] = 'phone';
    args['value'] = document.getElementById('cst_phone_1').value;
    // args['name_value'] = document.getElementById('cst_name').value;

    reset_cst_error();

    if (document.getElementById('cst_phone_1').value == '' &&
        document.getElementById('cst_phone_2').value == '') {

        display_error('Please enter phone number');
        return
    }

    api_url = prepare_api_get_url('search_customer', args);
    var ret = call_api(api_url, null, 'GET', search_customer_callback);
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

function add_new_customer_callback(res) {
    // New customer added. Search for the customer.
    // console.log("ere")
    // console.log(res)
    if (res.toString().localeCompare('false') == 0){
        // console.log("in if")
        display_error('Number already exists')

    }
    else{
        search_cst_phone();
    }
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
        display_error('Please enter customer name');
        return
    }

    if (args['cst_phone_1'] == '' && args['cst_phone_2'] == '') {
        display_error('Please enter phone number');
        return
    }

    if (args['cst_gender_idx'] == 0) {
        display_error('Please select gender');
        return
    }

    api_url = prepare_api_get_url('add_new_customer', args);
    var ret = call_api(api_url, null, 'GET', add_new_customer_callback);
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
    document.getElementById('cst_service_location').selectedIndex = 0;
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

// Hopefully this is generic enough
function populate_staff_list(response_data, dom_id) {
    // We have all the staff. Populate the page with the data
    var idx = 0;

    // Get the staff element
    var staff_list = document.getElementById(dom_id)
    staff_list.innerHTML = '';
    var child = document.createElement('option');
    child.innerHTML = "Staff...";
    staff_list.appendChild(child);

    for (idx = 0; idx < response_data.length; idx++) {
        staff = response_data[idx];
        if (staff.is_active == 1){
        	var child = document.createElement('option');
        	child.value = staff.staff_id;
        	child.innerHTML = staff.name;
        	staff_list.appendChild(child);
        }
        
    }
}