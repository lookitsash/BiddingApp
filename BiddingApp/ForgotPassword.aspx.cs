using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace BiddingApp
{
    public partial class ForgotPassword : BasePage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string token = RequestGet<string>("Token");
            if (!String.IsNullOrEmpty(token))
            {
                if (!Statics.Access.User_IsPasswordResetTokenValid(token)) Response.Redirect("ForgotPassword.aspx");
            }
        }
    }
}