<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="ValidateEmail.aspx.cs" Inherits="BiddingApp.ValidateEmail" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/ValidateEmail.js"></script>
    <style>
        #emailVerified a { text-decoration: underline; }
        #emailVerified a:visited { color:#ffffff; }
        .hrefUnderline a { text-decoration: underline; }
        .hrefUnderline a:visited { color:#000000; }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_HEADING" runat="server">VALIDATE EMAIL</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="CPH_CONTENT" runat="server">
<center>
<br />
<div id="emailVerified" style="display:none;">
    <br /><br />
    <div style="background-color:#558ED5; color:#ffffff; width:400px; padding:15px;">
    <b>Email address <span class="email"></span> successfully verified</b><br />
    <br />
    You will be directed to our main page in <span class="countdown"></span>.<br />
    <a href="Default.aspx?Action=Login">Click here</a> to continue.
    </div>
</div>
<div id="emailNotVerified">
    <div class="hrefUnderline">
    You should be receiving our verification email shortly.<br />
    Please check your junk folder if you did not receive it.<br />
    If you need assistance, <a href="ContactUs.aspx">contact us</a>.</div>
    <br />
    <table style="width:500px;" cellspacing="10">
        <tr class="errorHeader"><td>Please enter the required fields below</td></tr>
        <tr>
            <td align="center"><input type="text" class="data-email validateEmail validateRequired" placeholder="Email" style="width:379px;" /></td>
        </tr>
        <tr>
            <td align="center"><input type="text" class="data-token validateRequired" placeholder="Token" style="width:379px;" /></td>
        </tr>
        <tr>
            <td align="center">
                <br />
                <a href="#" onclick="validateEmail.submit();return false;" class="btn btn-primary">Validate Email</a>
            </td>
        </tr>
    </table>
</div>
</center>
</asp:Content>
