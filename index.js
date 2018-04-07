var table;
	var to_Dates=[];
	var from_Dates=[];
var servers=[];
var c;
	
$(function(){

	generateTable();
	// $.get('http://webapi.edicogenome.com/server_db_api.pl',{parameters:"*",table:"Servers"},function(result){
	// 	for(var i=0; i<result.result.length; i++){
	// 		console.log();
	// 		$.post('http://webapi.edicogenome.dev/server_email_api.pl', {to:result.result[i].user, servername:result.result[i].name, reservetime: result.result[i].expectedFreeDateTime, type:'b'});
	// 	}
	// });

	$( "#expected_Datetime" ).datetimepicker();
	
	$('#serverlist').on('click', 'tr', function(){
	var server_id = $(this).attr('name');
		$.get('http://webapi.edicogenome.com/server_db_api.pl',{parameters:"*",table:"Servers", where:"id="+server_id},function(result){
			if(result.result[0].description == null)
				result.result[0].description = "";
			if(result.result[0].user == null)
				result.result[0].user = "";
			if(result.result[0].expectedFreeDateTime == null)
				result.result[0].expectedFreeDateTime = "";
			if(result.result[0].is_shared == undefined)
				result.result[0].is_shared = false;
			
			if((result.result[0].is_shared) == 1){
				$("#checkbox").prop("checked",true);
			}
			else if((result.result[0].is_shared) == 0){
				$("#checkbox").prop("checked",false);
			}

			if(result.result[0].is_shared == 0)
				result.result[0].is_shared = false;
			else if(result.result[0].is_shared == 1)
				result.result[0].is_shared = true;

			$('input[name="name"]').val(result.result[0].name);
			$('textarea[name="description"]').val(result.result[0].description);
			$('input[name="user"]').val(result.result[0].user);
			$('input[name="expectedFreeDateTime"]').val(result.result[0].expectedFreeDateTime);
			$('input[name="is_shared"]').val(result.result[0].is_shared);
		});
	});

	$('#checkbox').change(function(){
		c = this.checked ? true : false;
		$('input[name="is_shared"]').val(c);
	});

	$('#requestServer').click(function(){
		
		//user1 is the requester
		//user2 is the owner of server
		var $that = this;
		var email1;
		var user1;
		$.get('http://webapi.edicogenome.com/server_db_api.pl',{parameters:"*",table:"Servers"},function(result){
			for(var i=0; i<result.result.length; i++){
				if(result.result[i].name == $('input[name="name"]').val()) {
					email1 = result.result[i].user;

					var email2 = $('input[name="email"]').val();

					if(email2.indexOf('.') == -1 && email2.indexOf('@') == -1) {}
					else if (!(email2.indexOf('.') == -1)) {
						if(email2.indexOf('.')<email2.indexOf('@')) {
							var location = email2.indexOf('.');
							var tempstr = email2.substring(0, location);
							user1 = tempstr;
						}
						else {
							var location = email2.indexOf('@');
							var tempstr = email2.substring(0, location);
							user1 = tempstr;
						}
					}

					//email type a means request
					//email type b means 15 min before

					$.post('http://webapi.edicogenome.dev/server_email_api.pl', {to:email2, cc:email1, servername:$('input[name="name"]').val(), username:user1,type:'a'}, function(result) {
						//$('#id02').modal('show'); 
						console.log("email sent");
						var m1 = document.getElementById('id01');
						var m2 = document.getElementById('id02');
						m1.style.display = 'none';
						m2.style.display = 'block';

						setTimeout(function() {m2.style.display = 'none';}, 1500);


					});

				}
			}
		});		
	});

	$('#btnSubmit').click(function(){
		for(var d=0; d< from_Dates.length;d++){
			if( $('input[name="expectedFreeDateTime"]').val() == from_Dates[d]){
				$('#var_Errors').removeClass('none');
				$('#var_Errors').text("Server already reserved for this time");
				return false;
			}
			if(moment($('input[name="expectedFreeDateTime"]').val()).format('MM/DD/YYYY HH:mm').isBefore(to_Dates[d])  
			&& moment($('input[name="expectedFreeDateTime"]').val()).format('MM/DD/YYYY HH:mm').isAfter(from_Dates[d])){
				$('#var_Errors').removeClass('none');
				$('#var_Errors').text("Server already requested for this date and time.");
				return false;
			}
		}

		if($('textarea[name="description"]').val() == "")
			{
			$('#var_Errors').removeClass('none');
			$('#var_Errors').text("Description is required.");
			return false;
		}
		if($('input[name="expectedFreeDateTime"]').val() == "")
		{
			$('#var_Errors').removeClass('none');
			$('#var_Errors').text("Please define starting date for this request.");
			return false;
		}
		if($('input[name="name"]').val() == "")
		{
			$('#var_Errors').removeClass('none');
			$('#var_Errors').text("Pease select server.");
			return false;
		}
		if($('input[name="user"]').val() == "")
		{
			$('#var_Errors').removeClass('none');
			$('#var_Errors').text("User Name required.");
			return false;
		}

		if($('input[name="is_shared"]').val() == undefined)
		{
			$('input[name="is_shared"]').val(false);

		}

		if($('input[name="is_shared"]').val() == null)
		{
			$('input[name="is_shared"]').val(false);
		}

		$.post('http://webapi.edicogenome.com/server_update_api.pl',{table:'Servers',parameters:'description="'+$('textarea[name="description"]').val()
							+'",user="'+$('input[name="user"]').val()
							+'",expectedFreeDateTime="'+moment($('input[name="expectedFreeDateTime"]').val()).format('MM/DD/YYYY HH:mm')
							+'",dragenLastRunTime="'+$('input[name="dragenLastRunTime"]').val()
							+'",is_shared='+$('input[name="is_shared"]').val(), where:'name="'+$('input[name="name"]').val()+'"'},function(result){
			$('input[name="name"]').val('');
			$('textarea[name="description"]').val('');
			$('input[name="user"]').val('');
			$('input[name="expectedFreeDateTime"]').val('');
			$('input[name="dragenLastRunTime"]').val('');
			$('input[name="is_shared"]').val('');

			table.destroy();
			generateTable();
			
			$('#var_Errors').addClass('none');
			$('#var_Errors').text("");
			
		});
	});

});

