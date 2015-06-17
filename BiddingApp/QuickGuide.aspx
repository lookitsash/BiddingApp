<%@ Page Title="" Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" CodeBehind="QuickGuide.aspx.cs" Inherits="BiddingApp.QuickGuide" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            $('.menuItem .menuContent').hide();
            $('.menuItem .menuLabel').css('cursor', 'pointer');
            $('.menuItem .menuLabel').bind('click.biddingApp', function () {
                var menuItem = $(this).parent();
                var menuContent = $('.menuContent', menuItem);
                if (resources.uiIsVisible(menuContent)) {
                    $('img', menuItem).attr('src', 'Resources/Images/ArrowClose.jpg');
                    menuContent.hide();
                }
                else {
                    $('img', menuItem).attr('src', 'Resources/Images/ArrowOpen.jpg');
                    menuContent.show();
                }
            });

            var defaultSection = resources.getQuerystringParam('Section');
            if (defaultSection != null) {
                $('#' + defaultSection + ' .menuLabel').trigger('click');
            }
        });
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_HEADING" runat="server">QUICK GUIDE</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="CPH_HEADING2" runat="server">
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="CPH_CONTENT" runat="server">
    <br />
    <div id="AddNewContacts" class="menuItem" style="margin-left:40px;">
        <div class="menuLabel"><img style="vertical-align:middle;" src="Resources/Images/ArrowClose.jpg" /><span style="font-weight:bold; font-size:16pt;">&nbsp;Add new contacts</span></div>
        <div class="menuContent" style="margin-left:40px; margin-top:5px;">
            Filler text<br />
            Filler text<br />
            Filler text
        </div>
    </div>
    <div id="CreateNewInterest" class="menuItem" style="margin-left:40px;">
        <div class="menuLabel"><img style="vertical-align:middle;" src="Resources/Images/ArrowClose.jpg" /><span style="font-weight:bold; font-size:16pt;">&nbsp;Create new interest</span></div>
        <div class="menuContent" style="margin-left:40px; margin-top:5px;">
            Filler text<br />
            Filler text<br />
            Filler text
        </div>
    </div>
    <div id="GetPrices" class="menuItem" style="margin-left:40px;">
        <div class="menuLabel"><img style="vertical-align:middle;" src="Resources/Images/ArrowClose.jpg" /><span style="font-weight:bold; font-size:16pt;">&nbsp;Get prices</span></div>
        <div class="menuContent" style="margin-left:40px; margin-top:5px;">
            Filler text<br />
            Filler text<br />
            Filler text
        </div>
    </div>
    <div id="ShowPrices" class="menuItem" style="margin-left:40px;">
        <div class="menuLabel"><img style="vertical-align:middle;" src="Resources/Images/ArrowClose.jpg" /><span style="font-weight:bold; font-size:16pt;">&nbsp;Show prices</span></div>
        <div class="menuContent" style="margin-left:40px; margin-top:5px;">
            Filler text<br />
            Filler text<br />
            Filler text
        </div>
    </div>

</asp:Content>
