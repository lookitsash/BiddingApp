using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Foundation;

namespace BiddingApp
{
    public class BasePage : SmartPage
    {
        protected override Logger GetLogger(string name)
        {
            return Statics.GetLogger(name);
        }
    }
}