var Oface = Oface || {};
Oface.Views = Oface.Views || {};
Oface.Views.loginForm = <form id="oface-login-form"
                  style="position: fixed; top: 100px; left: 100px; z-index: 666; background-color: #FFF; color: #333">
                          <div>
                            <h1>MobHat requires a Login:</h1>
                            <p id="message">Please sir, can I have some more porage?</p>
                            Username: <input type="text" value="" name="username" id="username" /><br />
                            Password: <input type="password" value="" name="password" id="password" /><br />
                            <input type="submit" value="Login" name="submit" id="submit" />
                            <input type="submit" value="Cancel" name="cancel" id="cancel" />
                            <p>Need an account? <a id="login-signup-url" href="REPLACED">Sign Up</a></p>
                          </div>
                        </form>;