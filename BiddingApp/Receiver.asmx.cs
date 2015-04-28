using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Web.Script.Services;

namespace BiddingApp
{
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService()]
    public class Receiver : System.Web.Services.WebService
    {
        [WebMethod]
        public string Login(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                string email = jToken.Value<string>("email");
                string password = jToken.Value<string>("password");

                string sessionGUID = Statics.Access.Login(email, password, HttpContext.Current.Request.UserHostAddress, HttpContext.Current.Request.UserAgent);
                if (String.IsNullOrEmpty(sessionGUID)) throw new NotifyException("Incorrect username/password, please try again");

                return JsonConvert.SerializeObject(new { Success = true, SessionGUID = sessionGUID });
            }
            catch (Exception ex)
            {
                Log("Signup Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string Signup(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                SignupData signupData = JsonConvert.DeserializeObject<SignupData>(jToken.Value<JToken>("signupData").ToString());

                if (Statics.Access.GetUserID(signupData.email) > 0) throw new NotifyException("Email already registered");
                
                Statics.Access.Signup(signupData);
                string sessionGUID = Statics.Access.Login(signupData.email, signupData.password, HttpContext.Current.Request.UserHostAddress, HttpContext.Current.Request.UserAgent);
                if (String.IsNullOrEmpty(sessionGUID)) throw new Exception("Unable to get session GUID");

                return JsonConvert.SerializeObject(new { Success = true, SessionGUID = sessionGUID });
            }
            catch (Exception ex)
            {
                Log("Signup Exception", ex);
                return JsonError(ex);
            }
        }

        private string JsonError(Exception ex)
        {
            return JsonError((ex is NotifyException) ? ex.Message : null);
        }

        private string JsonError(string str)
        {
            return JsonConvert.SerializeObject(new { Success = false, ErrorMessage = str });
        }

        private void Log(string str) { Statics.GetLogger("Receiver").Log(str); }
        private void Log(string str, Exception ex) { Statics.GetLogger("Receiver").Log(str, ex); }
    }

    public class SignupData
    {
        public int ID;
        public string firstName, lastName, company, country, email, password;
        public bool membershipBasic, membershipAdvance;
    }

    public class NotifyException : Exception
    {
        public NotifyException(string str) : base(str) { }
    }
}
