;var Oface = Oface || {};
Oface.Models = Oface.Models || {};
Oface.Models.AskForLogin = {
    authDemoLogin: function(doc, oface, retries){
        Oface.log("Retries left: ", retries);
      //TODO validate
      //TODO handle bad login...
      var formData = { username: $('#oface-login-form #username', doc).attr('value'),
                       password: $('#oface-login-form #password', doc).attr('value') };
      Oface.Util.ajax({
        type: "POST",
        url: Oface.SECURE_HOST + "/auth_demo/login",
        async: false,
        cache: false,
        dataType: "json",
        data: formData,
        beforeSend: function(xhr){            
            $('#oface-login-form #message', doc).text("Checking Username and Password.");
        },
        success: function(data, status){
            $('#oface-login-form', doc).remove();
            Oface.Controllers.Oface.main(ofaceObj);
        },
        error: function(xhr, status, error){          
            $('#oface-login-form #message', doc).text("Username or Password were incorrect. Please try again.");
            Oface.log("login ERROR with: ");
            Oface.log(xhr);
            Oface.log(status);
            Oface.log(error);
            var numRetries = parseInt( retries );
            Oface.log("retries is now", numRetries);
            if(numRetries != NaN && numRetries > 1) {
                Oface.Models.AskForLogin.authDemoLogin(doc, oface, (numRetries - 1));
            }
        }
      });
          return false;
    }
}