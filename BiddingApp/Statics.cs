using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Foundation;

namespace BiddingApp
{
    public static class Statics
    {
        static Statics()
        {
            Logger.SetDefaultFilePathFormat(LogDirectory);
        }

        public static ConnectionStringAdapter GetSqlConnectionStringAdapter() { return ConfigAdapter.GetConnectionStringAdapter("SqlConnectionString").SetApplicationName(ConfigAdapter.GetConnectionStringAdapter("SqlConnectionString").SqlConnectionStringBuilder.ApplicationName + " [" + Environment.MachineName + "]" + (GeneralUtil.IsVisualStudioMode ? " (Visual Studio)" : String.Empty)); }
        public static string SqlConnectionString { get { return GetSqlConnectionStringAdapter().SqlConnectionString; } }

        public static string LogDirectory { get { return ConfigAdapter.GetAppSetting("LogDirectory"); } }

        public static Logger GetLogger() { return GetLogger(String.Empty); }
        public static Logger GetLogger(string name)
        {
            return new Logger(name);
        }

        public static Access Access { get { return new Access(SqlConnectionString); } }

        public static bool DevMode { get { return ConfigAdapter.GetAppSetting<bool>("DevMode"); } }
        public static string DevEmail { get { return ConfigAdapter.GetAppSetting("DevEmail"); } }
        public static string DevPassword { get { return ConfigAdapter.GetAppSetting("DevPassword"); } }

        public static string BaseURL { get { return ConfigAdapter.GetAppSetting("BaseURL"); } }
        
        public static class SMTP
        {
            public static string Server { get { return ConfigAdapter.GetAppSetting("SMTP_Server"); } }
            public static string Username { get { return ConfigAdapter.GetAppSetting("SMTP_Username"); } }
            public static string Password { get { return ConfigAdapter.GetAppSetting("SMTP_Password"); } }
            public static int Port { get { return ConfigAdapter.GetAppSetting<int>("SMTP_Port"); } }
        }
    }
}