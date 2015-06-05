<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="ChatLog.aspx.cs" Inherits="BiddingApp.ChatLog" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/ChatLog.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_HEADING2" runat="server">CHAT LOG</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="CPH_CONTENT" runat="server">
<center>
<select class="managerAccounts" style="height:30px;" ></select>
<select class="managerAccountContacts" style="height:30px;"></select>
<a href="#" onclick="chatLog.loadChatLogs();return false;" class="btn btn-primary loadChatButton">Load</a><br />
<br />
<div class="chatLog" style="width:750px; height:400px; border:1px solid #000000; text-align:left; overflow-y:auto;"></div>
</center>
</asp:Content>
