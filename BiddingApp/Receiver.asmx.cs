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
                UserData signupData = JsonConvert.DeserializeObject<UserData>(jToken.Value<JToken>("formData").ToString());

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
        public string CreateInterest(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                InterestData interestData = JsonConvert.DeserializeObject<InterestData>(jToken.Value<JToken>("formData").ToString());

                Statics.Access.Interest_Create(userID, interestData);

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("CreateInterest Exception", ex);
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
        public string Chat(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string emailTo = jToken.Value<string>("emailTo");
                string message = jToken.Value<string>("message");

                Statics.Access.Chat(userID, emailTo, message);

                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("Chat Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string GetChatHistory(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string emailTo = jToken.Value<string>("emailTo");
                int lastChatID = jToken.Value<int>("lastChatID");

                return JsonConvert.SerializeObject(new { Success = true, ChatHistory = Statics.Access.Chat_Get(userID, emailTo, lastChatID) });
            }
            catch (Exception ex)
            {
                Log("GetChatHistory Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string PlaceOrder(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");
                decimal price = jToken.Value<decimal>("price");
                int goodUntilHours = jToken.Value<int>("hours");
                int goodUntilMins = jToken.Value<int>("minutes");
                Statics.Access.Interest_PlaceOrder(userID, interestGUID, price, goodUntilHours, goodUntilMins);

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("PlaceOrder Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string CancelOrder(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");
                Statics.Access.Interest_CancelOrder(userID, interestGUID);

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("CancelOrder Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string DeleteInterest(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");
                Statics.Access.Interest_Delete(userID, interestGUID);

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("DeleteInterest Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string CheckPrices(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");
                BidTypes bidType = (BidTypes)jToken.Value<int>("bidType");
                List<string> contactGUIDs = jToken.Value<JToken>("contactGUIDs") != null ? JsonConvert.DeserializeObject<List<string>>(jToken.Value<JToken>("contactGUIDs").ToString()) : null;

                Access access = Statics.Access;
                List<ContactData> contacts = access.Contact_Get(userID);
                foreach (ContactData contact in contacts)
                {
                    if (contact.MembershipTypeID == MembershipTypes.Advance && (contactGUIDs == null || contactGUIDs.Contains(contact.GUID))) access.Bid_Create(0, interestGUID, contact.GUID, bidType, 0);
                }

                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("CheckPrices Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string ShowPrice(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");
                BidTypes bidType = (BidTypes)jToken.Value<int>("bidType");
                decimal price = jToken.Value<decimal>("price");

                Statics.Access.Bid_Create(userID, interestGUID, null, bidType, price);

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("CheckPrices Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string GetData(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);

                List<ContactData> contacts = null;
                if (jToken.Value<bool>("contacts"))
                {
                    contacts = Statics.Access.Contact_Get(userID);
                }

                UserData userData = null;
                if (jToken.Value<bool>("userData"))
                {
                    userData = Statics.Access.GetUserData(userID, null, false);
                }

                List<InterestData> interests = null;
                if (jToken.Value<bool>("interests"))
                {
                    interests = Statics.Access.Interest_Get(userID);
                }

                return JsonConvert.SerializeObject(new { Success = true, Contacts = contacts, UserData = userData, Interests = interests, ServerDate = Statics.Access.GetSqlDateTime().ToString() });
            }
            catch (Exception ex)
            {
                Log("GetData Exception", ex);
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

    public class UserData
    {
        public int ID;
        public string FirstName, LastName, Company, Country, Email, Password;
        public bool MembershipBasic, MembershipAdvance;
        public MembershipTypes MembershipType;
    }

    public class ContactData
    {
        public int ID, RecentChatID;
        public string GUID, Email, FirstName, LastName, Company;
        public bool AllowBid, Block, AppearOnline;
        public MembershipTypes MembershipTypeID;
    }

    public class InterestData
    {
        public InterestTypes InterestType;
        public string Product, Condition, Quantity, Remarks, InterestGUID, ContactGUID, ExpirationDate, StatusDate, StatusDescription;
        public decimal Price, PriceShowing;
        public BidTypes BidType;
    }

    public class NotifyException : Exception
    {
        public NotifyException(string str) : base(str) { }
    }

    public class ChatData
    {
        public int ID;
        public string FirstName, Message;
        public bool Outgoing;
    }
}
