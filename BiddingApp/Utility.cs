using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net;
using System.Net.Mail;

namespace BiddingApp
{
    public static class Utility
    {
        public static void SendEmail(string mailTo, string subject, string body)
        {
            try
            {
                SmtpClient smtpClient = new SmtpClient(Statics.SMTP.Server, Statics.SMTP.Port);
                smtpClient.Credentials = new NetworkCredential(Statics.SMTP.Username, Statics.SMTP.Password);
                MailMessage mailMessage = new MailMessage(Statics.SMTP.Username, mailTo, subject, body);
                mailMessage.IsBodyHtml = true;
                smtpClient.Send(mailMessage);
            }
            catch (Exception ex)
            {
                Statics.GetLogger("Utility").Log("SendEmail Exception", ex);
            }
        }

        public static string ConvertToHtml(string str)
        {
            return str.Replace("\r", "").Replace("\n", "<br/>");
        }
    }
}