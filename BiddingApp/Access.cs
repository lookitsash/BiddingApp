using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Foundation;
using System.Data;
using System.Data.SqlClient;
using System.Collections;

namespace BiddingApp
{
    public class Access : SmartSql
    {
        public Access(string dbConnectionString) : base(ConnectionStringAdapter.Create(dbConnectionString).SetInitialCatalog("Bidding")) { }

        private SqlCommand SqlProc(string stpName) { return new SqlCommand() { CommandText = stpName, CommandType = CommandType.StoredProcedure }; }
        private SqlCommand SqlText(string sql) { return new SqlCommand() { CommandText = sql, CommandType = CommandType.Text }; }
        private void SqlParam(SqlCommand cmd, string paramName, object paramValue)
        {
            cmd.Parameters.AddWithValue(paramName, paramValue);
        }
        private void SqlParamOut(SqlCommand cmd, string paramName, SqlDbType dbType)
        {
            cmd.Parameters.Add(paramName, dbType).Direction = ParameterDirection.Output;
        }
        private T SqlParamGet<T>(SqlCommand cmd, string paramName) { return ValueConverter.Get<T>(cmd.Parameters[paramName].Value); }

        /*
        public int GetUserID(string sessionGUID) { return GetUserID(sessionGUID, null, null, null); }
        public int GetUserID(string sessionGUID, string email, string interestGUID, string contactGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_User_Get"))
            {
                if (!String.IsNullOrEmpty(sessionGUID)) SqlParam(cmd, "SessionGUID", sessionGUID);
                if (!String.IsNullOrEmpty(email)) SqlParam(cmd, "Email", email);
                if (!String.IsNullOrEmpty(interestGUID)) SqlParam(cmd, "InterestGUID", interestGUID);
                if (!String.IsNullOrEmpty(contactGUID)) SqlParam(cmd, "ContactGUID", contactGUID);
                return ExecuteScalar<int>(cmd);
            }
        }
        */
        public int GetUserID(string guid, GUIDTypes guidType)
        {
            using (SqlCommand cmd = SqlProc("STP_User_Get"))
            {
                if (guidType == GUIDTypes.Session) SqlParam(cmd, "SessionGUID", guid);
                else if (guidType == GUIDTypes.Email) SqlParam(cmd, "Email", guid);
                else if (guidType == GUIDTypes.Interest) SqlParam(cmd, "InterestGUID", guid);
                else if (guidType == GUIDTypes.Contact) SqlParam(cmd, "ContactGUID", guid);
                else if (guidType == GUIDTypes.Bid) SqlParam(cmd, "BidGUID", guid);
                return ExecuteScalar<int>(cmd);
            }
        }

        public void User_UpdateNotifications(int userID, List<NotificationTypes> notificationTypes)
        {
            using (SqlCommand cmd = SqlProc("STP_User_UpdateNotifications"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "NotificationTypeIDs", string.Join(",", notificationTypes.Select(x => ((int)x).ToString()).ToArray()));
                ExecuteNonQuery(cmd);
            }
        }

        public UserData GetUserData(int userID, string sessionGUID, bool includeUserID)
        {
            using (SqlCommand cmd = SqlProc("STP_User_GetData"))
            {
                if (userID > 0) SqlParam(cmd, "UserID", userID);
                if (!String.IsNullOrEmpty(sessionGUID)) SqlParam(cmd, "SessionGUID", sessionGUID);

                UserData userData = null;
                DataSet ds = GetSet(cmd);
                for (int i = 0; i < ds.Tables.Count; i++)
                {
                    DataTable dt = ds.Tables[i];
                    if (i == 0)
                    {
                        if (dt.Rows.Count > 0)
                        {
                            DataRowAdapter dra = DataRowAdapter.Create(dt.Rows[0]);
                            userData = new UserData()
                            {
                                FirstName = dra.Get<string>("FirstName"),
                                LastName = dra.Get<string>("LastName"),
                                Company = dra.Get<string>("Company"),
                                Country = dra.Get<string>("Country"),
                                Email = dra.Get<string>("Email"),
                                MembershipType = (MembershipTypes)dra.Get<int>("MembershipTypeID"),
                                SendMonthlyDealLogTo = dra.Get<string>("SendMonthlyDealLogTo"),
                                SendMonthlyChatLogTo = dra.Get<string>("SendMonthlyChatLogTo"),
                                PasswordChangeDate = dra.Get<string>("PasswordChangeDate")
                            };
                            if (includeUserID) userData.ID = dra.Get<int>("ID");
                        }                        
                    }
                    else if (i == 1)
                    {
                        if (userData != null)
                        {
                            foreach (DataRowAdapter dra in DataRowAdapter.Create(dt.Rows))
                            {
                                userData.NotificationTypes.Add((NotificationTypes)dra.Get<int>("NotificationTypeID"));
                            }
                        }
                    }
                    else if (i == 2)
                    {
                        if (userData != null)
                        {
                            foreach (DataRowAdapter dra in DataRowAdapter.Create(dt.Rows))
                            {
                                userData.Managers.Add(dra.Get<string>("ManagerEmail"));
                            }
                        }
                    }
                }
                return userData;
            }
        }

