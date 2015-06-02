<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="ContactUs.aspx.cs" Inherits="BiddingApp.ContactUs" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/ContactUs.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_HEADING" runat="server">CONTACT US</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="CPH_CONTENT" runat="server">
<center>
<div id="contactFormSubmitted" style="display:none;">
    <br /><br />
    Your message has been sent.  We will get back to you shortly!<br />
</div>
<div id="contactForm">
    <div class="outSession"><br /><i>Please sign in before coming back to this page if inquiry is user specific</i></div>
    <br />

    <table style="width:500px;" cellspacing="10">
        <tr class="errorHeader"><td>Please enter the required fields below</td></tr>
        <tr class="outSession">
            <td><input type="text" class="data-name validateRequired" placeholder="Your Name" style="width:379px;" /></td>
        </tr>
        <tr class="outSession">
            <td><input type="text" class="data-email validateEmail validateRequired" placeholder="Your Email Contact" style="width:379px;" /></td>
        </tr>
        <tr class="inSession">
            <td>You are signed in as <span class="userEmail"></span></td>
        </tr>
        <tr>
            <td>
                <select class="data-topic validateRequired">
                    <option value="Select">-- Select Topic --</option>
                    <option value="Registration">Registration</option>
                    <option value="Contacts">Contacts</option>
                    <option value="Item Sale">Item Sale</option>
                    <option value="Membership">Membership</option>
                    <option value="Admin">Admin</option>
                    <option value="Other">Other</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>
                <textarea class="data-message validateRequired" style="width:379px; height:150px;" placeholder="Please tell us how we can help"></textarea>
            </td>
        </tr>
        <tr>
            <td>
                <br />
                <a href="#" onclick="contactUs.submit();return false;" class="btn btn-primary">Submit</a>
            </td>
        </tr>
    </table>
</div>
</center>
</asp:Content>
