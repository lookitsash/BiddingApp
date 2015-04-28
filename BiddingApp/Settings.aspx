<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="Settings.aspx.cs" Inherits="BiddingApp.Settings" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            defaultPage.validateSession();
            $("#tabs").tabs();
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="CPH_HEADING" runat="server">SETTINGS</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_CONTENT" runat="server">
<br /><br /><br />
    <center>
    <div id="tabs" class="customTab" style="width:900px;">
  <ul>
    <li><a href="#tabs-1">Contacts</a></li>
    <li><a href="#tabs-2">Admin</a></li>
    <li><a href="#tabs-3">Account</a></li>
  </ul>
  <div id="tabs-1" style="width:870px;">
  <div onclick="" class="addContactButton">+</div>
  <center>
    <table cellspacing="0" style="width:800px; font-size:10pt;">
        <tr>
            <td style="border-bottom: 1px solid #000000;" colspan="2"><b>Active Contacts</b></td>
            <td style="width:150px;border-bottom: 1px solid #000000;">Allow contact to see my item listing and bid</td>
            <td style="text-align:center;border-bottom: 1px solid #000000;">Delete Contact</td>
        </tr>
        <tr><td colspan="4">&nbsp;</td></tr>
        <tr>
            <td style="width:50px;">&nbsp;</td>
            <td>Name (email1)</td>
            <td style="text-align:center;"><input type="checkbox" /></td>
            <td style="text-align:center;"><a href="#">X</a></td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>Name (email2)</td>
            <td>Not an advance user</td>
            <td style="text-align:center;"><a href="#">X</a></td>
        </tr>
    </table>
    <br /><br />

    <table border="0" cellspacing="0" style="width:800px; font-size:10pt;">
        <tr>
            <td style="border-bottom: 1px solid #000000;" colspan="2"><b>Blocked Contacts</b></td>
            <td style="width:150px;border-bottom: 1px solid #000000;"></td>
            <td style="text-align:center;border-bottom: 1px solid #000000;"><span style="visibility:hidden;">Delete Contact</span></td>
        </tr>
        <tr><td colspan="4">&nbsp;</td></tr>
        <tr>
            <td style="width:50px;">&nbsp;</td>
            <td>Name (email3)</td>
            <td colspan="2"><a href="#">Unblock</a></td>
        </tr>
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
        <b>Change Password</b>
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" placeholder="Old Password" />
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" placeholder="New Password" />
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" placeholder="Re-enter Password" />
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="return false;" class="btn btn-primary">Change Password</a><br />
        <br />
        <br />
        <b>Notification Email, email me when:</b><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" />I receive offline messages</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" />New contacts add me</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" />Advance user fills my order</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" />Basic creates a new interest</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" />Basic requests for a price</label><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="checkbox" />Basic leaves an order</label>
        <div style="height:5px;"></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="return false;" class="btn btn-primary">Update</a><br />
    </td>
    </tr>
    </table>
    </center>
  </div>
</div>
</center>
</asp:Content>
