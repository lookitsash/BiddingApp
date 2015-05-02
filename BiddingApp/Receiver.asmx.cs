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
                SignupData signupData = JsonConvert.DeserializeObject<SignupData>(jToken.Value<JToken>("formData").ToString());

                if (Statics.Access.GetUserID(null, signupData.Email) > 0) throw new NotifyException("Email already registered");
                
                Statics.Access.Signup(signupData);
                string sessionGUID = Statics.Access.Login(signupData.Email, signupData.Password, HttpContext.Current.Request.UserHostAddress, HttpContext.Current.Request.UserAgent);
                if (String.IsNullOrEmpty(sessionGUID)) throw new Exception("Unable to get session GUID");

                return JsonConvert.SerializeObject(new { Success = true, SessionGUID = sessionGUID });
            }
            catch (Exception ex)
            {
                Log("Signup Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string AddContact(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                ContactData signupData = JsonConvert.DeserializeObject<ContactData>(jToken.Value<JToken>("formData").ToString());

                Statics.Access.Contact_Add(userID, signupData.Email);

                return JsonConvert.SerializeObject(new { Success = true, Contacts = Statics.Access.Contact_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("AddContact Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string DeleteContact(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string contactGUID = jToken.Value<string>("contactGUID");
                bool blockContact = jToken.Value<bool>("blockContact");

                if (blockContact) Statics.Access.Contact_Block(userID, contactGUID);
                else Statics.Access.Contact_Delete(userID, contactGUID);

                return JsonConvert.SerializeObject(new { Success = true, Contacts = Statics.Access.Contact_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("DeleteContact Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string UnblockContact(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string contactGUID = jToken.Value<string>("contactGUID");

                Statics.Access.Contact_Unblock(userID, contactGUID);

                return JsonConvert.SerializeObject(new { Success = true, Contacts = Statics.Access.Contact_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("DeleteContact Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string UpdateContact(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string contactGUID = jToken.Value<string>("contactGUID");
                bool allowBid = jToken.Value<bool>("allowBid");

                Statics.Access.Contact_Update(userID, contactGUID, allowBid);

                return JsonConvert.SerializeObject(new { Success = true, Contacts = Statics.Access.Contact_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("DeleteContact Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string GetContacts(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);

                return JsonConvert.SerializeObject(new { Success = true, Contacts = Statics.Access.Contact_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("GetContacts Exception", ex);
                return JsonError(ex);
            }
        }

        private int GetUserID(JToken jToken)
        {
            string sessionGUID = jToken.Value<string>("guid");
            int userID = Statics.Access.GetUserID(sessionGUID);
            if (userID > 0) return userID;
            else throw new Exception("Could not retrieve UserID from sessionGUID " + sessionGUID);
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
        public string FirstName, LastName, Company, Country, Email, Password;
        public bool MembershipBasic, MembershipAdvance;
    }

    public class ContactData
    {
        public int ID;
        public string GUID, Email, FirstName, LastName;
        public bool AllowBid, Block, AppearOnline;
        public MembershipTypes MembershipTypeID;
    }

    public class NotifyException : Exception
    {
        public NotifyException(string str) : base(str) { }
    }
}
