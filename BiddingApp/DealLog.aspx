<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="DealLog.aspx.cs" Inherits="BiddingApp.DealLog" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/DealLog.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_HEADING2" runat="server">DEAL LOG</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="CPH_CONTENT" runat="server">
<br />
<div class="managerAccountDiv">Select Account: <select class="managerAccounts"></select></div>
<br />
<table width="100%" class="logItems">
    <tr style="background-color:#4F81BD; color:#ffffff; font-weight:bold;">
        <td>Date</td>
        <td>Name1</td>
        <td>Company1</td>
        <td>Buy/Sell</td>
        <td>Name2</td>
        <td>Company2</td>
        <td>Product</td>
        <td>Condition</td>
        <td>Quantity</td>
        <td>Price</td>
    </tr>
</table>
</asp:Content>
