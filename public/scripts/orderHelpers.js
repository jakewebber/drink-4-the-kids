function areValidCoordinates(validLat, validLong, userLat, userLong){
    var bounds = .002;
    var latMin = validLat - bounds,
      latMax = validLat + bounds,
      longMin = validLong - bounds,
      longMax = validLong + bounds;

    return userLat <= latMax && userLat >= latMin && userLong <= longMax && userLong >= longMin;
  }

function locationSuccess(pos) {
    if(areValidCoordinates(34.1493571, -84.0878155, pos.coords.latitude, pos.coords.longitude) || 
    areValidCoordinates(33.734581, -84.365883, pos.coords.latitude, pos.coords.longitude)){
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

verifyOrder = function(){
    var today = new Date();
    // if(today.getDay() !== 18 || today.getMonth() !== 12){
    //     new bootstrap.Modal(document.getElementById('date-error-modal')).show();
    // }else
    if (navigator.geolocation) {
        var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
        };
        var position = navigator.geolocation.getCurrentPosition(locationSuccess, locationError, options);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}