        public void Signup(UserData signupData)
        {
            using (SqlCommand cmd = SqlProc("STP_User_Register"))
            {
                SqlParam(cmd, "FirstName", signupData.FirstName);
                SqlParam(cmd, "LastName", signupData.LastName);
                SqlParam(cmd, "Company", signupData.Company);
                SqlParam(cmd, "Country", signupData.Country);
                SqlParam(cmd, "Email", signupData.Email);
                SqlParam(cmd, "Password", signupData.Password);
                SqlParam(cmd, "MembershipTypeID", signupData.MembershipBasic ? MembershipTypes.Basic : MembershipTypes.Advance);
                SqlParamOut(cmd, "UserID", SqlDbType.Int);
                ExecuteNonQuery(cmd);
                signupData.ID = SqlParamGet<int>(cmd, "UserID");
            }
        }

        public string Login(string email, string password, string ipAddress, string userAgent)
        {
            using (SqlCommand cmd = SqlProc("STP_User_Login"))
            {
                SqlParam(cmd, "Email", email);
                SqlParam(cmd, "Password", password);
                SqlParam(cmd, "IPAddress", ipAddress);
                SqlParam(cmd, "UserAgent", userAgent);
                return ExecuteScalar<string>(cmd);
            }
        }

        public DataRowAdapter Contact_Add(int userID, string contactEmail)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_Add"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactEmail", contactEmail);
                return GetTopRow(cmd);
            }
        }

        public string Contact_GetGUID(int userID, int contactUserID)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_GetGUID"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactUserID", contactUserID);
                return ExecuteScalar<string>(cmd);
            }
        }

        public void Contact_SetOnlineStatus(int userID, string contactGUID, bool isOnline)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_SetOnlineStatus"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactGUID", contactGUID);
                SqlParam(cmd, "IsOnline", isOnline);
                ExecuteNonQuery(cmd);
            }
        }

        public List<ContactData> Contact_Get(int userID)
        {
            List<ContactData> contacts = new List<ContactData>();
            using (SqlCommand cmd = SqlProc("STP_Contact_Get"))
            {
                SqlParam(cmd, "UserID", userID);
                DataSet ds = GetSet(cmd);
                for (int i = 0; i < ds.Tables.Count; i++)
                {
                    foreach (DataRowAdapter dra in DataRowAdapter.Create(ds.Tables[i].Rows))
                    {
                        if (i == 0)
                        {
                            contacts.Add(new ContactData()
                            {
                                Email = dra.Get<string>("Email"),
                                FirstName = dra.Get<string>("FirstName"),
                                LastName = dra.Get<string>("LastName"),
                                GUID = dra.Get<string>("GUID"),
                                AllowBid = dra.Get<bool>("AllowBid"),
                                Block = dra.Get<bool>("Block"),
                                AppearOnline = dra.Get<bool>("AppearOnline"),
                                MembershipTypeID = (MembershipTypes)dra.Get<int>("MembershipTypeID"),
                                RecentChatID = dra.Get<int>("RecentChatID"),
                                Company = dra.Get<string>("Company")
                            });
                        }
                        else if (i == 1)
                        {
                            ContactData contact = contacts.First(c => c.GUID == dra.Get<string>("ContactGUID"));
                            if (contact != null)
                            {
                                contact.UnreadMessages.Add(new ChatData()
                                {
                                    ID = dra.Get<int>("ChatID"),
                                    Email = dra.Get<string>("Email"),
                                    FirstName = dra.Get<string>("FirstName"),
                                    LastName = dra.Get<string>("LastName"),
                                    Message = dra.Get<string>("Message"),
                                    DateSent = dra.Get<string>("DateSent")
                                });
                            }
                        }
                    }
                }
            }
            return contacts;
        }

        public void Contact_Delete(int userID, string contactGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_Delete"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactGUID", contactGUID);
                ExecuteNonQuery(cmd);
            }
        }

        public void Contact_Block(int userID, string contactGUID, string contactEmail)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_Block"))
            {
                SqlParam(cmd, "UserID", userID);
                if (!String.IsNullOrEmpty(contactGUID)) SqlParam(cmd, "ContactGUID", contactGUID);
                if (!String.IsNullOrEmpty(contactEmail)) SqlParam(cmd, "ContactEmail", contactEmail);
                ExecuteNonQuery(cmd);
            }
        }

        public void Contact_Unblock(int userID, string contactGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_Unblock"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactGUID", contactGUID);
                ExecuteNonQuery(cmd);
            }
        }

        public bool Contact_IsBlocked(int userID, string contactEmail)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_IsBlocked"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactEmail", contactEmail);
                return ExecuteScalar<bool>(cmd);
            }
        }

        public void Contact_Update(int userID, string contactGUID, bool allowBid)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_Update"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactGUID", contactGUID);
                SqlParam(cmd, "AllowBid", allowBid);
                ExecuteNonQuery(cmd);
            }
        }

        public void Chat(int userID, string emailTo, string message)
        {
            using (SqlCommand cmd = SqlProc("STP_Chat"))
            {
                SqlParam(cmd, "UserIDFrom", userID);
                SqlParam(cmd, "EmailTo", emailTo);
                SqlParam(cmd, "Message", message);
                ExecuteNonQuery(cmd);
            }
        }

        public void Chat_MarkRead(int userID, int userIDFrom)
        {
            using (SqlCommand cmd = SqlProc("STP_Chat_MarkRead"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "UserIDFrom", userIDFrom);
                ExecuteNonQuery(cmd);
            }
        }

        public List<ChatData> Chat_GetNewContactRequests(int userID)
        {
            List<ChatData> chatItems = new List<ChatData>();
            using (SqlCommand cmd = SqlProc("STP_Chat_GetNewContactRequests"))
            {
                SqlParam(cmd, "UserID", userID);
                foreach (DataRowAdapter dra in DataRowAdapter.Create(GetTable(cmd)))
                {
                    ChatData chatData = new ChatData() { ID = dra.Get<int>("ChatID"), FirstName = dra.Get<string>("FirstName"), LastName = dra.Get<string>("LastName"), Email = dra.Get<string>("Email"), Message = dra.Get<string>("Message"), NewContactRequest = true, DateSent = dra.Get<string>("DateSent") };
                    chatItems.Add(chatData);
                }
            }
            return chatItems;
        }

        public List<ChatData> Chat_Get(int userID, string emailTo, int lastChatID)
        {
            List<ChatData> chatItems = new List<ChatData>();
            using (SqlCommand cmd = SqlProc("STP_Chat_Get"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "EmailTo", emailTo);
                SqlParam(cmd, "LastChatID", lastChatID);
                foreach (DataRowAdapter dra in DataRowAdapter.Create(GetTable(cmd)))
                {
                    ChatData chatData = new ChatData() { ID = dra.Get<int>("ChatID"), FirstName = dra.Get<string>("FirstName"), Message = dra.Get<string>("Message"), Outgoing = dra.Get<bool>("Outgoing"), DateSent = dra.Get<string>("DateSent") };
                    chatItems.Add(chatData);
                }
            }
            return chatItems;
        }

        public void Interest_Create(int userID, InterestData interestData)
        {
            using (SqlCommand cmd = SqlProc("STP_Interest_Create"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "InterestTypeID", (int)interestData.InterestType);
                SqlParam(cmd, "Name", interestData.Product);
                SqlParam(cmd, "Condition", interestData.Condition);
                SqlParam(cmd, "Quantity", interestData.Quantity);
                SqlParam(cmd, "Remarks", interestData.Remarks);
                ExecuteNonQuery(cmd);
            }
        }

        public List<InterestData> Interest_Get(int userID) { return Interest_Get(userID, null); }
        public List<InterestData> Interest_Get(int userID, string specificInterestGUID)
        {
            List<InterestData> interests = new List<InterestData>();
            using (SqlCommand cmd = SqlProc("STP_Interest_Get"))
            {
                if (userID > 0) SqlParam(cmd, "UserID", userID);
                if (!String.IsNullOrEmpty(specificInterestGUID)) SqlParam(cmd, "InterestGUID", specificInterestGUID);
                DataSet ds = GetSet(cmd);
                for (int i = 0; i < ds.Tables.Count; i++)
                {
                    foreach (DataRowAdapter dra in DataRowAdapter.Create(ds.Tables[i].Rows))
                    {
                        if (i == 0)
                        {
                            InterestData interestData = new InterestData()
                            {
                                InterestType = (InterestTypes)dra.Get<int>("InterestTypeID"),
                                Product = dra.Get<string>("Name"),
                                Condition = dra.Get<string>("Condition"),
                                Quantity = dra.Get<string>("Quantity"),
                                Remarks = dra.Get<string>("Remarks"),
                                Price = dra.Get<decimal>("Price"),
                                ExpirationDate = dra.Get<string>("ExpirationDate"),
                                InterestGUID = dra.Get<string>("InterestGUID"),
                                ContactGUID = dra.Get<string>("ContactGUID"),
                                StatusDate = dra.Get<string>("StatusDate"),
                                StatusDescription = dra.Get<string>("StatusDescription"),
                                PriceShowing = dra.Get<decimal>("PriceShowing"),
                                BidType = (BidTypes)dra.Get<int>("BidTypeID"),
                                BidGUID = dra.Get<string>("BidGUID")
                            };
                            interests.Add(interestData);
                        }
                        else if (i == 1)
                        {
                            string interestGUID = dra.Get<string>("InterestGUID");
                            InterestData interest = interests.First(a => a.InterestGUID == interestGUID);
                            if (interest != null)
                            {
                                interest.Bids.Add(new BidData()
                                {
                                    InterestGUID = interestGUID,
                                    ContactGUID = dra.Get<string>("ContactGUID"),
                                    BidGUID = dra.Get<string>("BidGUID"),
                                    BidType = (BidTypes)dra.Get<int>("BidTypeID"),
                                    Price = dra.Get<decimal>("Price"),
                                    CreationDate = dra.Get<string>("CreationDate")
                                });
                            }
                        }
                    }
                }
            }
            return interests;
        }

        public void Interest_PlaceOrder(int userID, string interestGUID, decimal price, int hours, int minutes)
        {
            using (SqlCommand cmd = SqlProc("STP_Interest_PlaceOrder"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "InterestGUID", interestGUID);
                SqlParam(cmd, "Price", price);
                if (hours > 0) SqlParam(cmd, "GoodUntil_Hours", hours);
                if (minutes > 0) SqlParam(cmd, "GoodUntil_Mins", minutes);
                ExecuteNonQuery(cmd);
            }
        }

        public int Interest_FillOrder(int userID, string interestGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Interest_FillOrder"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "InterestGUID", interestGUID);
                return ExecuteScalar<int>(cmd);
            }
        }

        public void Interest_CancelOrder(int userID, string interestGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Interest_CancelOrder"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "InterestGUID", interestGUID);
                ExecuteNonQuery(cmd);
            }
        }

        public void Interest_Delete(int userID, string interestGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Interest_Delete"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "InterestGUID", interestGUID);
                ExecuteNonQuery(cmd);
            }
        }

        public void Bid_Create(int userID, string interestGUID, string contactGUID, BidTypes bidType, decimal price)
        {
            using (SqlCommand cmd = SqlProc("STP_Bid_Create"))
            {
                if (userID > 0) SqlParam(cmd, "UserID", userID);
                if (!String.IsNullOrEmpty(contactGUID)) SqlParam(cmd, "ContactGUID", contactGUID);
                SqlParam(cmd, "InterestGUID", interestGUID);
                SqlParam(cmd, "BidTypeID", (int)bidType);
                if (price > 0) SqlParam(cmd, "Price", price);
                ExecuteNonQuery(cmd);
            }
        }

        public void Bid_Cancel(int userID, string interestGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Bid_Cancel"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "InterestGUID", interestGUID);
                ExecuteNonQuery(cmd);
            }
        }

        public bool Bid_Confirm(int userID, string bidGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Bid_Confirm"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "BidGUID", bidGUID);
                return ExecuteScalar<bool>(cmd);
            }
        }

        public void Bid_ConfirmCancel(int userID, string bidGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Bid_ConfirmCancel"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "BidGUID", bidGUID);
                ExecuteNonQuery(cmd);
            }
        }

        public void ContactUs(ContactUsData contactUsData, string ipAddress)
        {
            using (SqlCommand cmd = SqlProc("STP_ContactUs"))
            {
                SqlParam(cmd, "Name", contactUsData.Name);
                SqlParam(cmd, "Email", contactUsData.Email);
                if (contactUsData.UserID > 0) SqlParam(cmd, "UserID", contactUsData.UserID);
                SqlParam(cmd, "Topic", contactUsData.Topic);
                SqlParam(cmd, "Message", contactUsData.Message);
                SqlParam(cmd, "IPAddress", ipAddress);
                ExecuteNonQuery(cmd);
            }
        }

        public bool User_ValidateEmail(ValidateEmailData validateEmailData)
        {
            using (SqlCommand cmd = SqlProc("STP_User_VerifyEmail"))
            {
                SqlParam(cmd, "Email", validateEmailData.Email);
                SqlParam(cmd, "Token", validateEmailData.Token);
                return ExecuteScalar<bool>(cmd);
            }
        }

        public bool User_IsPasswordValid(int userID, string password)
        {
            using (SqlCommand cmd = SqlProc("STP_User_IsPasswordValid"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "Password", password);
                return ExecuteScalar<bool>(cmd);
            }
        }

        public string User_GetEmailValidationToken(string email)
        {
            using (SqlCommand cmd = SqlProc("STP_User_GetVerificationToken"))
            {
                SqlParam(cmd, "Email", email);
                return ExecuteScalar<string>(cmd);
            }
        }

        public string User_CreatePasswordResetToken(string email, string ipAddress)
        {
            using (SqlCommand cmd = SqlProc("STP_User_CreatePasswordResetToken"))
            {
                SqlParam(cmd, "Email", email);
                SqlParam(cmd, "IPAddress", ipAddress);
                return ExecuteScalar<string>(cmd);
            }
        }

        public bool User_IsPasswordResetTokenValid(string token)
        {
            using (SqlCommand cmd = SqlProc("STP_User_IsPasswordResetTokenValid"))
            {
                SqlParam(cmd, "Token", token);
                return ExecuteScalar<bool>(cmd);
            }
        }

        public void User_ChangePassword(int userID, string resetToken, string password)
        {
            using (SqlCommand cmd = SqlProc("STP_User_ChangePassword"))
            {
                if (!String.IsNullOrEmpty(resetToken)) SqlParam(cmd, "ResetToken", resetToken);
                if (userID > 0) SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "Password", password);
                ExecuteNonQuery(cmd);
            }
        }

        public EmailVerificationStatuses User_GetVerificationStatus(string email, string password)
        {
            using (SqlCommand cmd = SqlProc("STP_User_GetVerificationStatus"))
            {
                SqlParam(cmd, "Email", email);
                SqlParam(cmd, "Password", password);
                return (EmailVerificationStatuses)ExecuteScalar<int>(cmd);
            }
        }

        public void User_UpdateSendMonthlyLogTo(int userID, string sendMonthlyDealLogTo, string sendMonthlyChatLogTo)
        {
            using (SqlCommand cmd = SqlProc("STP_User_UpdateSendMonthlyLogTo"))
            {
                SqlParam(cmd, "UserID", userID);
                if (sendMonthlyDealLogTo != null) SqlParam(cmd, "SendMonthlyDealLogTo", sendMonthlyDealLogTo);
                if (sendMonthlyChatLogTo != null) SqlParam(cmd, "SendMonthlyChatLogTo", sendMonthlyChatLogTo);
                ExecuteNonQuery(cmd);
            }
        }

        public List<string> Contact_GetAppearOnlineList(int userID)
        {
            List<string> emails = new List<string>();
            using (SqlCommand cmd = SqlProc("STP_Contact_GetAppearOnlineList"))
            {
                SqlParam(cmd, "UserID", userID);
                foreach (DataRowAdapter dra in DataRowAdapter.Create(GetTable(cmd)))
                {
                    emails.Add(dra.Get<string>("Email").ToLower());
                }
            }
            return emails;
        }

        public string User_AddManager(int userID, string managerFirstName, string managerLastName, string managerEmail)
        {
            using (SqlCommand cmd = SqlProc("STP_User_AddManager"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ManagerFirstName", managerFirstName);
                SqlParam(cmd, "ManagerLastName", managerLastName);
                SqlParam(cmd, "ManagerEmail", managerEmail);
                return ExecuteScalar<string>(cmd);
            }
        }

        public void User_RemoveManager(int userID, string managerEmail)
        {
            using (SqlCommand cmd = SqlProc("STP_User_RemoveManager"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ManagerEmail", managerEmail);
                ExecuteNonQuery(cmd);
            }
        }

        public List<UserData> User_GetManagerAccounts(int userID)
        {
            List<UserData> managerAccounts = new List<UserData>();
            using (SqlCommand cmd = SqlProc("STP_User_GetManagerAccounts"))
            {
                SqlParam(cmd, "UserID", userID);
                DataSet ds = GetSet(cmd);
                for (int i = 0; i < ds.Tables.Count; i++)
                {
                    DataTable dt = ds.Tables[i];
                    foreach (DataRowAdapter dra in DataRowAdapter.Create(dt.Rows))
                    {
                        if (i == 0)
                        {
                            managerAccounts.Add(new UserData() { FirstName = dra.Get<string>("FirstName"), LastName = dra.Get<string>("LastName"), Company = dra.Get<string>("Company"), Email = dra.Get<string>("Email") });
                        }
                        else if (i == 1)
                        {
                            UserData managerAccount = managerAccounts.First(u => u.Email.ToLower() == dra.Get<string>("Email").ToLower());
                            if (managerAccount != null)
                            {
                                managerAccount.Contacts.Add(new ContactData() { FirstName = dra.Get<string>("ContactFirstName"), LastName = dra.Get<string>("ContactLastName"), Company = dra.Get<string>("ContactCompany"), Email = dra.Get<string>("ContactEmail") });
                            }
                        }
                    }
                }                
            }
            return managerAccounts;
        }

        public bool User_CreateNotificationEmail(int userID, int sourceUserID, NotificationTypes notificationType, string subject, string message)
        {
            using (SqlCommand cmd = SqlProc("STP_User_CreateNotificationEmail"))
            {
                SqlParam(cmd, "UserID", userID);
                if (sourceUserID > 0) SqlParam(cmd, "SourceUserID", sourceUserID);
                SqlParam(cmd, "NotificationTypeID", notificationType);
                SqlParam(cmd, "Subject", subject);
                SqlParam(cmd, "Message", message);
                return ExecuteScalar<bool>(cmd);
            }
        }

        public List<LogChat> Log_Chat(string email1, string email2)
        {
            List<LogChat> chats = new List<LogChat>();
            using (SqlCommand cmd = SqlProc("STP_Log_Chat"))
            {
                SqlParam(cmd, "Email1", email1);
                SqlParam(cmd, "Email2", email2);
                foreach (DataRowAdapter dra in DataRowAdapter.Create(GetTable(cmd)))
                {
                    chats.Add(new LogChat() { EmailFrom = dra.Get<string>("EmailFrom"), EmailTo = dra.Get<string>("EmailTo"), Message = dra.Get<string>("Message"), Date = dra.Get<string>("CreationDate"), FirstNameFrom = dra.Get<string>("FirstNameFrom"), FirstNameTo = dra.Get<string>("FirstNameTo") });
                }
            }            
            return chats;
        }

        public List<LogDeal> Log_Deal(int userID)
        {
            List<LogDeal> deals = new List<LogDeal>();
            using (SqlCommand cmd = SqlProc("STP_Log_Deal"))
            {
                SqlParam(cmd, "UserID", userID);
                foreach (DataRowAdapter dra in DataRowAdapter.Create(GetTable(cmd)))
                {
                    deals.Add(new LogDeal()
                    {
                        Date = dra.Get<string>("CreationDate"),
                        Name1 = dra.Get<string>("Name1"),
                        Email1 = dra.Get<string>("Email1"),
                        Company1 = dra.Get<string>("Company1"),
                        BuySell = dra.Get<string>("BuySell"),
                        Name2 = dra.Get<string>("Name2"),
                        Company2 = dra.Get<string>("Company2"),
                        Email2 = dra.Get<string>("Email2"),
                        Product = dra.Get<string>("Product"),
                        Condition = dra.Get<string>("Condition"),
                        Quantity = dra.Get<string>("Quantity"),
                        Price = dra.Get<decimal>("Price")
                    });
                }
            }
            return deals;
        }

        public DateTime GetSqlDateTime()
        {
            return ExecuteScalar<DateTime>("select getdate()");
        }
    }
}