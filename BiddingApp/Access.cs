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
    }
}