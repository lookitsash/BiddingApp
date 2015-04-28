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

        public int GetUserID(string email)
        {
            using (SqlCommand cmd = SqlProc("STP_User_Get"))
            {
                SqlParam(cmd, "Email", email);
                return ExecuteScalar<int>(cmd);
            }
        }

        public void Signup(SignupData signupData)
        {
            using (SqlCommand cmd = SqlProc("STP_User_Register"))
            {
                SqlParam(cmd, "FirstName", signupData.firstName);
                SqlParam(cmd, "LastName", signupData.lastName);
                SqlParam(cmd, "Company", signupData.company);
                SqlParam(cmd, "Country", signupData.country);
                SqlParam(cmd, "Email", signupData.email);
                SqlParam(cmd, "Password", signupData.password);
                SqlParam(cmd, "MembershipTypeID", signupData.membershipBasic ? MembershipTypes.Basic : MembershipTypes.Advance);
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
    }
}