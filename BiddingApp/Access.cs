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

        public int GetUserID(string sessionGUID) { return GetUserID(sessionGUID, null); }
        public int GetUserID(string sessionGUID, string email)
        {
            using (SqlCommand cmd = SqlProc("STP_User_Get"))
            {
                if (!String.IsNullOrEmpty(sessionGUID)) SqlParam(cmd, "SessionGUID", sessionGUID);
                if (!String.IsNullOrEmpty(email)) SqlParam(cmd, "Email", email);
                return ExecuteScalar<int>(cmd);
            }
        }

        public UserData GetUserData(int userID, string sessionGUID, bool includeUserID)
        {
            using (SqlCommand cmd = SqlProc("STP_User_GetData"))
            {
                if (userID > 0) SqlParam(cmd, "UserID", userID);
                if (!String.IsNullOrEmpty(sessionGUID)) SqlParam(cmd, "SessionGUID", sessionGUID);
                DataRowAdapter dra = DataRowAdapter.Create(GetTopRow(cmd));
                if (dra != null)
                {
                    UserData userData = new UserData()
                    {
                        FirstName = dra.Get<string>("FirstName"),
                        LastName = dra.Get<string>("LastName"),
                        Company = dra.Get<string>("Company"),
                        Country = dra.Get<string>("Country"),
                        Email = dra.Get<string>("Email"),
                        MembershipType = (MembershipTypes)dra.Get<int>("MembershipTypeID")
                    };
                    if (includeUserID) userData.ID = dra.Get<int>("ID");
                    return userData;
                }
                else return null;
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

        public void Contact_Add(int userID, string contactEmail)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_Add"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactEmail", contactEmail);
                ExecuteNonQuery(cmd);
            }
        }

        public List<ContactData> Contact_Get(int userID)
        {
            List<ContactData> contacts = new List<ContactData>();
            using (SqlCommand cmd = SqlProc("STP_Contact_Get"))
            {
                SqlParam(cmd, "UserID", userID);
                foreach (DataRowAdapter dra in DataRowAdapter.Create(GetTable(cmd)))
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
                        RecentChatID = dra.Get<int>("RecentChatID")
                    });
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

        public void Contact_Block(int userID, string contactGUID)
        {
            using (SqlCommand cmd = SqlProc("STP_Contact_Block"))
            {
                SqlParam(cmd, "UserID", userID);
                SqlParam(cmd, "ContactGUID", contactGUID);
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
                    ChatData chatData = new ChatData() { ID = dra.Get<int>("ChatID"), FirstName = dra.Get<string>("FirstName"), Message = dra.Get<string>("Message"), Outgoing = dra.Get<bool>("Outgoing") };
                    chatItems.Add(chatData);
                }
            }
            return chatItems;
        }
    }
}