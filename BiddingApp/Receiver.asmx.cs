﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Web.Script.Services;
using Microsoft.AspNet.SignalR;
using Foundation;

namespace BiddingApp
{
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService()]
    public class Receiver : System.Web.Services.WebService
    {
        [WebMethod]
        // "json" param is passed directly from the javascript containing data required for function
        public string Login(string json)
        {
            try
            {
                // jToken represents the json object passed from javascript
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);

                // extract email param from json
                string email = jToken.Value<string>("email");

                // extract password param from json
                string password = jToken.Value<string>("password");

                // Check to see if user's email was verified or not (affects whether user can actually log into site)
                EmailVerificationStatuses emailVerificationStatus = Statics.Access.User_GetVerificationStatus(email, password);

                if (emailVerificationStatus == EmailVerificationStatuses.EmailNotVerified)
                {
                    // return a json object back to javascript indicating the email was not yet verified (javascript will take user to email verification page)
                    return JsonConvert.SerializeObject(new { Success = true, EmailVerified = false });
                }
                else
                {
                    // email was verified, so attempt to create a session GUID security token
                    string sessionGUID = (emailVerificationStatus == EmailVerificationStatuses.EmailVerified) ? Statics.Access.Login(email, password, HttpContext.Current.Request.UserHostAddress, HttpContext.Current.Request.UserAgent) : null;

                    // if no session GUID was created, then the username/password must be incorrect
                    // Note that the NotifyException is thrown here.  Any time you want a specific error message to be displayed to the user, throw it via NotifyException.
                    // This exception will set the ErrorMessage param which javascript uses.  Any other exception will cause javascript to show a generic error message
                    if (String.IsNullOrEmpty(sessionGUID)) throw new NotifyException("Incorrect username/password, please try again");

                    // retrieve the userID for the user logging in
                    int userID = Statics.Access.GetUserID(sessionGUID, GUIDTypes.Session);

                    // check to see if user is already logged in somewhere else, and if so, use signalR functions to tell that other session to log out
                    SyncForceLogout(userID);

                    // create a session data object to be passed back to the javascript (this object will be saved in the user's logged in session in the browser, and referenced many times from javascript)
                    SessionData sessionData = new SessionData() { GUID = sessionGUID, UserData = Statics.Access.GetUserData(userID, null, false) };

                    // return a successful response to javascript
                    // Note that this is a common pattern to all the web method calls.  Despite what parameters are returned back to javascript from c#, there will always be a "Success" param.
                    // If Success = true, then javascript knows the web method call succeeded.
                    // If Success = false, then javascript knows an error occured.  Some web methods pass in an optional "ErrorMessage" param.  Javascript will show this message to the user if present.
                    // If ErrorMessage is empty, then javascript shows a generic error message (defined in Resources/Scripts/Statics.js)
                    return JsonConvert.SerializeObject(new { Success = true, SessionData = sessionData, EmailVerified = true });
                }
            }
            catch (Exception ex)
            {
                Log("Signup Exception", ex);
                // An error occurred during the signup process (could be many things - usually database related like timeouts or connectivity issues)
                // For these type of errors, JsonError is returned with the exception (contains Success=false, and an optional ErrorMessage param)
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string CreateInterest(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);

                // Retrieve the userID of the user making this webmethod call
                // Javascript will pass in the session GUID (retrieved from the Login webmethod above) for most web methods
                // This line of code converts the session GUID into a userID (which is required for most database stored procedures).
                // Even if you never use the userID, you should still call the GetUserID function.  It will throw an exception if the userID could not be retrieved,
                // meaning the session GUID has expired or is invalid.  Important security feature to prevent hacking the web methods.
                // Session guids are really only required for web methods where you expect the user to be logged in (eg. its irrevelant in the "forgot password" page where the user is never logged in),
                // so don't call GetUserID for non-logged in web methods
                
                int userID = GetUserID(jToken);

                // Convert the json passed from javascript into an easy to use object
                InterestData interestData = JsonConvert.DeserializeObject<InterestData>(jToken.Value<JToken>("formData").ToString());

                // Call the database stored procedure to create the interest
                // Statics.Access (an instance of Access.cs) gives you access to the database.  Most of the stored procedures have wrapper functions in that class.  If you create new stored procedures and want to
                // access them from c#, add a wrapper function Access.cs
                string interestGUID = Statics.Access.Interest_Create(userID, interestData);

                // return a successful response to the user, with an "Interests" list containing all interests related to them
                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID), InterestGUID = interestGUID });
            }
            catch (Exception ex)
            {
                Log("CreateInterest Exception", ex);
                return JsonError(ex);
            }
        }

        private void SendValidationEmail(string email)
        {
            try
            {
                string validationToken = Statics.Access.User_GetEmailValidationToken(email);
                string verificationURL = Statics.BaseURL + "ValidateEmail.aspx?Email=" + email + "&Token=" + validationToken;
                if (!String.IsNullOrEmpty(validationToken))
                {
                    string emailBody = @"Hello, you've just created an account on BiddingApp.  Please verify your email by visiting the link below:

<a href=""" + verificationURL + @""">" + verificationURL + @"</a>

Your security token is " + validationToken + @"

Thank you,

Customer Service
BiddingApp
";
                    Utility.SendEmail(email, "Verify Email", Utility.ConvertToHtml(emailBody));
                }
            }
            catch (Exception ex)
            {
                Log("SendValidationEmail Exception", ex);
            }
        }

        [WebMethod]
        public string ResetPassword(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                string email = jToken.Value<string>("email");

                string resetToken = Statics.Access.User_CreatePasswordResetToken(email, HttpContext.Current.Request.UserHostAddress);

                if (String.IsNullOrEmpty(resetToken)) throw new Exception("Could not create password reset token");

                string resetURL = Statics.BaseURL + "ForgotPassword.aspx?Token=" + resetToken + "&Email=" + email;
                string emailBody = @"Hello, you've just requested a password reset on BiddingApp.  You can reset your password by visiting the link below:

<a href=""" + resetURL + @""">" + resetURL + @"</a>

Your security token is " + resetToken + @"

Thank you,

Customer Service
BiddingApp
";
                Utility.SendEmail(email, "Password Reset", Utility.ConvertToHtml(emailBody));

                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("ResetPassword Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string ChangePassword(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                string guid = jToken.Value<string>("guid");
                string resetToken = jToken.Value<string>("resetToken");
                string password = jToken.Value<string>("password");
                string oldPassword = jToken.Value<string>("oldPassword");
                int userID = 0;
                if (!String.IsNullOrEmpty(guid)) userID = Statics.Access.GetUserID(guid, GUIDTypes.Session);

                if (userID > 0)
                {
                    if (!Statics.Access.User_IsPasswordValid(userID, oldPassword)) throw new NotifyException("Your old password is incorrect.");
                }

                Statics.Access.User_ChangePassword(userID, resetToken, password);
                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("ChangePassword Exception", ex);
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

                if (Statics.Access.GetUserID(signupData.Email, GUIDTypes.Email) > 0) throw new NotifyException("Email already registered");
                
                Statics.Access.Signup(signupData);
                SendValidationEmail(signupData.Email);

                int userID = Statics.Access.GetUserID(signupData.Email, GUIDTypes.Email);
                foreach (DataRowAdapter dra in DataRowAdapter.Create(Statics.Access.GetTable("select UserID from TBL_Contact where ContactUserID = " + userID + " and DeletionDate is null")))
                {
                    int targetUserID = dra.Get<int>("UserID");
                    SyncContacts(targetUserID);
                }

                return JsonConvert.SerializeObject(new { Success = true });
                /*
                string sessionGUID = Statics.Access.Login(signupData.Email, signupData.Password, HttpContext.Current.Request.UserHostAddress, HttpContext.Current.Request.UserAgent);
                if (String.IsNullOrEmpty(sessionGUID)) throw new Exception("Unable to get session GUID");

                int userID = Statics.Access.GetUserID(sessionGUID, GUIDTypes.Session);
                SessionData sessionData = new SessionData() { GUID = sessionGUID, UserData = Statics.Access.GetUserData(userID, null, false) };

                foreach (DataRowAdapter dra in DataRowAdapter.Create(Statics.Access.GetTable("select UserID from TBL_Contact where ContactUserID = " + userID + " and DeletionDate is null")))
                {
                    int targetUserID = dra.Get<int>("UserID");
                    SyncContacts(targetUserID);
                }

                return JsonConvert.SerializeObject(new { Success = true, SessionData = sessionData});
                 */
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
                ContactData contactData = JsonConvert.DeserializeObject<ContactData>(jToken.Value<JToken>("formData").ToString());

                UserData userData = Statics.Access.GetUserData(userID, null, false);
                bool isBlocked = false;
                int contactUserID = Statics.Access.GetUserID(contactData.Email, GUIDTypes.Email);
                if (contactUserID > 0) isBlocked = Statics.Access.Contact_IsBlocked(contactUserID, userData.Email);
                
                if (!isBlocked)
                {
                    DataRowAdapter dra = Statics.Access.Contact_Add(userID, contactData.Email);
                    if (dra != null)
                    {
                        //contactUserID = dra.Get<int>("ContactUserID");
                        if (contactUserID > 0) SyncContacts(contactUserID);

                        string leaveHelloMessage = dra.Get<string>("LeaveHelloMessage");
                        if (contactUserID > 0 && !String.IsNullOrEmpty(leaveHelloMessage))
                        {
                            SyncChat(userID, contactUserID, leaveHelloMessage, true);

                            if (contactUserID > 0)
                            {
                                UserData contactUserData = Statics.Access.GetUserData(contactUserID, null, false);
                                string emailTo = contactUserData.Email;
                                string loginURL = Statics.BaseURL + "Default.aspx?Action=Login";
                                string emailSubject = userData.FirstName + " added you as a contact";
                                string emailBody = @"Hello, " + userData.FirstName + " " + userData.LastName + @" has added you as a contact on BiddingApp.  To add them as your contact too, visit the link below to login:

<a href=""" + loginURL + @""">" + loginURL + @"</a>

Thank you,

Customer Service
BiddingApp";
                                if (Statics.Access.User_CreateNotificationEmail(contactUserID, userID, NotificationTypes.NewContactsAddMe, emailSubject, emailBody))
                                {
                                    Utility.SendEmail(emailTo, emailSubject, Utility.ConvertToHtml(emailBody));
                                }
                            }
                            else
                            {
                                string emailTo = contactData.Email;
                                string signupURL = Statics.BaseURL + "Default.aspx?Action=Signup";
                                string emailSubject = userData.FirstName + " added you as a contact";
                                string emailBody = @"Hello, " + userData.FirstName + " " + userData.LastName + @" has added you as a contact on BiddingApp.  To add them as your contact too, visit the link below to create an account:

<a href=""" + signupURL + @""">" + signupURL + @"</a>

Thank you,

Customer Service
BiddingApp";
                                Utility.SendEmail(emailTo, emailSubject, Utility.ConvertToHtml(emailBody));
                            }
                        }
                    }
                }

                return JsonConvert.SerializeObject(new { Success = true, IsBlocked = isBlocked, Contacts = GetContacts(userID) });
            }
            catch (Exception ex)
            {
                Log("AddContact Exception", ex);
                return JsonError(ex);
            }
        }

        private List<ContactData> GetContacts(int userID)
        {
            return SetContactOnlineStatus(userID, Statics.Access.Contact_Get(userID));
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

                if (blockContact)
                {
                    Statics.Access.Contact_Block(userID, contactGUID, null);
                    int contactUserID = Statics.Access.GetUserID(contactGUID, GUIDTypes.Contact);
                    if (contactUserID > 0) SyncBlock(userID, contactUserID);
                }
                else Statics.Access.Contact_Delete(userID, contactGUID);

                return JsonConvert.SerializeObject(new { Success = true, Contacts = GetContacts(userID) });
            }
            catch (Exception ex)
            {
                Log("DeleteContact Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string BlockContact(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string contactEmail = jToken.Value<string>("contactEmail");

                Statics.Access.Contact_Block(userID, null, contactEmail);

                int contactUserID = Statics.Access.GetUserID(contactEmail, GUIDTypes.Email);
                if (contactUserID > 0) SyncBlock(userID, contactUserID);

                return JsonConvert.SerializeObject(new { Success = true, Contacts = GetContacts(userID) });
            }
            catch (Exception ex)
            {
                Log("BlockContact Exception", ex);
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

                return JsonConvert.SerializeObject(new { Success = true, Contacts = GetContacts(userID) });
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

                return JsonConvert.SerializeObject(new { Success = true, Contacts = GetContacts(userID) });
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
        public string MarkChatRead(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string emailFrom = jToken.Value<string>("emailFrom");

                int userIDFrom = Statics.Access.GetUserID(emailFrom, GUIDTypes.Email);
                if (userIDFrom > 0) Statics.Access.Chat_MarkRead(userID, userIDFrom);

                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("MarkChatRead Exception", ex);
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
                List<string> contactGUIDs = jToken.Value<JToken>("contactGUIDs") != null ? JsonConvert.DeserializeObject<List<string>>(jToken.Value<JToken>("contactGUIDs").ToString()) : null;
                Statics.Access.Interest_PlaceOrder(userID, interestGUID, price, goodUntilHours, goodUntilMins);

                InterestData interest = Statics.Access.Interest_Get(0, interestGUID)[0];
                UserData userData = Statics.Access.GetUserData(userID, null, false);

                Access access = Statics.Access;
                List<ContactData> allContacts = GetContacts(userID);
                List<ContactData> selectedContacts = new List<ContactData>();
                foreach (ContactData contact in allContacts)
                {
                    if (contact.MembershipTypeID == MembershipTypes.Advance && (contactGUIDs == null || contactGUIDs.Contains(contact.GUID)))
                    {
                        access.Bid_Create(0, interestGUID, contact.GUID, BidTypes.OrderPlaced, 0);
                        selectedContacts.Add(contact);

                        try
                        {
                            string emailTo = contact.Email;
                            string loginURL = Statics.BaseURL + "Default.aspx?Action=Login";
                            string emailSubject = userData.FirstName + " has left an order for " + interest.Product;
                            string emailBody = @"Hello, " + userData.FirstName + " " + userData.LastName + @" has left an order of " + interest.Price + " for " + interest.Product + @".  To review the details, visit the link below to login to BiddingApp:

<a href=""" + loginURL + @""">" + loginURL + @"</a>

Thank you,

Customer Service
BiddingApp";
                            int contactUserID = Statics.Access.GetUserID(contact.GUID, GUIDTypes.Contact);
                            if (Statics.Access.User_CreateNotificationEmail(contactUserID, userID, NotificationTypes.LeaveOrder, emailSubject, emailBody))
                            {
                                Utility.SendEmail(emailTo, emailSubject, Utility.ConvertToHtml(emailBody));
                            }
                        }
                        catch (Exception exc)
                        {
                            Log("LeaveOrder notification exception", exc);
                        }
                    }
                }

                foreach (ContactData contact in selectedContacts)
                {
                    int contactUserID = Statics.Access.GetUserID(contact.GUID, GUIDTypes.Contact);
                    SyncInterestUpdate(contactUserID, interestGUID, true);
                }

                /*
                List<ContactData> allContacts = GetContacts(userID);
                foreach (ContactData contact in allContacts)
                {
                    int contactUserID = Statics.Access.GetUserID(contact.GUID, GUIDTypes.Contact);
                    SyncInterestUpdate(contactUserID, interestGUID);
                }
                */

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

                List<ContactData> allContacts = GetContacts(userID);
                foreach (ContactData contact in allContacts)
                {
                    int contactUserID = Statics.Access.GetUserID(contact.GUID, GUIDTypes.Contact);
                    SyncInterestUpdate(contactUserID, interestGUID);
                }

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

                List<ContactData> allContacts = GetContacts(userID);
                foreach (ContactData contact in allContacts)
                {
                    int contactUserID = Statics.Access.GetUserID(contact.GUID, GUIDTypes.Contact);
                    SyncInterestDelete(contactUserID, interestGUID);
                }

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

                if (!(bidType == BidTypes.RequestFirm || bidType == BidTypes.RequestIndicative)) throw new Exception("Invalid bid type specified - " + bidType);

                InterestData interest = Statics.Access.Interest_Get(0, interestGUID)[0];
                UserData userData = Statics.Access.GetUserData(userID, null, false);

                Access access = Statics.Access;
                List<ContactData> allContacts = GetContacts(userID);
                List<ContactData> selectedContacts = new List<ContactData>();
                foreach (ContactData contact in allContacts)
                {
                    if (contact.MembershipTypeID == MembershipTypes.Advance && (contactGUIDs == null || contactGUIDs.Contains(contact.GUID)))
                    {
                        access.Bid_Create(0, interestGUID, contact.GUID, bidType, 0);
                        selectedContacts.Add(contact);

                        try
                        {
                            string emailTo = contact.Email;
                            string loginURL = Statics.BaseURL + "Default.aspx?Action=Login";
                            string bidDesc = (bidType == BidTypes.RequestFirm ? "a Firm" : "an Indicative");
                            string emailSubject = userData.FirstName + " is requesting " + bidDesc + " price for " + interest.Product;
                            string emailBody = @"Hello, " + userData.FirstName + " " + userData.LastName + @" has requested " + bidDesc + " price for " + interest.Product + @".  To review the details, visit the link below to login to BiddingApp:

<a href=""" + loginURL + @""">" + loginURL + @"</a>

Thank you,

Customer Service
BiddingApp";
                            int contactUserID = Statics.Access.GetUserID(contact.GUID, GUIDTypes.Contact);
                            if (Statics.Access.User_CreateNotificationEmail(contactUserID, userID, NotificationTypes.RequestPrice, emailSubject, emailBody))
                            {
                                Utility.SendEmail(emailTo, emailSubject, Utility.ConvertToHtml(emailBody));
                            }
                        }
                        catch (Exception exc)
                        {
                            Log("RequestPrice notification exception", exc);
                        }
                    }
                }

                foreach (ContactData contact in selectedContacts)
                {
                    int contactUserID = Statics.Access.GetUserID(contact.GUID, GUIDTypes.Contact);
                    SyncInterestUpdate(contactUserID, interestGUID, true);
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

                int interestUserID = Statics.Access.GetUserID(interestGUID, GUIDTypes.Interest);
                SyncInterestUpdate(interestUserID, interestGUID, true);

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("ShowPrice Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string CancelBids(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");

                Statics.Access.Bid_Cancel(userID, interestGUID);

                int interestUserID = Statics.Access.GetUserID(interestGUID, GUIDTypes.Interest);
                SyncInterestUpdate(interestUserID, interestGUID, true);

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("CancelBids Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string ConfirmBid(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");
                string bidGUID = jToken.Value<string>("bidGUID");

                bool success = Statics.Access.Bid_Confirm(userID, bidGUID);
                if (!success) throw new Exception("Unable to confirm bid - userID: " + userID + ", bidGUID: " + bidGUID);

                int bidUserID = Statics.Access.GetUserID(bidGUID, GUIDTypes.Bid);
                if (bidUserID == userID)
                {
                    int interestUserID = Statics.Access.GetUserID(interestGUID, GUIDTypes.Interest);
                    SyncConfirmDeal(interestUserID, interestGUID, bidGUID);
                }
                else SyncConfirmDeal(bidUserID, interestGUID, bidGUID);

                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("ConfirmBid Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string ConfirmCancelBid(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");
                string bidGUID = jToken.Value<string>("bidGUID");

                Statics.Access.Bid_ConfirmCancel(userID, bidGUID);
                int interestUserID = Statics.Access.GetUserID(interestGUID, GUIDTypes.Interest);
                SyncConfirmCancelDeal(interestUserID, interestGUID, bidGUID);

                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("ConfirmCancelBid Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string FillOrder(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string interestGUID = jToken.Value<string>("interestGUID");

                int bidID = Statics.Access.Interest_FillOrder(userID, interestGUID);
                if (bidID == 0) throw new NotifyException("Order already filled by another user");

                int interestUserID = Statics.Access.GetUserID(interestGUID, GUIDTypes.Interest);
                string contactGUID = Statics.Access.Contact_GetGUID(interestUserID, userID);
                SyncOrderFilled(interestUserID, interestGUID, contactGUID);

                InterestData interest = Statics.Access.Interest_Get(0, interestGUID)[0];
                if (interest != null)
                {
                    UserData userData = Statics.Access.GetUserData(userID, null, false);
                    UserData interestUserData = Statics.Access.GetUserData(interestUserID, null, false);
                    string emailTo = interestUserData.Email;
                    string loginURL = Statics.BaseURL + "Default.aspx?Action=Login";
                    string emailSubject = userData.FirstName + " filled your order for " + interest.Product;
                    string emailBody = @"Hello, " + userData.FirstName + " " + userData.LastName + @" has filled your order for " + interest.Product + " at your price of " + interest.Price + @".  To review the details, visit the link below to login to BiddingApp:

<a href=""" + loginURL + @""">" + loginURL + @"</a>

Thank you,

Customer Service
BiddingApp";
                    if (Statics.Access.User_CreateNotificationEmail(interestUserID, userID, NotificationTypes.UserFillsOrder, emailSubject, emailBody))
                    {
                        Utility.SendEmail(emailTo, emailSubject, Utility.ConvertToHtml(emailBody));
                    }
                }

                return JsonConvert.SerializeObject(new { Success = true, Interests = Statics.Access.Interest_Get(userID) });
            }
            catch (Exception ex)
            {
                Log("FillOrder Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string UpdateNotifications(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                List<NotificationTypes> notificationTypes = JsonConvert.DeserializeObject<List<NotificationTypes>>(jToken.Value<JToken>("notificationTypes").ToString());
                Statics.Access.User_UpdateNotifications(userID, notificationTypes);
                return JsonConvert.SerializeObject(new { Success = true, UserData = Statics.Access.GetUserData(userID, null, false) });
            }
            catch (Exception ex)
            {
                Log("UpdateNotifications Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string UpdateSendMonthlyLogTo(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string sendMonthlyDealLogTo = jToken.Value<string>("sendMonthlyDealLogTo");
                string sendMonthlyChatLogTo = jToken.Value<string>("sendMonthlyChatLogTo");

                Statics.Access.User_UpdateSendMonthlyLogTo(userID, sendMonthlyDealLogTo, sendMonthlyChatLogTo);

                return JsonConvert.SerializeObject(new { Success = true, UserData = Statics.Access.GetUserData(userID, null, false) });
            }
            catch (Exception ex)
            {
                Log("UpdateSendMonthlyLogTo Exception", ex);
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
                    contacts = GetContacts(userID);
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

                List<ChatData> newContactRequests = null;
                if (jToken.Value<bool>("newContactRequests"))
                {
                    newContactRequests = Statics.Access.Chat_GetNewContactRequests(userID);
                }

                List<UserData> managerAccounts = null;
                if (jToken.Value<bool>("managerAccounts"))
                {
                    managerAccounts = Statics.Access.User_GetManagerAccounts(userID);
                }

                List<LogDeal> logDeal = null;
                if (jToken.Value<bool>("logDeal"))
                {
                    logDeal = Statics.Access.Log_Deal(userID);
                }

                List<LogChat> logChat = null;
                if (jToken.Value<bool>("logChat"))
                {
                    string email1 = jToken.Value<string>("email1");
                    string email2 = jToken.Value<string>("email2");
                    logChat = Statics.Access.Log_Chat(email1, email2);
                }

                return JsonConvert.SerializeObject(new { Success = true, Contacts = contacts, UserData = userData, Interests = interests, NewContactRequests = newContactRequests, ManagerAccounts = managerAccounts, LogDeal = logDeal, LogChat = logChat, ServerDate = Statics.Access.GetSqlDateTime().ToString() });
            }
            catch (Exception ex)
            {
                Log("GetData Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string ContactUs(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                
                ContactUsData contactUsData = JsonConvert.DeserializeObject<ContactUsData>(jToken.Value<JToken>("formData").ToString());
                UserData userData = Statics.Access.GetUserData(0, jToken.Value<string>("guid"), true);
                if (userData != null)
                {
                    contactUsData.UserID = userData.ID;
                    contactUsData.Email = userData.Email;
                    contactUsData.Name = userData.FirstName + " " + userData.LastName;
                }

                Statics.Access.ContactUs(contactUsData, HttpContext.Current.Request.UserHostAddress);

                string emailBody = "Subject: " + contactUsData.Topic + "<br/>Name: " + contactUsData.Name + "<br/>Email: " + contactUsData.Email + "<br/>Logged In: " + ((contactUsData.UserID > 0) ? "Yes" : "No") + "<br/>Message: " + contactUsData.Message.Replace("\r", "").Replace("\n", "<br/>");
                Utility.SendEmail(Statics.SMTP.Username, "Contact: " + contactUsData.Topic, emailBody);

                return JsonConvert.SerializeObject(new { Success = true });
            }
            catch (Exception ex)
            {
                Log("ContactUs Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string ValidateEmail(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);

                ValidateEmailData validateEmailData = JsonConvert.DeserializeObject<ValidateEmailData>(jToken.Value<JToken>("formData").ToString());
                
                return JsonConvert.SerializeObject(new { Success = Statics.Access.User_ValidateEmail(validateEmailData) });
            }
            catch (Exception ex)
            {
                Log("ValidateEmail Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string AddManager(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string managerFirstName = jToken.Value<string>("firstName");
                string managerLastName = jToken.Value<string>("lastName");
                string managerEmail = jToken.Value<string>("email");
                string newManagerPassword = Statics.Access.User_AddManager(userID, managerFirstName, managerLastName, managerEmail);
                if (!String.IsNullOrEmpty(newManagerPassword))
                {
                    UserData userData = Statics.Access.GetUserData(userID, null, false);
                    string userInfo = userData.FirstName + " " + userData.LastName + " (" + userData.Email + ")";
                    string loginURL = Statics.BaseURL + "Default.aspx?Action=Login";
                    string emailBody = @"Hello, " + userInfo + @" has just added you as their manager on BiddingApp.  An account has already been created for you.  Please login by visiting the link below:

<a href=""" + loginURL + @""">" + loginURL + @"</a>

Your login email is: " + managerEmail + @"
Your temporary password is: " + newManagerPassword + @"

Thank you,

Customer Service
BiddingApp
";
                    Utility.SendEmail(managerEmail, "Manager Request", Utility.ConvertToHtml(emailBody));
                }

                return JsonConvert.SerializeObject(new { Success = true, UserData = Statics.Access.GetUserData(userID, null, false) });
            }
            catch (Exception ex)
            {
                Log("AddManager Exception", ex);
                return JsonError(ex);
            }
        }

        [WebMethod]
        public string RemoveManager(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                int userID = GetUserID(jToken);
                string managerEmail = jToken.Value<string>("email");
                Statics.Access.User_RemoveManager(userID, managerEmail);
                return JsonConvert.SerializeObject(new { Success = true, UserData = Statics.Access.GetUserData(userID, null, false) });
            }
            catch (Exception ex)
            {
                Log("RemoveManager Exception", ex);
                return JsonError(ex);
            }
        }

        private int GetUserID(JToken jToken)
        {
            string sessionGUID = jToken.Value<string>("guid");
            int userID = Statics.Access.GetUserID(sessionGUID, GUIDTypes.Session);
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

        private List<ContactData> SetContactOnlineStatus(int userID, List<ContactData> contacts)
        {
            List<string> appearOnlineEmails = Statics.Access.Contact_GetAppearOnlineList(userID);
            foreach (ContactData contact in contacts)
            {
                BiddingClient client = BiddingHub.GetBiddingClient(contact.Email);
                contact.IsOnline = (client != null && client.IsOnline && appearOnlineEmails.Contains(contact.Email.ToLower()));
            }
            return contacts;
        }

        #region SignalR synchronization methods
        private void SyncBlock(int userID, int contactUserID)
        {
            try
            {
                BiddingClient client = BiddingHub.GetBiddingClient(contactUserID);
                if (client != null)
                {
                    UserData userData = Statics.Access.GetUserData(userID, null, false);
                    var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                    hub.Clients.Client(client.ConnectionID).contactBlocked(JsonConvert.SerializeObject(new { Email = userData.Email, FirstName = userData.FirstName, IsOnline = false, Contacts = GetContacts(contactUserID) }));
                }
            }
            catch (Exception ex)
            {
                Log("SyncBlock Exception", ex);
            }
        }

        private void SyncContacts(int userID)
        {
            try
            {
                BiddingClient client = BiddingHub.GetBiddingClient(userID);
                if (client != null)
                {
                    var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                    hub.Clients.Client(client.ConnectionID).contactsUpdated(JsonConvert.SerializeObject(new { Contacts = GetContacts(userID) }));
                }
            }
            catch (Exception ex)
            {
                Log("SyncContacts Exception", ex);
            }
        }

        private void SyncChat(int sourceUserID, int targetUserID, string chatMessage, bool newContactRequest)
        {
            try
            {
                BiddingClient client = BiddingHub.GetBiddingClient(targetUserID);
                if (client != null)
                {
                    UserData sourceUser = Statics.Access.GetUserData(sourceUserID, null, false);
                    if (sourceUser != null)
                    {
                        var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                        hub.Clients.Client(client.ConnectionID).chatReceived(JsonConvert.SerializeObject(new { FirstName = sourceUser.FirstName, LastName = sourceUser.LastName, Email = sourceUser.Email, Message = chatMessage, NewContactRequest = newContactRequest, DateSent = DateTime.Now.ToString() }));
                    }
                }
            }
            catch (Exception ex)
            {
                Log("SyncChat Exception", ex);
            }
        }

        private void SyncInterestDelete(int userID, string interestGUID)
        {
            try
            {
                if (userID == 0) return;
                BiddingClient client = BiddingHub.GetBiddingClient(userID);
                if (client != null)
                {
                    var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                    hub.Clients.Client(client.ConnectionID).interestDeleted(JsonConvert.SerializeObject(new { InterestGUID = interestGUID }));
                }
            }
            catch (Exception ex)
            {
                Log("SyncInterestDelete Exception", ex);
            }
        }

        public static void SyncInterestUpdate(int userID, string interestGUID) { SyncInterestUpdate(userID, interestGUID, false); }
        public static void SyncInterestUpdate(int userID, string interestGUID, bool openWindow)
        {
            try
            {
                if (userID == 0) return;
                BiddingClient client = BiddingHub.GetBiddingClient(userID);
                if (client != null)
                {
                    InterestData interest = Statics.Access.Interest_Get(userID).First(a => a.InterestGUID == interestGUID);
                    if (interest != null)
                    {
                        var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                        hub.Clients.Client(client.ConnectionID).interestUpdated(JsonConvert.SerializeObject(new { Interest = interest, OpenWindow = openWindow }));
                    }
                }
            }
            catch (Exception ex)
            {
                Statics.GetLogger("Receiver").Log("SyncInterestUpdate Exception", ex);
            }
        }

        private void SyncOrderFilled(int userID, string interestGUID, string contactGUID)
        {
            try
            {
                if (userID == 0) return;
                BiddingClient client = BiddingHub.GetBiddingClient(userID);
                if (client != null)
                {
                    var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                    hub.Clients.Client(client.ConnectionID).orderFilled(JsonConvert.SerializeObject(new { InterestGUID = interestGUID, ContactGUID = contactGUID }));
                }
            }
            catch (Exception ex)
            {
                Log("SyncConfirmDeal Exception", ex);
            }
        }

        private void SyncConfirmDeal(int userID, string interestGUID, string bidGUID)
        {
            try
            {
                if (userID == 0) return;
                BiddingClient client = BiddingHub.GetBiddingClient(userID);
                if (client != null)
                {
                    var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                    hub.Clients.Client(client.ConnectionID).confirmDeal(JsonConvert.SerializeObject(new { InterestGUID = interestGUID, BidGUID = bidGUID }));
                }
            }
            catch (Exception ex)
            {
                Log("SyncConfirmDeal Exception", ex);
            }
        }

        public static void SyncConfirmCancelDeal(int userID, string interestGUID, string bidGUID)
        {
            try
            {
                if (userID == 0) return;
                BiddingClient client = BiddingHub.GetBiddingClient(userID);
                if (client != null)
                {
                    var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                    hub.Clients.Client(client.ConnectionID).confirmCancelDeal(JsonConvert.SerializeObject(new { InterestGUID = interestGUID, BidGUID = bidGUID }));
                }
            }
            catch (Exception ex)
            {
                Statics.GetLogger("Receiver").Log("SyncConfirmCancelDeal Exception", ex);
            }
        }

        private void SyncForceLogout(int userID)
        {
            try
            {
                if (userID == 0) return;
                BiddingClient client = BiddingHub.GetBiddingClient(userID);
                if (client != null)
                {
                    var hub = GlobalHost.ConnectionManager.GetHubContext<BiddingHub>();
                    hub.Clients.Client(client.ConnectionID).forceLogout(JsonConvert.SerializeObject(new { }));
                }
            }
            catch (Exception ex)
            {
                Log("SyncForceLogout Exception", ex);
            }
        }
        #endregion
    }

    public class SessionData
    {
        public string GUID;
        public UserData UserData;
    }

    public class UserData
    {
        public int ID;
        public string FirstName, LastName, Company, Country, Email, Password, SendMonthlyDealLogTo, SendMonthlyChatLogTo, PasswordChangeDate;
        public bool MembershipBasic, MembershipAdvance;
        public MembershipTypes MembershipType;
        public List<NotificationTypes> NotificationTypes = new List<NotificationTypes>();
        public List<string> Managers = new List<string>();
        public List<ContactData> Contacts = new List<ContactData>();
    }

    public class ContactData
    {
        public int ID, RecentChatID;
        public string GUID, Email, FirstName, LastName, Company;
        public bool AllowBid, Block, AppearOnline, IsOnline;
        public MembershipTypes MembershipTypeID;
        public List<ChatData> UnreadMessages = new List<ChatData>();
    }

    public class ContactUsData
    {
        public int UserID;
        public string Name, Email, Topic, Message;
    }

    public class ValidateEmailData
    {
        public string Email, Token;
    }

    public class InterestData
    {
        public InterestTypes InterestType;
        public string Product, Condition, Quantity, Remarks, InterestGUID, ContactGUID, ExpirationDate, StatusDate, StatusDescription, BidGUID;
        public decimal Price, PriceShowing;
        public BidTypes BidType;
        public List<BidData> Bids = new List<BidData>();
    }

    public class BidData
    {
        public string InterestGUID, ContactGUID, CreationDate, BidGUID;
        public BidTypes BidType;
        public decimal Price;
    }

    public class NotifyException : Exception
    {
        public NotifyException(string str) : base(str) { }
    }

    public class ChatData
    {
        public int ID;
        public string Email, FirstName, LastName, Message, DateSent;
        public bool Outgoing, NewContactRequest;
    }

    public class LogDeal
    {
        public string Date, Name1, Email1, Company1, BuySell, Name2, Company2, Email2, Product, Condition, Quantity;
        public decimal Price;
    }

    public class LogChat
    {
        public string EmailFrom, EmailTo, FirstNameFrom, FirstNameTo, Message, Date;
    }
}
