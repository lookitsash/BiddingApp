<%@ Page Title="" Language="C#" MasterPageFile="~/Default.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="BiddingApp.Default" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <link rel="stylesheet" href="Resources/Scripts/jquery.fullPage/jquery.fullPage.css" type="text/css" />
    <script type="text/javascript" src="Resources/Scripts/jquery.fullPage/jquery.fullPage.js"></script>

    <script type="text/javascript">
        $(document).ready(function () {
            $('#fullpage').fullpage({
                anchors: ['intro', 'features', 'tour', 'packages'],
                navigation: true,
                navigationPosition: 'right',
                loopTop: true,
                loopBottom: true
            });
        });
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_CONTENT" runat="server">
    <center>
    <div id="fullpage" style="z-index:-1;">
        <div class="section">1st Slide: Introduction</div>
        <div class="section">2nd Slide: Features</div>
        <div class="section">3rd Slide: Video Tour</div>
        <div class="section">
            <table cellpadding="5" cellspacing="0" style="text-align:left;" >
                <tr>
                    <td style="width:300px;border:1px solid #000000;vertical-align:top;">
                        <div style="text-align:center;">
                            <h3>Personal</h3>
                        </div>
                        <ul>
                        <li>Bullet 1</li>
                        <li>Bullet 2</li>
                        </ul>
                        <div style="text-align:center;">
                            <a href="#" class="btn btn-primary">Add To Cart</a>
                        </div>
                        <br />
                    </td>
                    <td style="width:25px;"></td>
                    <td style="width:300px;border:1px solid #000000;vertical-align:top;">
                        <div style="text-align:center;">
                            <h3>Business</h3>
                        </div>
                        <ul>
                        <li>Bullet 1</li>
                        <li>Bullet 2</li>
                        </ul>
                        <div style="text-align:center;">
                            <a href="#" class="btn btn-primary">Add To Cart</a>
                        </div>
                        <br />
                    </td>
                    <td style="width:25px;"></td>
                    <td style="width:300px;border:1px solid #000000;vertical-align:top;">
                        <div style="text-align:center;">
                            <h3>Business Plus</h3>
                        </div>
                        <ul>
                        <li>Bullet 1</li>
                        <li>Bullet 2</li>
                        </ul>
                        <div style="text-align:center;">
                            <a href="#" class="btn btn-primary">Add To Cart</a>
                        </div>
                        <br />
                    </td>
                </tr>
            </table>
        </div>
    </div>
    </center>
    
</asp:Content>
