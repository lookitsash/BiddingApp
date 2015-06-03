<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="ForgotPassword.aspx.cs" Inherits="BiddingApp.ForgotPassword" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
<script type="text/javascript" src="Resources/Scripts/ForgotPassword.js"></script>
<script src='https://www.google.com/recaptcha/api.js'></script>
    <style>
        #forgotPasswordStep2Completed a { text-decoration: underline; }
        #forgotPasswordStep2Completed a:visited { color:#ffffff; }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_HEADING" runat="server">FORGOT PASSWORD</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="CPH_CONTENT" runat="server">
<center>
<br />
<div id="forgotPasswordStep1">
<div class="errorHeader">Please enter the required fields below</div>
<input type="text" class="data-email validateEmail validateRequired" placeholder="Email" style="width:300px;" />
<br /><br />
<div id="recaptcha" class="g-recaptcha" data-sitekey="6Lc2ygcTAAAAAKBmufbl8YtgFVhx2-ri4KN9c9pP"></div>
<br />
<a href="#" onclick="forgotPassword.submit(1);return false;" class="btn btn-primary">Reset Password</a>
</div>
<div id="forgotPasswordStep1Completed" style="display:none;">
    An email has been sent to you with instructions on resetting your password.
</div>
<div id="forgotPasswordStep2" style="display:none;">
<div class="errorHeader">Please enter the required fields below</div>
<input type="text" class="data-token validateRequired" placeholder="Password Change Token" style="width:300px;" /><br />
<br />
<input type="password" class="data-password validateRequired" placeholder="New Password" style="width:300px;" /><br />
<br />
<input type="password" class="data-passwordconfirm validateRequired" placeholder="Re-enter Password" style="width:300px;" /><br />
<br />
<a href="#" onclick="forgotPassword.submit(2);return false;" class="btn btn-primary">Change Password</a>
</div>
<div id="forgotPasswordStep2Completed" style="display:none;">
    <div style="background-color:#558ED5; color:#ffffff; width:400px; padding:15px;">
    <b>Password successfully changed</b><br />
    <br />
    You will be directed to our main page in <span class="countdown"></span>.<br />
    <a href="Default.aspx?Action=Login">Click here</a> to continue.
    </div>
</div>
</center>
</asp:Content>
