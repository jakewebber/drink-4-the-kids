function areValidCoordinates(validLat, validLong, userLat, userLong){
    var bounds = .002;
    var latMin = validLat - bounds,
      latMax = validLat + bounds,
      longMin = validLong - bounds,
      longMax = validLong + bounds;

    return userLat <= latMax && userLat >= latMin && userLong <= longMax && userLong >= longMin;
  }

function locationSuccess(pos) {
    if( areValidCoordinates(34.1493571, -84.0878155, pos.coords.latitude, pos.coords.longitude) ||
     areValidCoordinates(33.734581, -84.365883, pos.coords.latitude, pos.coords.longitude)
    ){
        var form = $('#orderform');
        if(form[0].checkValidity()){
            form.submit();
        }else{
            form[0].reportValidity();
        }    
    }else{
        new bootstrap.Modal(document.getElementById('location-error-modal')).show();
    }
}

function locationError(pos) {
    alert(`ERROR(${err.code}): ${err.message}`);
}

verifyOrder = function(self){
    // saving name for repeat form submissions
    var nameValue = document.getElementById('name-input').value;
    localStorage.setItem('name', nameValue.trim());

    let form = $('#orderform');
    let today = new Date(),
     start = new Date('2022-12-17'),
     end = new Date('2022-12-20');

    if(!form[0].checkValidity()){
        self.textContent="Grab a Drink";
        self.disabled = false;
        form[0].reportValidity();
    }
    else if((today < start || today > end) && location.hostname !== 'localhost')
    { // verify party date
        self.textContent="Grab a Drink";
        self.disabled = false;
        new bootstrap.Modal(document.getElementById('date-error-modal')).show();
    }
    else
    {
        form.submit();
    }

}