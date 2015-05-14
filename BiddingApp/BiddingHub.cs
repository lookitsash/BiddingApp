using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BiddingApp
{
    public class BiddingHub : Hub
    {
        private static Dictionary<string, BiddingClient> ClientLookup = new Dictionary<string, BiddingClient>();

        public override Task OnConnected()
        {
            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
            BiddingClient curClient = GetBiddingClient_Current();
            if (curClient != null)
            {
                List<InterestData> interests = Statics.Access.Interest_Get(curClient.UserData.ID);
                foreach (InterestData interestData in interests)
                {
                    if (interestData.BidType == BidTypes.Firm)
                    {
                        Statics.Access.Bid_Create(curClient.UserData.ID, interestData.InterestGUID, null, BidTypes.Indicative, interestData.PriceShowing);
                        int interestUserID = Statics.Access.GetUserID(interestData.InterestGUID, GUIDTypes.Interest);
                        Receiver.SyncInterestUpdate(interestUserID, interestData.InterestGUID, true);
                        Receiver.SyncConfirmCancelDeal(interestUserID, interestData.InterestGUID, interestData.BidGUID);
                    }
                }
            }
            return base.OnDisconnected();
        }

        public override Task OnReconnected()
        {
            return base.OnReconnected();
        }

        public void RegisterClient(string sessionGUID)
        {
            try
            {
                UserData userData = Statics.Access.GetUserData(0, sessionGUID, true);
                if (userData != null)
                {
                    if (!ClientLookup.ContainsKey(userData.Email.ToLower())) ClientLookup.Add(userData.Email.ToLower(), new BiddingClient() { ConnectionID = Context.ConnectionId, UserData = userData });
                    else ClientLookup[userData.Email.ToLower()].ConnectionID = Context.ConnectionId;
                }
            }
            catch (Exception ex)
            {
                Log("RegisterClient Exception", ex);
            }
        }

        public void PostChat(string json)
        {
            try
            {
                JToken jToken = JsonConvert.DeserializeObject<JToken>(json);
                string emailTo = jToken.Value<string>("emailTo");
                string message = jToken.Value<string>("message");
                BiddingClient clientFrom = GetBiddingClient_Current();
                Statics.Access.Chat(clientFrom.UserData.ID, emailTo, message);

                BiddingClient clientTo = GetBiddingClient(emailTo);
                if (clientTo != null)
                {
                    Clients.Client(clientTo.ConnectionID).chatReceived(JsonConvert.SerializeObject(new { FirstName = clientFrom.UserData.FirstName, LastName = clientFrom.UserData.LastName, Email = clientFrom.UserData.Email, Message = message }));
                }
            }
            catch (Exception ex)
            {
                Log("PostChat Exception", ex);
            }
        }

        public void BroadcastMessageToAll(string message)
        {
            string connectID = Context.ConnectionId;
            Clients.All.newMessageReceived(message);
            
        }

        public void JoinAGroup(string group)
        {
            Groups.Add(Context.ConnectionId, group);
        }

        public void RemoveFromAGroup(string group)
        {
            Groups.Remove(Context.ConnectionId, group);
        }

        public void BroadcastToGroup(string message, string group)
        {
            Clients.Group(group).newMessageReceived(message);
        }

        private BiddingClient GetBiddingClient_Current()
        {
            foreach (BiddingClient client in ClientLookup.Values)
            {
                if (client.ConnectionID == Context.ConnectionId) return client;
            }
            return null;
        }

        public static BiddingClient GetBiddingClient(string email)
        {
            if (ClientLookup.ContainsKey(email.ToLower())) return ClientLookup[email.ToLower()];
            else return null;
        }

        public static BiddingClient GetBiddingClient(int userID)
        {
            foreach (BiddingClient client in ClientLookup.Values)
            {
                if (client.UserData.ID == userID) return client;
            }
            return null;
        }

        private void Log(string str) { Statics.GetLogger("BiddingHub").Log(str); }
        private void Log(string str, Exception ex) { Statics.GetLogger("BiddingHub").Log(str, ex); }
    }

    public class BiddingClient
    {
        public string ConnectionID;
        public UserData UserData;
    }
}