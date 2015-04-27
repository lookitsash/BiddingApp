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

        

        private void Log(string str) { Statics.GetLogger("Receiver").Log(str); }
        private void Log(string str, Exception ex) { Statics.GetLogger("Receiver").Log(str, ex); }
    }
}
