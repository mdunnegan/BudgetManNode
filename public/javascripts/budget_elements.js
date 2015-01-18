var positionOfBudgetToUpdate;

$(document).ready(function() {

    // Populate the budget table on initial page load
    populateBudget();

    // show - not currently needed, might want to expand a budget later on
    // $('#budgetElementList table tbody').on('click', 'td a.linkshowbudgetelement', showBudgetElementInfo);

    // delete an element
    $('#budgetElementList table tbody').on('click', 'td a.linkdeleteelement', function(e) {
    	var index = $('#budgetElementList tr').index($(this).closest('tr')) - 1;
    	deleteBudgetElement(e, index);
    });

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
            tableContent += '<td><a href="#" class="linkupdateelement" rel="' + i + '">update</a></td>';
            tableContent += '<td><a href="#" class="linkdeleteelement" rel="' + i + '">delete</a></td>';
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

// for use in PUT - populates the form when 'UPDATE' is selected
function populateFieldset(event){

    event.preventDefault();

    var thisBudgetPosition = $(this).attr('rel');

    $.getJSON( '/budget/elements', function( data ) {

    	// data comes in as an array of one element (one user), and we only need to iterate through budget elements
        budgetElementListData = data[0].budget_elements;

        //console.log("thisBudget: \n" + thisBudgetPosition);
        //console.log("budgetElementListData: \n" + budgetElementListData);

        var thisBudgetElementObject = budgetElementListData[thisBudgetPosition];

        $('#btnBudgetElementAction').text('Update');
	    $('#btnBudgetElementAction').attr('data-action', 'update');
	    
	    //Populate Info Box
	    $('#addBudgetElement fieldset input#inputBudgetElementName').val(thisBudgetElementObject.inputBudgetElementName);
	    $('#addBudgetElement fieldset input#inputAmount').val(thisBudgetElementObject.inputAmount);

	    // populate radio buttons
	    var frequency = thisBudgetElementObject.frequency;
	    $(":radio[value="+frequency+"]").prop('checked', true);

    });
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
        };

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

// Update an element
function updateBudgetElement(event, position){

    event.preventDefault();

    console.log(position);

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addBudgetElement input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        //userToUpdate = budgetElementListData[position];

        var newElement = {
            'inputBudgetElementName': $('#addBudgetElement fieldset input#inputBudgetElementName').val(),
            'inputAmount': $('#addBudgetElement fieldset input#inputAmount').val(),
            'frequency': $('input[name="frequency"]:checked').val()
        };

        // Use AJAX to post the object to our addBudgetElement service
        $.ajax({
            type: 'PUT',
            data: newElement, 
            url: '/budget/updateelement/' + position,
            dataType: 'JSON'
        }).done(function(response) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addBudgetElement fieldset input#inputBudgetElementName').val('');
                $('#addBudgetElement fieldset input#inputAmount').val('');

                //$('#addBudgetElement fieldset input#frequency').prop('checked', false);

                //$('#addBudgetElement fieldset input:radio[name="frequency"]').prop('checked', false).checkboxradio("refresh");
				// $("#addBudgetElement fieldset input:radio[name='frequency']").each(function(i) {
				//     this.checked = false;
				// });

        		$("#addBudgetElement fieldset input:radio:checked").removeAttr("checked");

        		//$('#addBudgetElement fieldset input#');

                //$(this).prop('checked', false);
                
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

// Deletes Budget Element
function deleteBudgetElement(event, position) {

    event.preventDefault();
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this element?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/budget/deleteelement/' + position
        }).done(function( response ) {
            // Check for a successful (blank) response
            if (response.msg === '') {}
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

