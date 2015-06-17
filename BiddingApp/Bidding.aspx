<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Bidding.aspx.cs" Inherits="BiddingApp.Bidding" %>
<asp:Content ID="Content1" ContentPlaceHolderID="CPH_HEAD" runat="server">
    <script type="text/javascript" src="Resources/Scripts/Windows.js"></script>
    <script type="text/javascript" src="Resources/Scripts/Bidding.js"></script>
    <script type="text/javascript">
        defaultPage.isOnline = true;

        function toggleContactSearch(isVisible) {
            if (isVisible) {
                $('.searchContacts').hide();
                $('.contactsButton').hide();
                $('.menuContactsLI .contactsSearch').show();
                $('.contactsSearchField').focus()
            }
            else {
                $('.searchContacts').show();
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
                <td style="width:30px"><div onclick="bidding.showNewInterestModal()" class="addContactButtonBidding">+</div></td>
                <td style="width:120px">
                    
                    <ul id="menu1" class="menu menuInterests">
                        <li class="menuInterestsLI"><a href="#"><div class="interestsButton">Interests</div></a>
                        <ul class="dropit menuInterestsDropdown" style="padding:0px; width:300px;">
                            <li>
                                <div style="background-color:Green; cursor:pointer; border: 1px solid #000000;">
                                    <table width="100%">
                                        <tr>
                                            <td onclick="bidding.spawnWindow(WINDOWTYPE_BIDDING, 'BUY Product');">
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
                <td style="text-align:center;font-size:25pt; font-weight:bold;white-space:nowrap;">
                    <div class="userGreeting" style="display:inline; font-size:11pt; font-weight:normal;"></div>&nbsp;<a href="#" title="Log Out" onclick="modals.logout();return false;"><img style="vertical-align:middle;" class="logoutIcon" /></a>
                    <span style="margin-left:60px;"></span>
                    <a href="Default.aspx" style="color:#000000;"><span style="font-size:25pt;"><b>Bidding</b><i>App</i></span></a>
                    <span style="margin-left:60px;"></span>
                    <a href="DealLog.aspx" title="Deal Log"><img style="vertical-align:middle;" class="logIcon" /></a>
                    <span style="margin-left:60px;"></span>
                    <a href="Settings.aspx" title="Settings"><img style="vertical-align:middle;" class="gearIcon" /></a>
                </td>
                <td style="width:30px"><div style="cursor:pointer;" class="searchContacts"><img src="resources/images/search.png" style="width:25px;" /></div></td>
                <td style="width:120px">
                    <ul id="Ul1" class="menu menuContacts">
                        <li class="menuContactsLI">
                            <a href="#"><div class="contactsButton">Contacts</div></a><div class="contactsSearch"><input class="contactsSearchField" style="width:117px; height:25px;" type="text" /></div>
                            <ul class="dropit-right menuContactsDropdown" style="padding:0px;">
                            </ul>
                        </li>
                    </ul>
                </td>
                <td style="width:30px"><div onclick="bidding.showNewContactModal();" class="addContactButtonBidding">+</div></td>
                <td style="width:1px;"></td>
            </tr>
        </table>        
    </div>
    <div>
        <!-- WINDOWTYPE_BIDDING -->
        <div class="biddingWindow" style="display:none;">
          <table style="min-width:435px; left:-10px; height:100%;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#93cddd;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;" class="interestDetails">
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
                                    <span class="interestPrice" style="font-weight:bold;">Order @ XX.XXXX</span><br />
                                    <span class="interestExpiration" style="font-weight:bold;">Good for another AA Hr BB Min</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-cancel closeWindowButton">X</a>
                                <a href="#" onclick="return false;" class="btn btn-primary cancelOrderButton">Cancel Order</a>
                                <a href="#" onclick="return false;" class="btn btn-primary checkPricesButton">Check Prices</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
                <td valign="top" class="bidList" style="width:130px;font-size:10pt; background-color:#b7dee8; border-top: 2px solid #4f81bd; border-right: 2px solid #4f81bd; border-bottom: 2px solid #4f81bd;">
                    <div class="bidItems" style="max-height:<% =biddingWindowUserScrollHeight %>px; overflow:auto;"></div>
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_BIDDINGNOORDER -->
        <div class="biddingNoOrderWindow" style="display:none;">
          <table style="min-width:435px; left:-10px; height:100%;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#d99694;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;" class="interestDetails">
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
                                <a href="#" class="btn btn-cancel">X</a>
                                <a href="#" class="btn btn-primary leaveOrderButton">Leave Order</a>
                                <a href="#" class="btn btn-primary checkPricesButton">Check Prices</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
                <td valign="top" class="bidList" style="width:130px;font-size:10pt; background-color:#b7dee8; border-top: 2px solid #4f81bd; border-right: 2px solid #4f81bd; border-bottom: 2px solid #4f81bd;">
                    <div class="bidItems" style="max-height:<% =biddingWindowUserScrollHeight %>px; overflow:auto;"></div>
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_VIEWINTEREST -->
        <div class="viewInterestWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#c3d69b;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style=" font-weight:bold;" colspan="3">
                                <div style="padding:5px;" class="interestStatus">
                                Status Update
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div style="padding:5px;" class="interestDetails">
                                                Condition<br />
                                                Quantity<br />
                                                Remarks
                                            </div>
                                        </td>
                                        <td valign="top" align="right">
                                        <span>Showing</span> <div class="priceContainer priceShowing" style="margin-right:7px; background-color:#b7dee8; color:#4f81bd; font-weight:bold; padding:5px; text-align:center; vertical-align:middle;">00.0000</div>
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
                                                <span class="interestPrice" style="font-weight:bold;">Order @ XX.XXXX</span><br />
                                                <span class="interestExpiration" style="font-weight:bold;">Good for another AA Hr BB Min</span>
                                            </td>
                                            <td align="right">
                                                <a href="#" onclick="return false;" class="btn btn-primary fillOrderButton">Fill Order</a>
                                            </td>
                                        </tr>
                                    </table>                                    
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-cancel closeWindowButton">X</a>
                                <div class="priceContainer" style="vertical-align:middle;"><input class="priceField" style="height:23px; width:50px;" placeholder="Price" type="text" /></div>
                                <a href="#" onclick="return false;" class="btn btn-primary showIndicButton">Show Indic</a>
                                <a href="#" onclick="return false;" class="btn btn-primary showFirmButton">Show Firm</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_VIEWINTERESTNOORDER -->
        <div class="viewInterestNoOrderWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#fac090;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style=" font-weight:bold;" colspan="3">
                                <div style="padding:5px;" class="interestStatus">
                                Status Update
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div style="padding:5px;" class="interestDetails">
                                                Condition<br />
                                                Quantity<br />
                                                Remarks
                                            </div>
                                        </td>
                                        <td valign="top" align="right">
                                        <span>Showing</span> <div class="priceContainer priceShowing" style="margin-right:7px; background-color:#b7dee8; color:#4f81bd; font-weight:bold; padding:5px; text-align:center; vertical-align:middle;">00.0000</div>
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
                                                <a href="#" onclick="return false;" class="btn btn-primary fillOrderButton" style="visibility:hidden;">Fill Order</a>
                                            </td>
                                        </tr>
                                    </table>                                    
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-cancel closeWindowButton">X</a>
                                <div class="priceContainer" style="vertical-align:middle;"><input class="priceField" style="height:23px; width:50px;" placeholder="Price" type="text" /></div>
                                <a href="#" onclick="return false;" class="btn btn-primary showIndicButton">Show Indic</a>
                                <a href="#" onclick="return false;" class="btn btn-primary showFirmButton">Show Firm</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_VIEWINTERESTFIRM -->
        <div class="viewInterestFirmWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #000000;">
                    <table style="width:100%; height:100%; background:#ffffff;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style=" font-weight:bold;" colspan="3">
                                <div style="padding:5px;" class="interestStatus">
                                Status Update
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="" colspan="3">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div style="padding:5px;" class="interestDetails">
                                                Condition<br />
                                                Quantity<br />
                                                Remarks
                                            </div>
                                        </td>
                                        <td valign="top" align="right">
                                        <span style="font-weight:bold;">Firm</span> <div class="priceContainer priceShowing" style="margin-right:7px; background-color:#b7dee8; border: 3px solid #ff0000; color:#000000; font-weight:bold; padding:5px; text-align:center; vertical-align:middle;">00.0000</div>
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
                                                <span class="interestPrice">Order @ XX.XXXX</span><br />
                                                <span class="interestExpiration" style="font-weight:bold;">Good for another AA Hr BB Min</span>
                                            </td>
                                            <td align="right">
                                                <a href="#" onclick="return false;" class="btn btn-primary fillOrderButton">Fill Order</a>
                                            </td>
                                        </tr>
                                    </table>                                    
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #000000; padding:5px;" colspan="3">
                                <div class="priceContainer" style="vertical-align:middle;"><input class="priceField" style="height:23px; width:50px;" placeholder="Price" type="text" /></div>
                                <a href="#" onclick="return false;" class="btn btn-primary showFirmButton">Update Firm</a>
                                <a href="#" onclick="return false;" class="btn btn-primary cancelBidsButton">Off</a>
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
                    <div class="footer centered">
                        <div>
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-cancel">Cancel</a>
                            <a href="#" onclick="modals.createNewInterest(INTERESTTYPE_BUY);return false;" class="btn btn-primary">BUY</a>
                            <a href="#" onclick="modals.createNewInterest(INTERESTTYPE_SELL);return false;" class="btn btn-primary">SELL</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div id="checkPricesModal" class="lightbox default" style="display:none; width:500px;">
            <a href="#" onclick="modals.hide();return false;" class="iconclosemodal"></a>
            <section>
                <header>
                    <h2 class="modalTitle">Check Prices</h2>
                </header>
                <div class="contentwrapper">              

                    <section class="panel white solid">
                        <div class="panel-body form">
                            Check Prices with:<br />
                            <label><input type="radio" name="contactSelection" class="allContacts" />All my advance contacts</label><br />
                            <label><input type="radio" name="contactSelection" class="selectedContacts" />Selected advance contacts</label><br />
                            <div class="selectContactsDiv">
                                <br />
                                <table style="width:100%;" class="contactsList">
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
                <div class="footerwrapper">
                    <div class="footer centered">
                        <div>
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-cancel">X</a>
                            <a href="#" onclick="modals.checkPrices(BIDTYPE_REQUESTFIRM);return false;" class="btn btn-primary">Call for FIRM</a>
                            <a href="#" onclick="modals.checkPrices(BIDTYPE_REQUESTINDICATIVE);return false;" class="btn btn-primary">Call for Indic</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div id="leaveOrderModal" class="lightbox default" style="display:none; width:500px;">
            <a href="#" onclick="modals.hide();return false;" class="iconclosemodal"></a>
            <section>
                <header>
                    <h2 class="modalTitle">Leave Order</h2>
                </header>
                <div class="contentwrapper">              

                    <section class="panel white solid">
                        <div class="panel-body form">
                            <div class="errorHeader">Please enter the required fields below</div>
                            Work an order with:<br />
                            <label><input type="radio" name="contactSelection" class="allContacts" />All my advance contacts</label><br />
                            <label><input type="radio" name="contactSelection" class="selectedContacts" />Selected advance contacts</label><br />
                            <div class="selectContactsDiv">
                                <br />
                                <table style="width:100%;" class="contactsList">
                                </table>
                            </div>
                            <br />
                            <input type="text" class="data-price validateRequired" placeholder="Price to work order at" /><br />
                            <br />
                            Good Until:<br />
                            <label><input type="radio" name="goodUntil" class="goodUntilCancelled" />Cancelled</label><br />
                            <input type="radio" name="goodUntil" class="goodUntilDuration" />For <input class="data-hour hourField" style="width:25px;" type="text" /> hour <input style="width:25px;" class="data-minute minuteField" type="text" /> min
                        </div>
                    </section>
                </div>
                <div class="footerwrapper">
                    <div class="footer centered">
                        <div>
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-cancel">X</a>
                            <a href="#" onclick="modals.leaveOrder();return false;" class="btn btn-primary">Confirm</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div id="noAdvanceContactsModal" class="lightbox default" style="display:none; width:500px;">
            <a href="#" onclick="modals.hide();return false;" class="iconclosemodal"></a>
            <section>
                <header>
                    <h2 class="modalTitle">No Advance Contacts</h2>
                </header>
                <div class="contentwrapper">              

                    <section class="panel white solid">
                        <div class="panel-body form">
                            You do not have any active advance contacts yet.  <u>Go to your contact list</u> to grant them permission to see your interest and show prices.
                        </div>
                    </section>
                </div>
                <div class="footerwrapper">
                    <div class="footer centered">
                        <div>
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-cancel">X</a>
                            <a href="#" onclick="return false;" class="btn disabled" style="cursor:default;">Call for FIRM</a>
                            <a href="#" onclick="return false;" class="btn disabled" style="cursor:default;">Call for Indic</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- WINDOWTYPE_CHAT -->
        <div class="chatWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="bottom" style="background-color:#ffffff;font-size:10pt; border:3px solid #4f6228; padding:5px; height:110px;">
                    <div class="chatContent" style="overflow:auto; max-height:106px;">
                        <div class="loadEarlierMessages" style="text-align:center; cursor:pointer; font-size:8pt; color:#000000;">- Load Earlier Messages -</div>
                        <div class="loadingMessages" style="overflow:hidden; text-align:center;"><img src="Resources/Images/spinner.gif" /></div>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="background-color:#4f6228; height:50px; padding:5px;">
                    <textarea class="chatField" style="margin-left:2px; font-size:8pt; width:379px; height:40px;"></textarea><div class="toggleOnlineStatus" style="cursor:pointer; position:absolute; right:50px; top:-30px;"><img src="Resources/images/eye-on.png" style="height:16px;" /></div>
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_CHATCONTACTREQUEST -->
        <div class="chatWindowContactRequest" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="bottom" style="background-color:#ffffff;font-size:10pt; border:3px solid #4f6228; padding:5px; height:110px;">
                    <div class="chatContent" style="overflow:auto; max-height:106px;">
                    </div>
                </td>
            </tr>
            <tr>
                <td style="background-color:#4f6228; height:50px; padding:5px;">
                    <div style="color:#ffffff;"><span class="email"></span> - <a href="#" class="addToContacts" style="color:#ffffff;"><u>Add to contacts</u></a> to start chatting or <a href="#" class="blockUser" style="color:#ffffff;"><u>Block this user</u></a></div><div onclick="" style="cursor:pointer; position:absolute; right:50px; top:-30px;"><img src="Resources/images/eye-on.png" style="height:16px;" /></div>
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_CHATCONTACTNOTSIGNEDUP -->
        <div class="chatWindowContactNotSignedUp" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="bottom" style="background-color:#ffffff;font-size:10pt; border:3px solid #4f6228; padding:5px; height:110px;">
                    <div class="chatContent" style="overflow:auto; max-height:106px;">
                    </div>
                </td>
            </tr>
            <tr>
                <td style="background-color:#4f6228; height:50px; padding:5px;">
                    <div style="color:#ffffff;">User has yet to join</div>
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_DEALCONFIRMPENDING -->
        <div class="dealConfirmPendingWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#ffffff;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <div style="padding:5px;" class="interestDetails">
                                    Company - fName<br />
                                    BUY/SELL Product<br />
                                    Condition<br />
                                    Quantity<br />
                                    Remarks
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="interestPrice" style="padding:5px; text-align:center; font-weight:bold; margin-bottom:12px; font-size:15pt;">
                                DEAL @ XX.YYYY
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;">
                                <a href="#" onclick="return false;" class="btn btn-cancel cancelDealButton">Off (4)</a>
                                <a href="#" onclick="return false;" class="btn btn-primary confirmDealButton">Confirm</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_DEALCONFIRMCANCELLED -->
        <div class="dealConfirmCancelledWindow" style="display:none;">
          <table style="min-width:435px; left:-10px; height:100px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#ffffff;" cellpadding="0" cellspacing="0">
                        <tr style="height:126px;">
                            <td>
                                <div style="padding:5px; text-align:center; font-weight:bold; color:#ff0000;">
                                    Deal has been cancelled.  User has moved their price.
                                </div>
                            </td>
                        </tr>
                        <tr style="height:50px;">
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;">
                                <a href="#" onclick="return false;" class="btn btn-primary okButton">OK</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_DEALCONFIRMING -->
        <div class="dealConfirmingWindow" style="display:none;">
          <table style="min-width:435px; left:-10px; height:100px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#ffffff;" cellpadding="0" cellspacing="0">
                        <tr style="height:149px;">
                            <td>
                                <div style="padding:5px; text-align:center; font-weight:bold;">
                                    Confirming price with advance user...<br />
                                    <br />
                                    <img src="Resources/Images/spinner.gif" />
                                </div>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <!-- WINDOWTYPE_DEALCOMPLETE -->
        <div class="dealCompleteWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #4f81bd;">
                    <table style="width:100%; height:100%; background:#ffffff;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="" colspan="3">
                                <div style="padding:5px;" class="interestDetails">
                                    Company - fName<br />
                                    BUY/SELL Product<br />
                                    Condition<br />
                                    Quantity<br />
                                    Remarks<br />
                                    <br />
                                    Counterparty: Company - fName lName<br />
                                    Price: XX.YY
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-primary closeWindowButton">Close Window</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>  

        <div class="interestInactiveWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #747474;">
                    <table style="width:100%; height:100%; background:#bcbcbc;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td valign="middle" style="height:154px; text-align:center; font-weight:bold; font-size:14pt;">
                                Interest is no longer live
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #747474; padding:5px;" colspan="3">
                                <a href="#" onclick="return false;" class="btn btn-primary closeWindowButton">Close Window</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>
        
        <div class="fillOrderConfirmWindow" style="display:none;">
          <table style="min-width:435px; left:-10px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top" style="font-size:10pt; border:2px solid #747474;">
                    <table style="width:100%; height:100%; background:#ffffff;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <div style="padding:5px;">
                                    Company - fName<br />
                                    BUY/SELL Product<br />
                                    Condition<br />
                                    Quantity<br />
                                    Remarks
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="padding:5px; text-align:center; font-weight:bold; margin-bottom:12px; font-size:15pt;">
                                Order Price @ XX.YYYY
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="white-space:nowrap; text-align:center; background-color:#ffffff; border-top: 2px solid #4f81bd; padding:5px;">
                                <a href="#" onclick="return false;" class="btn btn-cancel">Cancel</a>
                                <a href="#" onclick="return false;" class="btn btn-primary">Confirm Fill</a>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
          </table>
        </div>

        <div id="confirmFillOrderModal" class="lightbox default" style="display:none; width:420px;">
            <a href="#" onclick="modals.hide();return false;" class="iconclosemodal"></a>
            <section>
                <header>
                    <h2 class="modalTitle">Fill Order?</h2>
                </header>
                <div class="contentwrapper">              

                    <section class="panel white solid">
                        <div class="panel-body form" style=" text-align:left;">
                            <div class="interestDetails"></div>
                            <br />
                            <span class="interestPrice" style="font-weight:bold; font-size:12pt;">Order Price @ XX.YY</span>
                        </div>
                    </section>
                </div>
                <div class="footerwrapper">
                    <div class="footer centered">
                        <div>
                            <a href="#" onclick="modals.hide();return false;" class="btn btn-cancel">Cancel</a>
                            <a href="#" onclick="modals.fillOrder();return false;" class="btn btn-primary">Confirm Fill</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</asp:Content>
