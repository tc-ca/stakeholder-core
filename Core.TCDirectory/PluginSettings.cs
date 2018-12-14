using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.TCDirectory
{
    public static class PluginSettings
    {
        public static string ServiceUrl { get { return "http://amstcappsdev2/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; } }        // Dev
        ////public static string ServiceUrl { get { return "https://tcappstest.tc.gc.ca/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; } } // Acc
        ////public static string ServiceUrl { get { return "https://tcapps.tc.gc.ca/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; } }     // Prod
        public static string ApiKey { get { return "f4142218-71e9-473c-b1b7-ae62dbde1275"; } }
    }
}
