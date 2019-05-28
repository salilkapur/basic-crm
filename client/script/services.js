
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