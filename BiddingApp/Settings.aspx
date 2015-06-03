<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="Settings.aspx.cs" Inherits="BiddingApp.Settings" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/SettingsPage.js"></script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="CPH_HEADING" runat="server">SETTINGS</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_CONTENT" runat="server">
<br /><br /><br />
    <center>
    <div id="tabs" class="customTab" style="width:900px;">
  <ul>
    <li><a href="#tabs-1" id="contactsTab">Contacts</a></li>
    <li><a href="#tabs-2" id="adminTab">Admin</a></li>
    <li><a href="#tabs-3" id="accountTab">Account</a></li>
  </ul>
  <div id="tabs-1" style="width:870px;">
  <div onclick="settingsPage.showNewContactModal()" class="addContactButton">+</div>
  <center>
    <table class="contactsList" cellspacing="0" style="width:800px; font-size:10pt;">
        <tr>
            <td style="border-bottom: 1px solid #000000;" colspan="2"><b>Active Contacts</b></td>
            <td style="width:150px;border-bottom: 1px solid #000000;">Allow contact to see my item listing and bid</td>
            <td style="text-align:center;border-bottom: 1px solid #000000;">Delete Contact</td>
        </tr>
        <tr><td colspan="4">&nbsp;</td></tr>
    </table>
    <br /><br />

    <table class="blockedContactsList" border="0" cellspacing="0" style="width:800px; font-size:10pt;">
        <tr>
            <td style="border-bottom: 1px solid #000000;" colspan="2"><b>Blocked Contacts</b></td>
            <td style="width:150px;border-bottom: 1px solid #000000;"></td>
            <td style="text-align:center;border-bottom: 1px solid #000000;"><span style="visibility:hidden;">Delete Contact</span></td>
        </tr>
        <tr><td colspan="4">&nbsp;</td></tr>
    </table>

    </center>
  </div>
  <div id="tabs-2">
    <center>
    <table cellspacing="0" style="width:800px; font-size:10pt;">
    <tr>
    <td>
        <label><input type="checkbox" />Send Monthly Deal Log to:</label>
        <div style="height:5px;"></div>
        <span style="margin-left:50px;">&nbsp;</span><input type="text" placeholder="Email1, email2 ..." />&nbsp;&nbsp;&nbsp;<a href="#" onclick="return false;" class="btn btn-primary" style="height:10px; padding:3px; vertical-align:initial; display:inline;"> UPDATE </a><br />
        <br />
        <label><input type="checkbox" />Send Monthly Chat Log to:</label>
        <div style="height:5px;"></div>
        <span style="margin-left:50px;">&nbsp;</span><input type="text" placeholder="Email1, email2 ..." />&nbsp;&nbsp;&nbsp;<a href="#" onclick="return false;" class="btn btn-primary" style="height:10px; padding:3px; vertical-align:initial; display:inline;"> UPDATE </a><br />
        <br /><br />
        Your account is currently being monitored by: NO ONE<br />
        <br />
        Grand access to Manager.  He/she will have up-to-date access<br />
        of your item sales/purchases and conversations.<br />
        <br />
        <a href="#" onclick="return false;" class="btn btn-primary">Add Manager</a>
    </td>
    </tr>
    </table>
    </center>
  </div>
  <div id="tabs-3">
    <center>
    <table cellspacing="0" style="width:800px; font-size:10pt;">
    <tr>
    <td>
        <div id="changePassword">
        <b>Change Password</b>
        <div class="errorHeader">Please enter the required fields below</div>
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="password" class="data-oldpassword validateRequired" placeholder="Old Password" />
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="password" class="data-password validateRequired" placeholder="New Password" />
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="password" class="data-passwordconfirm validateRequired" placeholder="Re-enter Password" />
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="settingsPage.changePassword();return false;" class="btn btn-primary">Change Password</a><br />
        </div>
        <br />
        <div id="notificationTypes">
        <b>Notification Email, email me when:</b><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType1" />I receive offline messages</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType2" />New contacts add me</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType3" />Advance user fills my order</label><br />
        <div class="advanceOnly">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType4" />Basic creates a new interest</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType5" />Basic requests for a price</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType6" />Basic leaves an order</label>
        </div>
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="settingsPage.updateNotifications();return false;" class="btn btn-primary">Update</a><br />
        </div>
    </td>
    </tr>
    </table>
    </center>
  </div>
</div>
</center>
</asp:Content>
