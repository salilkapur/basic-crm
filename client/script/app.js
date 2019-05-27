/* Basic configuration.
 * This should be moved to a separate file ASAP.
 */
// api_base_url = 'http://34.226.121.100:5000/'
api_base_url = 'http://0.0.0.0:5000/'

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
    // console.log("yeah")     

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
    var now = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    now = new Date(now);
    return now.getUTCFullYear() +'/' + now.getUTCMonth() + '/' + now.getUTCDate();
}

function hide_all_content() {
    document.getElementById('home-content').hidden = true;
    document.getElementById('li-home').classList.remove('active');
    document.getElementById('today-content').hidden = true;
    document.getElementById('li-today').classList.remove('active');
    document.getElementById('customers-content').hidden = true;
    document.getElementById('li-customers').classList.remove('active');
    document.getElementById('services-content').hidden = true;
    document.getElementById('li-services').classList.remove('active');
    document.getElementById('staff-content').hidden = true;
    document.getElementById('li-staff').classList.remove('active');
}

function goto_today() {
    hide_all_content();
    document.getElementById('today-content').hidden = false;
    document.getElementById('li-today').classList.add('active');

    get_today_stats();
    get_today_customers_list();
}

function goto_home() {
    hide_all_content();
    document.getElementById('home-content').hidden = false;
    document.getElementById('li-home').classList.add('active');
    document.getElementById('customer-service').hidden = true;
    reset_cst_information();
    reset_cst_service_box();
}

function goto_customers() {
    hide_all_content();
    document.getElementById('customers-content').hidden = false;
    document.getElementById('li-customers').classList.add('active');
    document.getElementById('cst_search_location').selectedIndex = 0

    get_all_customers();
}

function goto_services() {
    hide_all_content();
    document.getElementById('services-content').hidden = false;
    document.getElementById('li-services').classList.add('active');

    get_all_services(populate_services_manange_list);
}

function goto_staff() {
    hide_all_content();
    document.getElementById('staff-content').hidden = false;
    document.getElementById('li-staff').classList.add('active');

    get_all_staff(populate_staff_manage_list);
}

function print_api_result(ret) {
    console.log('API RETURN: ', ret)
    if (ret == true)
        console.log('API call successfully made')
    else
        console.log('Unable to make API call')
}

function display_error(message, element_id=null) {
    if (element_id == null) {
        element_id = 'cst_error'
    }
    else if (element_id == 'staff_error'){
        element_id = 'staff_error'
    }
    else if (element_id == 'staff_error_modal'){
        element_id = 'staff_error_modal'        
    }
    else {
        element_id = 'edit_cst_error'
    }

    var error = document.getElementById(element_id);
    error.hidden = false;
    error.innerHTML = message;
}

function reset_cst_error() {
    var cst_error = document.getElementById('cst_error');
    cst_error.innerHTML = '';
    cst_error.hidden = true;
    var cst_error = document.getElementById('edit_cst_error');
    cst_error.innerHTML = '';
    cst_error.hidden = true;
}

