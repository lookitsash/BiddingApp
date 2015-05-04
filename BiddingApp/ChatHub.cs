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
    public class ChatHub : Hub
    {
        private static Dictionary<string, ChatClient> ClientLookup = new Dictionary<string, ChatClient>();

        public override Task OnConnected()
        {
            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
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
                    if (!ClientLookup.ContainsKey(userData.Email.ToLower())) ClientLookup.Add(userData.Email.ToLower(), new ChatClient() { ConnectionID = Context.ConnectionId, UserData = userData });
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
                ChatClient clientFrom = GetChatClient_Current();
                Statics.Access.Chat(clientFrom.UserData.ID, emailTo, message);

                ChatClient clientTo = GetChatClient(emailTo);
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

        private ChatClient GetChatClient_Current()
        {
            foreach (ChatClient client in ClientLookup.Values)
            {
                if (client.ConnectionID == Context.ConnectionId) return client;
            }
            return null;
        }

        private ChatClient GetChatClient(string email)
        {
            if (ClientLookup.ContainsKey(email.ToLower())) return ClientLookup[email.ToLower()];
            else return null;
        }

        private void Log(string str) { Statics.GetLogger("ChatHub").Log(str); }
        private void Log(string str, Exception ex) { Statics.GetLogger("ChatHub").Log(str, ex); }
    }

    public class ChatClient
    {
        public string ConnectionID;
        public UserData UserData;
    }
}