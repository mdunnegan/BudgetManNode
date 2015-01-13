$(document).ready(function() {

    // Populate the budget table on initial page load
    populateBudget();

    // show - not currently needed, might want to expand a budget later on
    // $('#budgetElementList table tbody').on('click', 'td a.linkshowbudgetelement', showBudgetElementInfo);

    // delete an element
    $('#budgetElementList table tbody').on('click', 'td a.linkdeletelement', deleteBudgetElement);

    // Populates the form with the selected element's data
    $('#budgetElementList table tbody').on('click', 'td a.linkupdateelement', populateFieldset);

    // POST and PUT handles the switch between add and update
    $('#btnBudgetElementAction').on('click', function (e) {
        var action = ($(this).attr("data-action") === "add") ? addBudgetElement : updateBudgetElement;
        action.call(this, e);
    });

    // cancels update
    $('#addBudgetElement fieldset #btnCancelUpdate').on('click', cancelUpdate);

});

// Functions =============================================================

// Fill table with data
function populateBudget() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/budget/elements', function( data ) {

    	// data comes in as an array of one element (one user), and we only need to iterate through budget elements
        budgetElementListData = data[0].budget_elements;

        // For each item in our JSON, add a table row and cells to the content string
        var i = 0;
        $.each(budgetElementListData, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.inputBudgetElementName + '</td>';
            tableContent += '<td>' + this.inputAmount + '</td>';
            tableContent += '<td>' + this.frequency + '</td>';
            tableContent += '<td><a href="#" class="linkupdateelement" rel="' + this[i] + '">update</a></td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this[i] + '">delete</a></td>';
            tableContent += '</tr>';
            i++;
        });

        // Inject the whole content string into our existing HTML table
        $('#budgetElementList table tbody').html(tableContent);
    });
};

// Michael Dunnegan
function cancelUpdate(event){

    // change data-attribute of update button
    $('#btnBudgetElementAction').attr('data-action', "add");

    // update header
    $('#addBudgetElementHeader').text("Add to Budget");

    // update button text
    $('#btnBudgetElementAction').text('Add');

    // remove cancel button
    document.getElementById("btnCancelUpdate").className = "hidden";

    // clear fields
    $('#addBudgetElement fieldset input#inputBudgetElementName').val("");
    $('#addBudgetElement fieldset input#inputAmount').val("");
    $('#addBudgetElement fieldset input#frequency').val(""); // TODO 
    
}

// TODO - adapt to mongo
// Michael Dunnegan
// for use in PUT - populates the form when 'UPDATE' is selected
function populateFieldset(event){

    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisBudgetElementId = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = budgetElementListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(thisBudgetElementId);

    // Get Budget Element Object
    var thisBudgetElementObject = budgetElementListData[arrayPosition];

    // store this in a global >:(
    positionOfUserToUpdate = arrayPosition;

    // Everything above will certainly be different

    // Update info box header
    $('#wrapper #addBudgetElement #addBudgetElementHeader').text("Update " + thisUserObject.username);

    // change btnBudgetElementAction to have data-action 'update', so it'll function differently
    $('#btnBudgetElementAction').text('Update');
    $('#btnBudgetElementAction').attr('data-action', 'update');
    
    //Populate Info Box
    $('#addBudgetElement fieldset input#inputUserName').val(thisUserObject.username);
    $('#addBudgetElement fieldset input#inputUserEmail').val(thisUserObject.email);
    $('#addBudgetElement fieldset input#inputUserFullname').val(thisUserObject.fullname);
    $('#addBudgetElement fieldset input#inputUserAge').val(thisUserObject.age);
    $('#addBudgetElement fieldset input#inputUserLocation').val(thisUserObject.location);
    $('#addBudgetElement fieldset input#inputUserGender').val(thisUserObject.gender);

    // we're just going to unhide the hidden cancel button
    document.getElementById("btnCancelUpdate").className = "";

};

// For later use...
// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = budgetElementListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = budgetElementListData[arrayPosition];

    // change name of header
    $('#userInfoHeader').text(thisUserObject.username);

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);
};

// Adds a Budget Element 
function addBudgetElement(event) {

    console.log("addBudgetElement called");
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addBudgetElement input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newElement = {
            'inputBudgetElementName': $('#addBudgetElement fieldset input#inputBudgetElementName').val(),
            'inputAmount': $('#addBudgetElement fieldset input#inputAmount').val(),
            'frequency': $('input[name="frequency"]:checked').val()
        }

        // Use AJAX to post the object to our addBudgetElement service
        $.ajax({
            type: 'POST',
            data: newElement,
            url: '/budget/newelement',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg == '') {

                // Clear the form inputs
                $('#addBudgetElement fieldset input').val('');

                // Update the table
                populateBudget();
            }
            else {
                //If something goes wrong, alert the error message that our service returned
               alert('Error: ' + response.msg);
            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// TODO - adapt to use mongo
// Update an element
function updateBudgetElement(event, id){

    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addBudgetElement input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        userToUpdate = budgetElementListData[positionOfUserToUpdate];

        var updatedUser = {
            'username': $('#addBudgetElement fieldset input#inputUserName').val(),
            'email': $('#addBudgetElement fieldset input#inputUserEmail').val(),
            'fullname': $('#addBudgetElement fieldset input#inputUserFullname').val(),
            'age': $('#addBudgetElement fieldset input#inputUserAge').val(),
            'location': $('#addBudgetElement fieldset input#inputUserLocation').val(),
            'gender': $('#addBudgetElement fieldset input#inputUserGender').val()
        };

        // Use AJAX to post the object to our addBudgetElement service
        $.ajax({
            type: 'PUT',
            data: updatedUser, 
            url: '/users/updateelement/' + userToUpdate._id,
            dataType: 'JSON'
        }).done(function(response) {

            //console.log('done');

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addBudgetElement fieldset input').val('');

                // Update the table
                populateBudget();

                // set data action to add
                cancelUpdate();
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
}

// TODO - adapt to use MoNgO
// Delete Budget Element
function deleteBudgetElement(event) {

    event.preventDefault();
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {
            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateBudget();
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
};