function reset_staff_error() {
    var error = document.getElementById('staff_error');
    error.innerHTML = '';
    error.hidden = true;
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

function reset_staff_information() {
    document.getElementById('staff_name').value = '';
    document.getElementById('staff_phone_1').value = '';
    document.getElementById('staff_address').value = '';
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

function client_search_callback(res){
    populate_all_customers_list(res, 1)
}

function client_search(){
    var location = document.getElementById('cst_search_location');
    var search_text = document.getElementById('search_name').value;
    var index = location.selectedIndex;
    args = {};
    args['location'] = index;
    args['search_text'] = search_text;

    api_url = prepare_api_get_url('client_search', args);
    var ret = call_api(api_url, null, 'GET', client_search_callback);

}

function populate_customers_today_list(response_data) {
    var idx = 0;

    // Get the services element
    var services_list = document.getElementById('today-customers-list')
    services_list.innerHTML = '';
    for (idx = 0; idx < response_data.length; idx++) {
        customer = response_data[idx];
        var child = document.createElement('div');
        child.classList.add('list-group-item');
        child.classList.add('list-group-item-action');
        child.dataset.target = customer.customer_id;
        child.onclick = function() {get_today_customer_services(event) };
        var name_label = document.createElement('label');
        name_label.innerHTML = customer.name;
        child.appendChild(name_label);
        child.append(document.createElement('br'));
        var services_label = document.createElement('label');
        services_label.classList.add('gray-color');
        services_label.innerHTML = customer.services;
        //child.appendChild(services_label);
        services_list.appendChild(child);
    }
}

function get_today_customers_list_callback(response_data) {
    populate_all_customers_list(response_data, 2);
}

function get_today_customers_list(callback=null) {
    api_url = prepare_api_get_url('get_today_customers');

    if (callback == null) {
        callback = get_today_customers_list_callback;
    }

    var ret = call_api(api_url, null, 'GET', callback);
    print_api_result(ret);

    return true
}

function get_today_customer_services_callback(response_data) {
    var idx = 0;

    // Get the services element
    var services_list = document.getElementById('today-customer-service-list')
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

function get_today_customer_services(event, callback=null) {
    args = {};
    args['customer_id'] = event.target.getAttribute('data-target');

    api_url = prepare_api_get_url('get_today_customer_services', args);

    if (callback == null) {
        callback = get_today_customer_services_callback;
    }

    var ret = call_api(api_url, null, 'GET', callback);
    print_api_result(ret);

    return true
}
function edit_customer_callback(res){

    var editlabel = document.getElementById("edit_customer");
    if (res.toString().localeCompare('false') == 0){
        // console.log("in if")
        display_error('Number already exists')

    }
    else{

        editlabel.hidden = false;
    }
}

function edit_cst_info(ph1, ph2){
    args = {}

    reset_cst_error();
    args['key1'] = ph1;
    args['key2'] = ph2;
    args['cst_name'] = document.getElementById('edit_cst_name').value;
    args['cst_phone_1'] = document.getElementById('edit_cst_phone_1').value;
    args['cst_phone_2'] = document.getElementById('edit_cst_phone_2').value;
    args['cst_address'] = document.getElementById('edit_cst_address').value;
    args['cst_gender_idx'] = document.getElementById('edit_cst_gender').selectedIndex;
    args['cst_dob'] = document.getElementById('edit_cst_dob').value;
    args['cst_anniversary'] = document.getElementById('edit_cst_anniversary').value;

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

    api_url = prepare_api_get_url('edit_customer', args);
    var ret = call_api(api_url, null, 'GET', edit_customer_callback);


}

function populate_all_customers_list(response_data, id) {
    var idx = 0;

    // Get the services element
    var services_list = '';
    if (id == 1){
        services_list = document.getElementById('all-customers-list')
    }
    else if (id == 2){
        services_list = document.getElementById('today-customers-list')
    }
    
    var modal = document.getElementById("editModal");
    var editlabel = document.getElementById("edit_customer");
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
      modal.style.display = "none";
    }

    var viewmodal = document.getElementById("viewModal");
    window.onclick = function(event) {
      if (event.target == viewmodal) {
        viewmodal.style.display = "none";
        var viewList = document.getElementById("view_service_list");
        while (viewList.firstChild) {
            viewList.removeChild(viewList.firstChild);
        }
      }
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

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
        child.append(document.createElement('br'));
        var edit_btn = document.createElement('button');
        edit_btn.classList.add('btn');
        edit_btn.classList.add('btn-default');
        edit_btn.classList.add('btn-sm');
        edit_btn.innerHTML = "Edit ";
        edit_btn.id = "edit_btn" + service.phone_1.toString();
        // console.log(edit_btn.id);
        var edit_span = document.createElement('span');
        edit_span.classList.add('glyphicon')
        edit_span.classList.add('glyphicon-edit')
        edit_btn.appendChild(edit_span);
        edit_btn.style.margin = "10px"
        child.append(edit_btn)
        edit_btn.onclick = (function(service){
            return function(){
                editlabel.hidden = true;
                modal.style.display = "block";
                populate_customer_editinfo(service);
            }
        })(service);

        var view_btn = document.createElement('button');
        view_btn.classList.add('btn');
        view_btn.classList.add('btn-default');
        view_btn.classList.add('btn-sm');
        view_btn.innerHTML = "View ";
        var view_span = document.createElement('span');
        view_span.classList.add('glyphicon');
        view_span.classList.add('glyphicon-eye-open');
        view_btn.appendChild(view_span);
        view_btn.style.margin = "10px";
        child.append(view_btn);
         view_btn.onclick = (function(service){
            return function(){
               viewmodal.style.display = "block";
               document.getElementById("infoTab").click()
               populate_customer_viewinfo(service);

            }
        })(service);
        services_list.appendChild(child);
    }
}

function get_transaction_user_callback(res){
    var txn_list = document.getElementById('view_service_list')

    for (idx = 0; idx < res.length; idx++){
        service = res[idx];
        var child = document.createElement('div');

        child.classList.add('list-group-item');
        child.classList.add('list-group-item-action');
        var info_card = document.createElement('dl');
        info_card.classList.add('dl-horizontal');

        var info_name = document.createElement('dt');
        info_name.innerHTML = 'Service';
        info_card.appendChild(info_name);
        var info_name_res = document.createElement('dd');
        info_name_res.innerHTML = service.srv_name;
        info_card.appendChild(info_name_res);

        var service_price = document.createElement('dt');
        service_price.innerHTML = 'Price';
        info_card.appendChild(service_price);
        var service_price_res = document.createElement('dd');
        service_price_res.innerHTML = service.srv_price;
        info_card.appendChild(service_price_res);

        var staff_name = document.createElement('dt');
        staff_name.innerHTML = 'Staff name';
        info_card.appendChild(staff_name);
        var staff_name_res = document.createElement('dd');
        staff_name_res.innerHTML = service.staff_name;
        info_card.appendChild(staff_name_res);

        var txn_date = document.createElement('dt');
        txn_date.innerHTML = 'Date';
        info_card.appendChild(txn_date);
        var txn_date_res = document.createElement('dd');
        txn_date_res.innerHTML = service.txn_time;
        info_card.appendChild(txn_date_res);

        var location = document.createElement('dt');
        location.innerHTML = 'Location';
        info_card.appendChild(location);
        var location_res = document.createElement('dd');
        if (service.location == 1){
            location_res.innerHTML = 'Chuna Bhatti';
        }
        else if (service.location == 2){
            location_res.innerHTML = 'Lal Ghati';
        }
        info_card.appendChild(location_res);

        child.appendChild(info_card);
        txn_list.appendChild(child);

    }

}

function populate_customer_viewinfo(cst_info){

    args = {}

    reset_cst_error();
    args['cst_id'] = cst_info.customer_id

    document.getElementById('viewName').innerHTML = cst_info.name;
    document.getElementById('viewPhone_1').innerHTML = cst_info.phone_1;
    document.getElementById('viewPhone_2').innerHTML = cst_info.phone_2;
    document.getElementById('viewGender').innerHTML = cst_info.gender.toString();
    // if (cst_info.address != '')
    document.getElementById('viewAddress').innerHTML = cst_info.address;
    var cst_dob = new Date(cst_info.dob);
    if (isNaN(cst_dob.getUTCDate())) {
        document.getElementById('viewDob').innerHTML = '-';
    } else {
        document.getElementById('viewDob').innerHTML = cst_dob.getUTCDate() +'/' + (cst_dob.getUTCMonth() + 1);
    }

    var cst_anniversary = new Date(cst_info.anniversary);
    if (isNaN(cst_anniversary.getUTCDate())) {
        document.getElementById('viewAnniversary').innerHTML = '-';
    }
    else {
        document.getElementById('viewAnniversary').innerHTML = cst_anniversary.getUTCDate() +'/' + (cst_anniversary.getUTCMonth() + 1);
    }
    api_url = prepare_api_get_url('get_transaction_user', args);
    var ret = call_api(api_url, null, 'GET', get_transaction_user_callback);

}

function populate_customer_editinfo(cst_info) {
    document.getElementById('edit_cst_id').value = cst_info.customer_id;
    document.getElementById('edit_cst_name').value = cst_info.name;
    document.getElementById('edit_cst_phone_1').value = cst_info.phone_1;
    document.getElementById('edit_cst_phone_2').value = cst_info.phone_2;
    // if (cst_info.address != '')
    document.getElementById('edit_cst_address').value = cst_info.address;

    if (cst_info.gender.toString().toUpperCase() == 'MALE')
        document.getElementById('edit_cst_gender_male').selected = true;
    else if (cst_info.gender.toString().toUpperCase().toString() == 'FEMALE')
        document.getElementById('edit_cst_gender_female').selected = true;

    var cst_dob = new Date(cst_info.dob);
    if (isNaN(cst_dob.getUTCDate())) {
        document.getElementById('edit_cst_dob').value = '';
    } else {
        document.getElementById('edit_cst_dob').value = cst_dob.getUTCDate() +'/' + (cst_dob.getUTCMonth() + 1);
    }

    var cst_anniversary = new Date(cst_info.anniversary);
    if (isNaN(cst_anniversary.getUTCDate())) {
        document.getElementById('edit_cst_anniversary').value = '';
    }
    else {
        document.getElementById('edit_cst_anniversary').value = cst_anniversary.getUTCDate() +'/' + (cst_anniversary.getUTCMonth() + 1);
    }
    var save_btn = document.getElementById("edit_btn_save");
    save_btn.onclick = function(){
            edit_cst_info(cst_info.phone_1, cst_info.phone_2);
    };


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
function get_today_customers_callback(res){
    populate_all_customers_list(response_data, 2);
}

function get_today_customers(callback=null) {
    api_url = prepare_api_get_url('get_today_customers');

    if (callback == null) {
        callback = get_today_customers_callback;

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
    var child = document.createElement('option');
    child.innerHTML = "Service...";
    services_list.appendChild(child);

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
    console.log("yes")
    // Get the staff element
    var checkbox = document.getElementById("staff_active_modal");
    var modal = document.getElementById("editModalStaff");
    var editlabel = document.getElementById("staff_error_modal");
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
      modal.style.display = "none";
    }

    var viewmodal = document.getElementById("viewModalStaff");
    window.onclick = function(event) {
      if (event.target == viewmodal) {
        viewmodal.style.display = "none";
        var viewList = document.getElementById("view_service_list");
        while (viewList.firstChild) {
            viewList.removeChild(viewList.firstChild);
        }
      }
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    var staff_list = document.getElementById('staff-manage-list');
    staff_list.innerHTML = '';
    for (idx = 0; idx < response_data.length; idx++) {
        staff = response_data[idx];
        var child = document.createElement('a');
        child.classList.add('list-group-item');
        child.classList.add('list-group-item-action');
        child.innerHTML = staff.name;

        child.append(document.createElement('br'));
        var phone_label = document.createElement('label');
        phone_label.classList.add('gray-color');
        phone_label.innerHTML = staff.phone_1;

        child.appendChild(phone_label);
        child.append(document.createElement('br'));
        var edit_btn = document.createElement('button');
        edit_btn.classList.add('btn');
        edit_btn.classList.add('btn-default');
        edit_btn.classList.add('btn-sm');
        edit_btn.innerHTML = "Edit ";
        edit_btn.id = "edit_btn";
        // console.log(edit_btn.id);
        var edit_span = document.createElement('span');
        edit_span.classList.add('glyphicon')
        edit_span.classList.add('glyphicon-edit')
        edit_btn.appendChild(edit_span);
        edit_btn.style.margin = "10px"
        child.append(edit_btn)
        edit_btn.onclick = (function(staff){
            return function(){
                editlabel.hidden = true;
                checkbox.checked = false;
                modal.style.display = "block";
                populate_staff_editinfo(staff);
            }
        })(staff);

        var view_btn = document.createElement('button');
        view_btn.classList.add('btn');
        view_btn.classList.add('btn-default');
        view_btn.classList.add('btn-sm');
        view_btn.innerHTML = "View ";
        var view_span = document.createElement('span');
        view_span.classList.add('glyphicon');
        view_span.classList.add('glyphicon-eye-open');
        view_btn.appendChild(view_span);
        view_btn.style.margin = "10px";
        child.append(view_btn);
        view_btn.onclick = (function(staff){
            return function(){
               viewmodal.style.display = "block";
               document.getElementById("infoTab").click()
               populate_staff_viewinfo(staff);

            }
        })(staff);

        staff_list.appendChild(child);
    }
}

function get_transaction_staff_callback(res){
    var txn_list = document.getElementById('view_service_list_staff')

    for (idx = 0; idx < res.length; idx++){
        service = res[idx];
        var child = document.createElement('div');

        child.classList.add('list-group-item');
        child.classList.add('list-group-item-action');
        var info_card = document.createElement('dl');
        info_card.classList.add('dl-horizontal');

        var info_name = document.createElement('dt');
        info_name.innerHTML = 'Service';
        info_card.appendChild(info_name);
        var info_name_res = document.createElement('dd');
        info_name_res.innerHTML = service.srv_name;
        info_card.appendChild(info_name_res);

        var service_price = document.createElement('dt');
        service_price.innerHTML = 'Price';
        info_card.appendChild(service_price);
        var service_price_res = document.createElement('dd');
        service_price_res.innerHTML = service.srv_price;
        info_card.appendChild(service_price_res);

        var cust_name = document.createElement('dt');
        cust_name.innerHTML = 'Customer name';
        info_card.appendChild(cust_name);
        var cust_name_res = document.createElement('dd');
        cust_name_res.innerHTML = service.cust_name;
        info_card.appendChild(cust_name_res);

        var txn_date = document.createElement('dt');
        txn_date.innerHTML = 'Date';
        info_card.appendChild(txn_date);
        var txn_date_res = document.createElement('dd');
        txn_date_res.innerHTML = service.txn_time;
        info_card.appendChild(txn_date_res);

        var location = document.createElement('dt');
        location.innerHTML = 'Location';
        info_card.appendChild(location);
        var location_res = document.createElement('dd');
        if (service.location == 1){
            location_res.innerHTML = 'Chuna Bhatti';
        }
        else if (service.location == 2){
            location_res.innerHTML = 'Lal Ghati';
        }
        info_card.appendChild(location_res);

        child.appendChild(info_card);
        txn_list.appendChild(child);

    }

}

function populate_staff_viewinfo(staff){
    args = {}
    args['staff_id'] = staff.staff_id

    document.getElementById('viewStaffName').innerHTML = staff.name;
    document.getElementById('viewStaffPhone_1').innerHTML = staff.phone_1;
    document.getElementById('viewStaffAddress').innerHTML = staff.address;
    document.getElementById('viewActive').innerHTML = staff.is_active;

    api_url = prepare_api_get_url('get_transaction_staff', args);
    var ret = call_api(api_url, null, 'GET', get_transaction_staff_callback);

}

function edit_staff_info(ph1){
    args = {}
    args['key'] = ph1
    args['staff_id'] = document.getElementById('staff_id_modal').value;
    args['staff_name'] = document.getElementById('staff_name_modal').value;
    args['staff_address'] = document.getElementById('staff_address_modal').value;
    args['staff_phone_1'] = document.getElementById('staff_phone_1_modal').value;
    if (document.getElementById('staff_active_modal').selected == true){
        args['staff_active'] = 1;
    }
    else{
        args['staff_active'] = 0;
    }
    if (args['staff_name'] == '') {
        display_error('Please enter staff name', 'staff_error_modal');
        return
    }

    if (args['staff_phone_1'] == '') {
        display_error('Please enter phone number', 'staff_error_modal');
        return
    }

    api_url = prepare_api_get_url('edit_staff_info', args);
    var ret = call_api(api_url, null, 'GET', null);

}

function populate_staff_editinfo(res){
    // console.log(res.staff_id)
    // console.log(res.name)
    // console.log(res.phone_1)
    // console.log(res.address)
    document.getElementById('staff_id_modal').value = res.staff_id;
    document.getElementById('staff_name_modal').value = res.name;
    document.getElementById('staff_phone_1_modal').value = res.phone_1;
    document.getElementById('staff_address_modal').value = res.address;
    if (res.is_active == 1){
        document.getElementById('staff_active_modal').checked = true;
    }
    else{
        document.getElementById('staff_active_modal').checked = false;

    }
    
    var save_btn = document.getElementById('btn_search_staff');
    save_btn.onclick = function(){
            edit_staff_info(res.phone_1);
    };


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

function service_update_callback() {
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
    var ret = call_api(api_url, null, 'GET', service_update_callback)
    document.getElementById('service_name').value = '';
}

function delete_service() {
    var service = document.getElementById('service_name').value;
    if (service == '')
        return;

    args = {};
    args['service_name'] = service;
    api_url = prepare_api_get_url('delete_service', args);
    var ret = call_api(api_url, null, 'GET', service_update_callback)
    document.getElementById('service_name').value = '';
}

function add_new_staff_callback() {
    reset_staff_information();
    get_all_staff(populate_staff_manage_list);
}

function add_new_staff() {
    // Check all required fields are present
    args = {}

    reset_staff_error();
    args['staff_name'] = document.getElementById('staff_name').value;
    args['staff_phone_1'] = document.getElementById('staff_phone_1').value;
    args['staff_address'] = document.getElementById('staff_address').value;

    if (args['staff_name'] == '') {
        display_error('Please enter staff name', 'staff_error');
        return
    }

    if (args['staff_phone_1'] == '') {
        display_error('Please enter phone number', 'staff_error');
        return
    }

    api_url = prepare_api_get_url('add_new_staff', args);
    var ret = call_api(api_url, null, 'GET', add_new_staff_callback);
}

function init_main() {

    get_all_services();
    get_all_staff(populate_staff_manage_list);

}
