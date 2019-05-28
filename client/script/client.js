
// For Services tab in view modal
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

// For info tab in view modal and get transactions of the customer for service tab
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

// Filling info in the edit modal
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

// Clients tab search
function client_search_callback(res){
    populate_all_customers_list(res, 1)
}

// Search box on client tab (Locatin and name)
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

// callback for edit customer
function edit_customer_callback(res){

    var editlabel = document.getElementById("edit_customer");
    if (res.toString().localeCompare('false') == 0){
        display_error('Number already exists')

    }
    else{

        editlabel.hidden = false;
    }
}

// onclick method for save button in edit modal
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

