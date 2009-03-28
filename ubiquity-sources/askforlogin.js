;function askForLogin(oface){
  
  var doc = Application.activeWindow.activeTab.document;
  var $ = jQuery;
  var form = Oface.Views.loginForm.toXMLString();
  $('#feed1', doc).append(form)
      .find('#login-signup-url').attr('href', Oface.HOST + "/auth_demo/create");
  
  $('#oface-login-form', doc).submit(function(){
      return Oface.Models.AskForLogin.authDemoLogin(doc, oface, 3);
  });
};

