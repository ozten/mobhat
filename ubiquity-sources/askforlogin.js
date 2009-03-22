;function askForLogin(oface){
  
  var doc = Application.activeWindow.activeTab.document;
  var $ = jQuery;
  var form = <div id="oface-login-form"
                  style="position: fixed; top: 100px; left: 100px; z-index: 666; background-color: #FFF; color: #333">
                          <div>
                            <h1>OFace requires a Login:</h1>
                            <p id="message">Please login to use OFace</p>
                            Username: <input type="text" value="" name="username" id="username" /><br />
                            Password: <input type="password" value="" name="password" id="password" /><br />
                            <input type="submit" value="Login" name="submit" id="submit" />
                            <input type="submit" value="Cancel" name="cancel" id="cancel" />
                          </div>
                        </div>.toXMLString();
  $('#feed1', doc).append(form);
  $('#oface-login-form #submit', doc).click(function(){
      //TODO validate
      //TODO handle bad login...
      var formData = { username: $('#oface-login-form #username', doc).attr('value'),
                       password: $('#oface-login-form #password', doc).attr('value') };
      $.ajax({
        type: "POST",
        url: "http://oface.ubuntu/auth_demo/login",
        async: false,
        cache: false,
        dataType: "json",
        data: formData,
        beforeSend: function(xhr){            
            $('#oface-login-form #message', doc).text("Checking Username and Password.");
        },
        success: function(data, status){
            Oface.Models.UserDB.whoAmI(oface);
        },
        error: function(xhr, status, error){          
            $('#oface-login-form #message', doc).text("Username or Password were incorrect. Please try again.");
            CmdUtils.log("login ERROR with: ");
            CmdUtils.log(xhr);
            CmdUtils.log(status);
            CmdUtils.log(error);
        }
    });
    });
}
