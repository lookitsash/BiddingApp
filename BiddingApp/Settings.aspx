<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="Settings.aspx.cs" Inherits="BiddingApp.Settings" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/SettingsPage.js"></script>
    <style>
        .hrefUnderline a { text-decoration: underline; }
        .hrefUnderline a:visited { color:#000000; }
    </style>
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
  <div id="tabs-1" style="width:870px; display:none;">
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
  <div id="tabs-2" style="display:none;">
    <center>
    <table cellspacing="0" style="width:800px; font-size:10pt;">
    <tr>
    <td>
        <div id="monthlyLogs">
        <label><input type="checkbox" class="data-deallog" />Send Monthly Deal Log to:</label>
        <div style="height:5px;"></div>
        <span style="margin-left:50px;">&nbsp;</span><input class="data-deallogemails" type="text" style="width:350px;" placeholder="Email1, email2 ..." />&nbsp;&nbsp;&nbsp;<a href="#" onclick="settingsPage.updateMonthlyLogEmails(true, false);return false;" class="btn btn-primary updateDealLogButton" style="height:10px; padding:3px; vertical-align:initial; display:inline;"> UPDATE </a><br />
        <br />
        <label><input type="checkbox" class="data-chatlog" />Send Monthly Chat Log to:</label>
        <div style="height:5px;"></div>
        <span style="margin-left:50px;">&nbsp;</span><input class="data-chatlogemails" type="text" style="width:350px;" placeholder="Email1, email2 ..." />&nbsp;&nbsp;&nbsp;<a href="#" onclick="settingsPage.updateMonthlyLogEmails(false, true);return false;" class="btn btn-primary updateChatLogButton" style="height:10px; padding:3px; vertical-align:initial; display:inline;"> UPDATE </a><br />
        </div>
        <br />
        <div id="managers" class="hrefUnderline">Your account is currently being monitored by: NO ONE</div>
        <br />
        Grand access to Manager.  He/she will have up-to-date access<br />
        of your item sales/purchases and conversations.<br />
        <br />
        <a href="#" onclick="modals.showAddManagerModal();return false;" class="btn btn-primary">Add Manager</a>
    </td>
    </tr>
    </table>
    </center>
  </div>
  <div id="tabs-3" style="display:none;">
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
        <br />
        <div id="soundNotificationTypes">
            <b>Play sound notification when:</b><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType7" />New message from contact</label><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType8" />Contact calls for indicative prices</label><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" class="notificationType9" />Contact calls for firm prices</label><br />
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

<div id="addManagerModal" class="lightbox default" style="display:none; width:420px;">
    <a href="#" onclick="modals.hide();return false;" class="iconclosemodal"></a>
    <section>
        <header>
            <h2 class="modalTitle">Add Manager</h2>
        </header>
        <div class="contentwrapper">              

            <section class="panel white solid">
                <div class="panel-body form" style=" text-align:center;">
                    <div class="errorHeader">Please enter the required fields below</div>
                    <input type="text" style="width:300px;" class="data-firstName validateRequired" placeholder="First Name of Manager" />
                    <div style="height:5px;"></div>
                    <input type="text" style="width:300px;" class="data-lastName validateRequired" placeholder="Last Name of Manager" />
                    <div style="height:5px;"></div>
                    <input type="text" style="width:300px;" class="data-email validateRequired validateEmail" placeholder="Email of Manager" />
                    <br />
                </div>
            </section>
        </div>
        <div class="footerwrapper">
            <div class="footer centered">
                <div>
                    <a href="#" onclick="modals.hide();return false;" class="btn btn-cancel">Cancel</a>
                    <a href="#" onclick="modals.addManager();return false;" class="btn btn-primary">Grant Access</a>
                </div>
            </div>
        </div>
    </section>
</div>
</asp:Content>
