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
    }
}