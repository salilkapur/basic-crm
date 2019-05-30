/* Basic configuration.
 * This should be moved to a separate file ASAP.
 */
api_base_url = 'http://34.226.121.100:5000/'
//api_base_url = 'http://0.0.0.0:5000/'

// This is global variable used to keep track of the number of services for a customer
cst_service_count = 0;
cst_services = [];
admin = false
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


function goto_customers() {
    hide_all_content();
    document.getElementById('customers-content').hidden = false;
    document.getElementById('li-customers').classList.add('active');
    document.getElementById('cst_search_location').selectedIndex = 0
    document.getElementById('search_name').value = ''
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


function reset_staff_information() {
    document.getElementById('staff_name').value = '';
    document.getElementById('staff_phone_1').value = '';
    document.getElementById('staff_address').value = '';
}

// User authentication functions
function auth_user_callback(response_data) {
    console.log(response_data)
    if (response_data == '1'){
        window.location.href = 'main.html'
        console.log("admin")
    }
    else if (response_data == '0'){
        console.log("not admin")
        window.location.href = 'main.html'

    }
    else if (response_data == 'Bad login'){
        alert("login failed")
    }
}

function auth_user () {
    args = {};
    args['username']=document.getElementById('username').value;
    args['password']=document.getElementById('password').value;

    api_url = prepare_api_get_url('login', args);
    var ret = call_api(api_url, null, 'GET', auth_user_callback)
    print_api_result(ret)

    return ret
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

function main_callback(res){

    if (res == 'Unauthorized'){
        window.location.href = 'index.html'
    }
    else{
        if (res == '1'){
            admin = true   
        }
        else{
            admin = false
        }
        console.log( admin );
    }
}

function init_main() {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    console.log( page );
    if (page != 'index.html'){
       args = {}
        args['key'] = 'value'
        api_url = prepare_api_get_url('Main', args);
        var ret = call_api(api_url, null, 'GET', main_callback)
        print_api_result(ret) 
    }
    
    // l = auth_user();
    // if (l == false){
    //     location.href = 'login.html'
    // }
    // get_all_services();
    // get_all_staff(populate_staff_manage_list);

}
