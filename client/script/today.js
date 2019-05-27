function goto_today() {
    hide_all_content();
    document.getElementById('today-content').hidden = false;
    document.getElementById('li-today').classList.add('active');

    get_today_stats();
    get_today_customers_list();
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