
// service tab in view modal
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

// info tab in view modal and get transaction data
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

function edit_staff_info_callback(){
    goto_staff()

}
// onclick method for save button in edit modal
function edit_staff_info(ph1){
    args = {}
    args['key'] = ph1
    args['staff_id'] = document.getElementById('staff_id_modal').value;
    args['staff_name'] = document.getElementById('staff_name_modal').value;
    args['staff_address'] = document.getElementById('staff_address_modal').value;
    args['staff_phone_1'] = document.getElementById('staff_phone_1_modal').value;
    if (document.getElementById('staff_active_modal').checked == true){
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
    var ret = call_api(api_url, null, 'GET', edit_staff_info_callback);

}

// populate info in edit modal
function populate_staff_editinfo(res){

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

// Add view and edit button and display all staff
function populate_staff_manage_list(response_data) {
    var idx = 0;
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
        if (admin){
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

        }

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
// document.getElementById("myP").style.visibility = "hidden"