function freeServer(name){

	$.post('http://webapi.edicogenome.com/server_update_api.pl',{table:'Servers',
		parameters:'expectedFreeDateTime="'+moment().format('MM/DD/YYYY HH:mm')+'"', where:'name="'+name+'"'},function(result){
			
			table.destroy();
			generateTable();

		});
}

function generateTable(){

	$('#serverlist').html('');

	$.get('http://webapi.edicogenome.com/server_db_api.pl',{parameters:"*",table:"Servers"},function(result){
		for(var i=0; i<result.result.length; i++){
			if(result.result[i].description == null)
				result.result[i].description = "";
			if(result.result[i].user == null)
				result.result[i].user = "";
			if(result.result[i].expectedFreeDateTime == null)
				result.result[i].expectedFreeDateTime = ""
			if(result.result[i].is_shared == null)
				result.result[i].is_shared = "";

			var class_applied = "";
			if(result.result[i].expectedFreeDateTime != ""){
				if(!moment().isBefore(result.result[i].expectedFreeDateTime)){
					class_applied= "available-green";
				}
			}
			
			if(result.result[i].user.indexOf('.') == -1 && result.result[i].user.indexOf('@') == -1) {}
			else if (!(result.result[i].user.indexOf('.') == -1)) {
				if(result.result[i].user.indexOf('.')<result.result[i].user.indexOf('@')) {
					var location = result.result[i].user.indexOf('.');
					var tempstr = result.result[i].user.substring(0, location);
					result.result[i].user = tempstr;
				}
				else {
					var location = result.result[i].user.indexOf('@');
					var tempstr = result.result[i].user.substring(0, location);
					result.result[i].user = tempstr;
				}
			}

			if(result.result[i].is_shared == 0)
				result.result[i].is_shared = "<span style=\"color:red\" class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>";
			else if(result.result[i].is_shared == 1)
				result.result[i].is_shared = "<span style=\"color:green\" class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>";

			$('#serverlist').append("<tr class='pointer' name="+result.result[i].id+"><td>"
								+result.result[i].name+"</td><td>"
								+result.result[i].description+"</td><td>"
								+result.result[i].user+"</td><td>"
								+result.result[i].type+"</td><td class='"+class_applied+"'>"
								+result.result[i].expectedFreeDateTime+"</td><td style=\"text-align:center\">"
								+result.result[i].is_shared+"</td><td><input type='button' class='btn btn-sm btn-success' value='Free' onclick='javascript:freeServer(\""+result.result[i].name+"\")'/></td><td><input type='button' class='btn btn-sm btn-primary' value='Request' onclick=\"document.getElementById('id01').style.display='block'\"/></td></tr>");
		}
		
		table = $('#server_table').DataTable({
			"paging":   false,
			"info":     false
		});
		
	});
}

