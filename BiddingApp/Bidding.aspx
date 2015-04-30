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

            bidding.spawnWindow('biddingWindow', 'BUY Product');
            bidding.spawnWindow('biddingNoOrderWindow', 'BUY Product');
            bidding.spawnWindow('viewInterestWindow', 'SELL Product - fName1');
            bidding.spawnWindow('viewInterestNoOrderWindow', 'BUY Product - fName2');
            bidding.spawnWindow('viewInterestFirmWindow', 'BUY Product - fName2');
        });

        function toggleContactSearch(isVisible) {
            if (isVisible) {
                $('.contactsButton').hide();
                $('.menuContactsLI .contactsSearch').show();
                $('.contactsSearchField').focus()
            }
            else {
                $('.contactsButton').show();
                $('.menuContactsLI .contactsSearch').hide();
            }
        }
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="CPH_CONTENT" runat="server">
    <%
        int biddingWindowUserScrollHeight = 175;
        if (Request.UserAgent.ToUpper().Contains("IE") || Request.UserAgent.ToUpper().Contains("TRIDENT")) biddingWindowUserScrollHeight = 180;
        else if (Request.UserAgent.ToUpper().Contains("FIREFOX")) biddingWindowUserScrollHeight = 183;
     %>
    <div>
        <table cellspacing="0" cellpadding="0" border="0" style="width:100%;">
            <tr>
                <td style="width:1px;"></td>
                <td style="width:30px"><div onclick="modals.showNewInterestModal()" class="addContactButtonBidding">+</div></td>
                <td style="width:120px">
                    
                    <ul id="menu1" class="menu menuInterests">
                        <li><a href="#"><div class="interestsButton">Interests</div></a>
                        <ul class="dropit" style="padding:0px;">
                            <li style="white-space:nowrap;">
                            <a href="#" onclick="bidding.autoArrangeWindows();return false;">Arrange Windows</a>
                            </li>
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
        <div class="biddingWindow" style="display:none;">
          <table style="min-width:435px; left:-10px; height:100%;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#93cddd;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;">
                                    Condition<br />
                                    Quantity<br />
                                    Remarks
                                </div>
                            </td>
                        </tr>
                        <tr style="height:1px;">
                            <td style="width:20px;"></td>
                            <td style="text-align:center; border:1px solid #ffffff;"></td>
                            <td style="width:20px;"></td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;">
                                Order: <b>Working order @ XX.XXXX<br />
                                Good for another AA Hr BB Min</b>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-cancel">X</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Cancel Order</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Check Prices</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
                <td valign="top" style="width:130px;font-size:10pt; background-color:#b7dee8; border-top: 2px solid #4f81bd; border-right: 2px solid #4f81bd; border-bottom: 2px solid #4f81bd;">
                    <div style="max-height:<% =biddingWindowUserScrollHeight %>px; overflow:auto;">
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                    </div>
                </td>
            </tr>
          </table>
        </div>

        <div class="biddingNoOrderWindow" style="display:none;">
          <table style="min-width:435px; left:-10px; height:100%;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#d99694;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;">
                                    Condition<br />
                                    Quantity<br />
                                    Remarks
                                </div>
                            </td>
                        </tr>
                        <tr style="height:1px;">
                            <td style="width:20px;"></td>
                            <td style="text-align:center; border:1px solid #ffffff;"></td>
                            <td style="width:20px;"></td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;">
                                Order: <b>None</b>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-cancel">X</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Leave Order</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Check Prices</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
                <td valign="top" style="width:130px;font-size:10pt; background-color:#b7dee8; border-top: 2px solid #4f81bd; border-right: 2px solid #4f81bd; border-bottom: 2px solid #4f81bd;">
                    <div style="max-height:<% =biddingWindowUserScrollHeight %>px; overflow:auto;">
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                        <div style=" padding:4px; text-align:center; border-bottom:2px solid #4f81bd;">user1</div>
                    </div>
                </td>
            </tr>
          </table>
        </div>

        <div class="viewInterestWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#c3d69b;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style=" font-weight:bold;" colspan="3">
                                <div style="padding:5px;">
                                Status Update
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div style="padding:5px;">
                                                Condition<br />
                                                Quantity<br />
                                                Remarks
                                            </div>
                                        </td>
                                        <td valign="top" align="right">
                                        <span>Showing</span> <div class="priceContainer" style="margin-right:7px; background-color:#b7dee8; color:#4f81bd; font-weight:bold; padding:5px; text-align:center; vertical-align:middle;">00.0000</div>
                                        </td>
                                    </tr>
                                </table>                                
                            </td>
                        </tr>
                        <tr style="height:1px;">
                            <td style="width:20px;"></td>
                            <td style="text-align:center; border:1px solid #ffffff;"></td>
                            <td style="width:20px;"></td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;">
                                    <table style="width:100%;">
                                        <tr>
                                            <td>
                                                Order: <b>Working order @ XX.XXXX<br />
                                                Good for another AA Hr BB Min</b>
                                            </td>
                                            <td align="right">
                                                <a href="#" onclick="return false;" class="btn btn-primary">Fill Order</a>
                                            </td>
                                        </tr>
                                    </table>                                    
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-cancel">X</a>
                                <div class="priceContainer" style="vertical-align:middle;"><input class="priceField" style="height:23px; width:50px;" placeholder="Price" type="text" /></div>
                                <a href="#" onclick="return false;" class="btn btn-primary">Show Indic</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Show Firm</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <div class="viewInterestNoOrderWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#fac090;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style=" font-weight:bold;" colspan="3">
                                <div style="padding:5px;">
                                Status Update
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div style="padding:5px;">
                                                Condition<br />
                                                Quantity<br />
                                                Remarks
                                            </div>
                                        </td>
                                        <td valign="top" align="right">
                                        <span>Showing</span> <div class="priceContainer" style="margin-right:7px; background-color:#b7dee8; color:#4f81bd; font-weight:bold; padding:5px; text-align:center; vertical-align:middle;">00.0000</div>
                                        </td>
                                    </tr>
                                </table>                                
                            </td>
                        </tr>
                        <tr style="height:1px;">
                            <td style="width:20px;"></td>
                            <td style="text-align:center; border:1px solid #ffffff;"></td>
                            <td style="width:20px;"></td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;">
                                    <table style="width:100%;">
                                        <tr>
                                            <td>
                                                Order: <b>None</b>
                                            </td>
                                            <td align="right">
                                                <a href="#" onclick="return false;" class="btn btn-primary" style="visibility:hidden;">Fill Order</a>
                                            </td>
                                        </tr>
                                    </table>                                    
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-cancel">X</a>
                                <div class="priceContainer" style="vertical-align:middle;"><input class="priceField" style="height:23px; width:50px;" placeholder="Price" type="text" /></div>
                                <a href="#" onclick="return false;" class="btn btn-primary">Show Indic</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Show Firm</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <div class="viewInterestFirmWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#ffffff;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style=" font-weight:bold;" colspan="3">
                                <div style="padding:5px;">
                                Status Update
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div style="padding:5px;">
                                                Condition<br />
                                                Quantity<br />
                                                Remarks
                                            </div>
                                        </td>
                                        <td valign="top" align="right">
                                        <span style="font-weight:bold;">Firm</span> <div class="priceContainer" style="margin-right:7px; background-color:#b7dee8; border: 3px solid #ff0000; color:#4f81bd; font-weight:bold; padding:5px; text-align:center; vertical-align:middle;">00.0000</div>
                                        </td>
                                    </tr>
                                </table>                                
                            </td>
                        </tr>
                        <tr style="height:1px;">
                            <td style="width:20px;"></td>
                            <td style="text-align:center; border:1px solid #ffffff;"></td>
                            <td style="width:20px;"></td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;">
                                    <table style="width:100%;">
                                        <tr>
                                            <td>
                                                Order @ XX.XXX<br />
                                                Good until AA hour BB min
                                            </td>
                                            <td align="right">
                                                <a href="#" onclick="return false;" class="btn btn-primary">Fill Order</a>
                                            </td>
                                        </tr>
                                    </table>                                    
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <div class="priceContainer" style="vertical-align:middle;"><input class="priceField" style="height:23px; width:50px;" placeholder="Price" type="text" /></div>
                                <a href="#" onclick="return false;" class="btn btn-primary">Update Firm</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Off</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
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
