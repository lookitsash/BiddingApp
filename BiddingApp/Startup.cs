using Microsoft.Owin;
using Owin;
using Microsoft.AspNet.SignalR;

namespace BiddingApp
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var hubConfiguration = new HubConfiguration();
            hubConfiguration.EnableDetailedErrors = true;
            
            //app.MapHubs(
            //app.MapSignalR(hubConfiguration);

            // Any connection or hub wire up and configuration should go here
            app.MapHubs(hubConfiguration);
        }

    }
}