<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Bidding.aspx.cs" Inherits="BiddingApp.Bidding" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/Bidding.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            defaultPage.validateSession();
            $('.menuInterests').dropit();

            $('.menuContacts').dropit({
                afterHide: function () {
                    toggleContactSearch(false);
                }
            });

            $('.contactsButton').bind('click.biddingApp', function (e) {
                toggleContactSearch(true);
                $('.menuContactsLI').removeClass('dropit-open');
                $('.menuContactsLI').addClass('dropit-open');
                $('.menuContactsDropdown').show();
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            });

            $('.contactsSearchField').bind('click.biddingApp', function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            });
        });

        function toggleContactSearch(isVisible) {
            if (isVisible) {
                $('.contactsButton').hide();
                $('.contactsSearch').show();
                $('.contactsSearchField').focus()
            }
            else {
                $('.contactsButton').show();
                $('.contactsSearch').hide();
            }
        }
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_CONTENT" runat="server">
    <div>
        <table cellspacing="0" cellpadding="0" border="0" style="width:100%;">
            <tr>
                <td style="width:1px;"></td>
                <td style="width:30px"><div onclick="modals.showNewInterestModal()" class="addContactButtonBidding">+</div></td>
                <td style="width:120px">
                    
                    <ul id="menu1" class="menu menuInterests">
                        <li><a href="#"><div class="interestsButton">Interests</div></a>
                        <ul class="dropit" style="padding:0px;">
                            <li>
                                <div style="background-color:Green; cursor:pointer; border: 1px solid #000000;">
                                    <table width="100%">
                                        <tr>
                                            <td onclick="modals.showInterestModal()">
                                                BUY Product<br />
                                                Order @ X1
                                            </td>
                                            <td style="color:Red; font-weight:bolder;" onclick="bidding.deleteInterest()">
                                            X
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </li>
                        </ul></li>
                    </ul>
                </td>
                <td style="text-align:center;font-size:25pt; font-weight:bold;">
                    <a href="Settings.aspx"><img src="Resources/Images/gear.png" /></a>
                    <span style="margin-left:60px;"></span>
                    <a href="Default.aspx" style="color:#000000;"><span style="font-size:25pt;"><b>Bidding</b><i>App</i></span></a>
                    <span style="margin-left:60px;"></span>
                    <a href="#" onclick="modals.logout();return false;"><img src="Resources/Images/logout.png" /></a>
                </td>
                <td style="width:120px">
                    <ul id="Ul1" class="menu menuContacts">
                        <li class="menuContactsLI">
                            <a href="#"><div class="contactsButton">Contacts</div></a><div class="contactsSearch"><input class="contactsSearchField" style="height:25px;" type="text" /></div>
                            <ul class="dropit-right menuContactsDropdown" style="padding:0px;">
                                <li>
                                    <div style="background-color:white; cursor:pointer; white-space:nowrap;">
                                        <table width="100%">
                                            <tr>
                                                <td>
                                                    fNadfdsfdsme lNamedsfds dsf
                                                </td>
                                                <td align="right">
                                                    <img src="Resources/Images/green_light_16.png" />
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </li>
                                <li>
                                    <div style="background-color:white; cursor:pointer;">
                                        <table width="100%">
                                            <tr>
                                                <td>
                                                    fName lName
                                                </td>
                                                <td align="right">
                                                    <img src="Resources/Images/red_light_16.png" />
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </td>
                <td style="width:30px"><div onclick="modals.showNewContactModal();" class="addContactButtonBidding">+</div></td>
                <td style="width:1px;"></td>
            </tr>
        </table>        
    </div>
    <div>
        <div class="dialogBox" style="display:none;" title="Basic dialog">
          <p>This is the default dialog which is useful for displaying information. The dialog window can be moved, resized and closed with the 'x' icon.</p>
        </div>

        <div id="createInterestModal" class="lightbox default" style="display:none; width:420px;">
            <a href="#" onclick="modals.hide();return false;" class="iconclosemodal"></a>
            <section>
                <header>
                    <h2 class="modalTitle">Create New Interest</h2>
                </header>
                <div class="contentwrapper">              

                    <section class="panel white solid">
                        <div class="panel-body form" style=" text-align:center;">
                            <div class="errorHeader">Please enter the required fields below</div>
                            <input type="text" style="width:300px;" class="data-product validateRequired" placeholder="Product" />
                            <div style="height:5px;"></div>
                            <input type="text" style="width:300px;" class="data-condition" placeholder="Condition" />
                            <div style="height:5px;"></div>
                            <input type="text" style="width:300px;" class="data-quantity" placeholder="Quantity" />
                            <div style="height:5px;"></div>
                            <input type="text" style="width:300px;" class="data-remarks" placeholder="Remarks" /><br />
                            <br />
                        </div>
                    </section>
                </div>
                <div class="footerwrapper">
                    <div class="footer">
                        <div class="right">
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-cancel">Cancel</a>
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-primary">BUY</a>
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-primary">SELL</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</asp:Content>
